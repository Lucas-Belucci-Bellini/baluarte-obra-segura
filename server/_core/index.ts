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
import {
  getCategories, getMaterials, getMaterialById,
  getToolCategories, getTools, getToolById,
  getKnowledgeBaseArticles, getCalculators, globalSearch,
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
