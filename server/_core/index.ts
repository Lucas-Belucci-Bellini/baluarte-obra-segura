import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { ENV } from "./env";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCategories, getMaterials, getMaterialById,
  getToolCategories, getTools, getToolById,
  getKnowledgeBaseArticles, getCalculators, globalSearch,
  createConversation, getConversationById, getConversationMessages, saveChatMessage,
} from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ─── Public REST API v1 ─────────────────────────────────────────────────────
  const api = express.Router();

  api.get("/categories", async (_req, res) => {
    res.json(await getCategories());
  });

  api.get("/materials", async (req, res) => {
    const { categoryId, search, riskLevel, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const mats = await getMaterials({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search: search || undefined,
      riskLevel: riskLevel || undefined,
      featured: featured === "true" ? true : undefined,
      limit: Math.min(parseInt(limit) || 20, 100),
      offset: parseInt(offset) || 0,
    });
    res.json(mats);
  });

  api.get("/materials/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const mat = await getMaterialById(id);
    if (!mat) return res.status(404).json({ error: "Not found" });
    res.json(mat);
  });

  api.get("/tool-categories", async (_req, res) => {
    res.json(await getToolCategories());
  });

  api.get("/tools", async (req, res) => {
    const { toolCategoryId, search, powerType, professionLevel, limit = "20", offset = "0" } = req.query as Record<string, string>;
    const ts = await getTools({
      toolCategoryId: toolCategoryId ? parseInt(toolCategoryId) : undefined,
      search: search || undefined,
      powerType: powerType || undefined,
      professionLevel: professionLevel || undefined,
      limit: Math.min(parseInt(limit) || 20, 100),
      offset: parseInt(offset) || 0,
    });
    res.json(ts);
  });

  api.get("/tools/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const tool = await getToolById(id);
    if (!tool) return res.status(404).json({ error: "Not found" });
    res.json(tool);
  });

  api.get("/articles", async (req, res) => {
    const { categoryId, featured, limit = "10", offset = "0" } = req.query as Record<string, string>;
    res.json(await getKnowledgeBaseArticles({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      featured: featured === "true" ? true : undefined,
      limit: Math.min(parseInt(limit) || 10, 50),
      offset: parseInt(offset) || 0,
    }));
  });

  api.get("/calculators", async (req, res) => {
    const { categorySlug, featured } = req.query as Record<string, string>;
    res.json(await getCalculators({
      categorySlug: categorySlug || undefined,
      featured: featured === "true" ? true : undefined,
    }));
  });

  api.get("/search", async (req, res) => {
    const { q } = req.query as Record<string, string>;
    if (!q || q.trim().length < 1) return res.status(400).json({ error: "Query required" });
    res.json(await globalSearch(q, 10));
  });

  app.use("/api/v1", api);

  // ─── Chat SSE streaming ────────────────────────────────────────────────────
  app.post("/api/chat/stream", async (req, res) => {
    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
    try { user = await sdk.authenticateRequest(req); } catch { /* anon */ }

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { message, conversationId, language = "PT" } = req.body as {
      message: string;
      conversationId?: number;
      language?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "message required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      // Resolve or create conversation
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(user.id, language);
      } else {
        const conv = await getConversationById(user.id, convId);
        if (!conv) {
          send({ type: "error", message: "Conversation not found" });
          res.end();
          return;
        }
      }

      // Build message history
      const history = await getConversationMessages(convId, 20);
      const anthropicMessages: Anthropic.MessageParam[] = history.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      anthropicMessages.push({ role: "user", content: message.trim() });

      // Save user message
      await saveChatMessage(convId, "user", message.trim());

      const isPT = language === "PT";
      const systemPrompt = isPT
        ? `Você é o Mestre de Obra Digital do WikiBuild Baluarte — um assistente especializado em construção civil, segurança de materiais e boas práticas de obra para o Brasil.

Seu estilo: direto, prático, técnico sem ser acadêmico. Use linguagem acessível para pedreiros, engenheiros e donos de obra. Quando citar produtos ou materiais, sempre inclua o link no formato [Nome do Material](/material/ID).

Ferramentas disponíveis: use search_materials, search_tools e search_articles para buscar informações atualizadas no banco de dados do WikiBuild antes de responder sobre produtos específicos.

Sempre que mencionar um material ou ferramenta específica, busque pelo nome para confirmar as informações e incluir o link correto.`
        : `You are the Digital Master Builder of WikiBuild Baluarte — a specialized assistant for civil construction, material safety and best practices for Brazilian construction sites.

Your style: direct, practical, technical but accessible. Use language suitable for masons, engineers and site owners. When citing products or materials, always include the link as [Material Name](/material/ID).

Available tools: use search_materials, search_tools and search_articles to look up up-to-date information in the WikiBuild database before answering about specific products.

Always search for specific materials or tools by name to confirm information and include the correct link.`;

      const tools: Anthropic.Tool[] = [
        {
          name: "search_materials",
          description: isPT
            ? "Busca materiais de construção no banco de dados WikiBuild pelo nome ou características."
            : "Searches construction materials in the WikiBuild database by name or characteristics.",
          input_schema: {
            type: "object" as const,
            properties: { query: { type: "string", description: "Search term" } },
            required: ["query"],
          },
        },
        {
          name: "search_tools",
          description: isPT
            ? "Busca ferramentas e equipamentos no banco de dados WikiBuild."
            : "Searches tools and equipment in the WikiBuild database.",
          input_schema: {
            type: "object" as const,
            properties: { query: { type: "string", description: "Search term" } },
            required: ["query"],
          },
        },
        {
          name: "search_articles",
          description: isPT
            ? "Busca artigos da base de conhecimento sobre segurança e técnicas de construção."
            : "Searches knowledge base articles about safety and construction techniques.",
          input_schema: {
            type: "object" as const,
            properties: { query: { type: "string", description: "Search term" } },
            required: ["query"],
          },
        },
      ];

      const anthropicApiKey = ENV.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        send({ type: "error", message: isPT ? "Chave API Anthropic não configurada." : "Anthropic API key not configured." });
        res.end();
        return;
      }

      const client = new Anthropic({ apiKey: anthropicApiKey });

      let fullResponse = "";
      let totalTokens = 0;
      let continueLoop = true;
      let currentMessages = [...anthropicMessages];

      while (continueLoop) {
        const stream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          tools,
          messages: currentMessages,
        });

        const toolUseBlocks: Anthropic.ToolUseBlock[] = [];
        let currentToolUse: { id: string; name: string; input: string } | null = null;

        for await (const event of stream) {
          if (event.type === "content_block_start") {
            if (event.content_block.type === "text") {
              // text block starting — nothing to do
            } else if (event.content_block.type === "tool_use") {
              currentToolUse = { id: event.content_block.id, name: event.content_block.name, input: "" };
              send({ type: "tool_start", tool: event.content_block.name });
            }
          } else if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              fullResponse += event.delta.text;
              send({ type: "delta", content: event.delta.text });
            } else if (event.delta.type === "input_json_delta" && currentToolUse) {
              currentToolUse.input += event.delta.partial_json;
            }
          } else if (event.type === "content_block_stop") {
            if (currentToolUse) {
              try {
                currentToolUse.input = JSON.parse(currentToolUse.input || "{}");
              } catch { currentToolUse.input = {} as any; }
              toolUseBlocks.push({
                type: "tool_use",
                id: currentToolUse.id,
                name: currentToolUse.name,
                input: currentToolUse.input as any,
              });
              currentToolUse = null;
            }
          } else if (event.type === "message_delta") {
            totalTokens = event.usage?.output_tokens ?? 0;
          }
        }

        const finalMsg = await stream.finalMessage();

        if (finalMsg.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
          // Execute tools and continue
          currentMessages.push({ role: "assistant", content: finalMsg.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const tb of toolUseBlocks) {
            const input = tb.input as { query: string };
            let resultText = "";
            try {
              if (tb.name === "search_materials") {
                const results = await getMaterials({ search: input.query, limit: 5 });
                resultText = results.length === 0
                  ? (isPT ? "Nenhum material encontrado." : "No materials found.")
                  : results.map((m: any) => `- [${isPT ? m.namePortuguese : m.nameEnglish}](/material/${m.id}): ${isPT ? m.descriptionPortuguese ?? "" : m.descriptionEnglish ?? ""}`).join("\n");
              } else if (tb.name === "search_tools") {
                const results = await getTools({ search: input.query, limit: 5 });
                resultText = results.length === 0
                  ? (isPT ? "Nenhuma ferramenta encontrada." : "No tools found.")
                  : results.map((t: any) => `- [${isPT ? t.namePortuguese : t.nameEnglish}](/tools): ${isPT ? t.descriptionPortuguese ?? "" : t.descriptionEnglish ?? ""}`).join("\n");
              } else if (tb.name === "search_articles") {
                const results = await getKnowledgeBaseArticles({ search: input.query, limit: 5 });
                resultText = results.length === 0
                  ? (isPT ? "Nenhum artigo encontrado." : "No articles found.")
                  : results.map((a: any) => `- [${isPT ? a.titlePortuguese : a.titleEnglish}](/knowledge-base): ${isPT ? a.summaryPortuguese ?? "" : a.summaryEnglish ?? ""}`).join("\n");
              }
            } catch (e) {
              resultText = `Error: ${e}`;
            }
            send({ type: "tool_result", tool: tb.name, count: resultText.split("\n").length });
            toolResults.push({ type: "tool_result", tool_use_id: tb.id, content: resultText });
          }
          currentMessages.push({ role: "user", content: toolResults });
        } else {
          continueLoop = false;
        }
      }

      // Save assistant message
      await saveChatMessage(convId, "assistant", fullResponse, totalTokens);
      send({ type: "done", conversationId: convId });
    } catch (err: any) {
      console.error("Chat stream error:", err);
      send({ type: "error", message: err?.message ?? "Internal error" });
    }

    res.end();
  });

  // ─── tRPC ──────────────────────────────────────────────────────────────────
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using ${port}`);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Public API: http://localhost:${port}/api/v1/`);
  });
}

startServer().catch(console.error);
