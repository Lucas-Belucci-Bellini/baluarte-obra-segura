import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { sdk } from "./sdk";
import { ENV } from "./env";
import Anthropic from "@anthropic-ai/sdk";
import {
  getCategories, getMaterials, getMaterialById,
  getToolCategories, getTools, getToolById,
  getKnowledgeBaseArticles, getCalculators, globalSearch,
  getUserByOpenId,
  createConversation, getConversationById, getConversationMessages, saveChatMessage,
  getPartnerByApiKey, upsertPartnerPrices, getPartnerProducts, getPartnerSyncLogs,
  checkAndIncrementQuota,
} from "../db";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ─── Public REST API v1 ───────────────────────────────────────────────────
  const api = express.Router();

  api.get("/categories", async (_req, res) => { res.json(await getCategories()); });

  api.get("/materials", async (req, res) => {
    const { categoryId, search, riskLevel, featured, limit = "20", offset = "0" } = req.query as Record<string, string>;
    res.json(await getMaterials({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search: search || undefined, riskLevel: riskLevel || undefined,
      featured: featured === "true" ? true : undefined,
      limit: Math.min(parseInt(limit) || 20, 100), offset: parseInt(offset) || 0,
    }));
  });

  api.get("/materials/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
    const mat = await getMaterialById(id);
    if (!mat) return res.status(404).json({ error: "Not found" });
    res.json(mat);
  });

  api.get("/tool-categories", async (_req, res) => { res.json(await getToolCategories()); });

  api.get("/tools", async (req, res) => {
    const { toolCategoryId, search, powerType, professionLevel, limit = "20", offset = "0" } = req.query as Record<string, string>;
    res.json(await getTools({
      toolCategoryId: toolCategoryId ? parseInt(toolCategoryId) : undefined,
      search: search || undefined, powerType: powerType || undefined, professionLevel: professionLevel || undefined,
      limit: Math.min(parseInt(limit) || 20, 100), offset: parseInt(offset) || 0,
    }));
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
      limit: Math.min(parseInt(limit) || 10, 50), offset: parseInt(offset) || 0,
    }));
  });

  api.get("/calculators", async (req, res) => {
    const { categorySlug, featured } = req.query as Record<string, string>;
    res.json(await getCalculators({ categorySlug: categorySlug || undefined, featured: featured === "true" ? true : undefined }));
  });

  api.get("/search", async (req, res) => {
    const { q } = req.query as Record<string, string>;
    if (!q || q.trim().length < 1) return res.status(400).json({ error: "Query required" });
    res.json(await globalSearch(q, 10));
  });

  app.use("/api/v1", api);

  // ─── B2B Partner REST API ─────────────────────────────────────────────────
  const b2b = express.Router();

  async function authPartner(req: express.Request, res: express.Response): Promise<Awaited<ReturnType<typeof getPartnerByApiKey>> | null> {
    const key = (req.headers["x-api-key"] as string) || (req.headers["authorization"] as string)?.replace("Bearer ", "");
    if (!key) { res.status(401).json({ error: "Missing X-API-Key header" }); return null; }
    const partner = await getPartnerByApiKey(key);
    if (!partner) { res.status(401).json({ error: "Invalid API key" }); return null; }
    if (partner.status !== "active") { res.status(403).json({ error: `Account is ${partner.status}. Contact support.` }); return null; }
    return partner;
  }

  b2b.get("/me", async (req, res) => {
    const partner = await authPartner(req, res);
    if (!partner) return;
    const { apiSecret, ...safe } = partner;
    res.json(safe);
  });

  b2b.post("/prices", async (req, res) => {
    const partner = await authPartner(req, res);
    if (!partner) return;
    const { items } = req.body as { items?: unknown[] };
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Body must be { items: [...] }" });
    if (items.length > 500) return res.status(400).json({ error: "Max 500 items per request" });
    const { allowed, remaining } = await checkAndIncrementQuota(partner.id);
    if (!allowed) return res.status(429).json({ error: "Daily quota exceeded", tier: partner.tier, quota: partner.dailyQuota });
    const validated = (items as any[]).filter(i => (i.materialId || i.toolId) && i.price && !isNaN(parseFloat(i.price)));
    const { updated, failed } = await upsertPartnerPrices(partner.id, validated);
    res.json({ success: true, updated, failed, remaining });
  });

  b2b.get("/products", async (req, res) => {
    const partner = await authPartner(req, res);
    if (!partner) return;
    res.json(await getPartnerProducts(partner.id, Math.min(parseInt(req.query.limit as string || "50"), 500)));
  });

  b2b.get("/sync-log", async (req, res) => {
    const partner = await authPartner(req, res);
    if (!partner) return;
    res.json(await getPartnerSyncLogs(partner.id, 20));
  });

  app.use("/api/v1/partner", b2b);

  // ─── Chat SSE streaming ───────────────────────────────────────────────────
  app.post("/api/chat/stream", async (req, res) => {
    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
    try { user = await sdk.authenticateRequest(req); } catch { /* anon */ }
    if (!user) { res.status(401).json({ error: "Authentication required" }); return; }

    const dbUser = await getUserByOpenId(user.openId);
    if ((dbUser?.tier ?? "free") === "free") {
      res.status(403).json({ error: "CHAT_TIER_REQUIRED" });
      return;
    }

    const { message, conversationId, language = "PT" } = req.body as { message: string; conversationId?: number; language?: string; };
    if (!message || typeof message !== "string" || message.trim().length === 0) { res.status(400).json({ error: "message required" }); return; }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(user.id, language);
      } else {
        const conv = await getConversationById(user.id, convId);
        if (!conv) { send({ type: "error", message: "Conversation not found" }); res.end(); return; }
      }

      const history = await getConversationMessages(convId, 20);
      const anthropicMessages: Anthropic.MessageParam[] = history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
      anthropicMessages.push({ role: "user", content: message.trim() });
      await saveChatMessage(convId, "user", message.trim());

      const isPT = language === "PT";
      const systemPrompt = isPT
        ? `Você é o Mestre de Obra Digital do WikiBuild Baluarte — um assistente especializado em construção civil, segurança de materiais e boas práticas de obra para o Brasil.\n\nSeu estilo: direto, prático, técnico sem ser acadêmico. Use linguagem acessível para pedreiros, engenheiros e donos de obra. Quando citar produtos ou materiais, sempre inclua o link no formato [Nome do Material](/material/ID).\n\nFerramentas disponíveis: use search_materials, search_tools e search_articles para buscar informações atualizadas no banco de dados do WikiBuild antes de responder sobre produtos específicos.`
        : `You are the Digital Master Builder of WikiBuild Baluarte — a specialized assistant for civil construction, material safety and best practices for Brazilian construction sites.\n\nYour style: direct, practical, technical but accessible. Use language suitable for masons, engineers and site owners. When citing products or materials, always include the link as [Material Name](/material/ID).\n\nAvailable tools: use search_materials, search_tools and search_articles to look up up-to-date information in the WikiBuild database before answering.`;

      const tools: Anthropic.Tool[] = [
        { name: "search_materials", description: isPT ? "Busca materiais no WikiBuild." : "Search materials in WikiBuild.", input_schema: { type: "object" as const, properties: { query: { type: "string" } }, required: ["query"] } },
        { name: "search_tools", description: isPT ? "Busca ferramentas no WikiBuild." : "Search tools in WikiBuild.", input_schema: { type: "object" as const, properties: { query: { type: "string" } }, required: ["query"] } },
        { name: "search_articles", description: isPT ? "Busca artigos de segurança no WikiBuild." : "Search safety articles in WikiBuild.", input_schema: { type: "object" as const, properties: { query: { type: "string" } }, required: ["query"] } },
      ];

      const anthropicApiKey = ENV.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) { send({ type: "error", message: isPT ? "Chave API não configurada." : "API key not configured." }); res.end(); return; }

      const client = new Anthropic({ apiKey: anthropicApiKey });
      let fullResponse = "", totalTokens = 0, continueLoop = true;
      let currentMessages = [...anthropicMessages];

      while (continueLoop) {
        const stream = await client.messages.stream({ model: "claude-sonnet-4-6", max_tokens: 1024, system: systemPrompt, tools, messages: currentMessages });
        const toolUseBlocks: Anthropic.ToolUseBlock[] = [];
        let currentToolUse: { id: string; name: string; input: string } | null = null;

        for await (const event of stream) {
          if (event.type === "content_block_start" && event.content_block.type === "tool_use") {
            currentToolUse = { id: event.content_block.id, name: event.content_block.name, input: "" };
            send({ type: "tool_start", tool: event.content_block.name });
          } else if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") { fullResponse += event.delta.text; send({ type: "delta", content: event.delta.text }); }
            else if (event.delta.type === "input_json_delta" && currentToolUse) currentToolUse.input += event.delta.partial_json;
          } else if (event.type === "content_block_stop" && currentToolUse) {
            try { currentToolUse.input = JSON.parse(currentToolUse.input || "{}"); } catch { currentToolUse.input = {} as any; }
            toolUseBlocks.push({ type: "tool_use", id: currentToolUse.id, name: currentToolUse.name, input: currentToolUse.input as any });
            currentToolUse = null;
          } else if (event.type === "message_delta") {
            totalTokens = event.usage?.output_tokens ?? 0;
          }
        }

        const finalMsg = await stream.finalMessage();
        if (finalMsg.stop_reason === "tool_use" && toolUseBlocks.length > 0) {
          currentMessages.push({ role: "assistant", content: finalMsg.content });
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const tb of toolUseBlocks) {
            const input = tb.input as { query: string };
            let resultText = "";
            try {
              if (tb.name === "search_materials") { const r = await getMaterials({ search: input.query, limit: 5 }); resultText = r.length === 0 ? "No results." : r.map((m: any) => `- [${isPT ? m.namePortuguese : m.nameEnglish}](/material/${m.id}): ${isPT ? m.descriptionPortuguese ?? "" : m.descriptionEnglish ?? ""}`).join("\n"); }
              else if (tb.name === "search_tools") { const r = await getTools({ search: input.query, limit: 5 }); resultText = r.length === 0 ? "No results." : r.map((t: any) => `- [${isPT ? t.namePortuguese : t.nameEnglish}](/tools): ${isPT ? t.descriptionPortuguese ?? "" : t.descriptionEnglish ?? ""}`).join("\n"); }
              else if (tb.name === "search_articles") { const r = await getKnowledgeBaseArticles({ search: input.query, limit: 5 }); resultText = r.length === 0 ? "No results." : r.map((a: any) => `- [${isPT ? a.titlePortuguese : a.titleEnglish}](/knowledge-base): ${isPT ? a.summaryPortuguese ?? "" : a.summaryEnglish ?? ""}`).join("\n"); }
            } catch (e) { resultText = `Error: ${e}`; }
            send({ type: "tool_result", tool: tb.name, count: resultText.split("\n").length });
            toolResults.push({ type: "tool_result", tool_use_id: tb.id, content: resultText });
          }
          currentMessages.push({ role: "user", content: toolResults });
        } else { continueLoop = false; }
      }

      await saveChatMessage(convId, "assistant", fullResponse, totalTokens);
      send({ type: "done", conversationId: convId });
    } catch (err: any) {
      console.error("Chat stream error:", err);
      send({ type: "error", message: err?.message ?? "Internal error" });
    }
    res.end();
  });

  // ─── tRPC ─────────────────────────────────────────────────────────────────
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  return app;
}

export default createApp();
