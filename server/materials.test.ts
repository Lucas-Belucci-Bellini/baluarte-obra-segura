import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const createPublicContext = (): TrpcContext => ({
  user: null,
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: () => {},
  } as TrpcContext["res"],
});

describe("materials router", () => {
  it("should list all materials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.materials.list({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("namePortuguese");
    expect(result[0]).toHaveProperty("riskLevel");
  });

  it("should filter materials by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // First get all materials to know a valid category ID
    const allMaterials = await caller.materials.list({
      limit: 100,
      offset: 0,
    });

    if (allMaterials.length > 0) {
      const categoryId = allMaterials[0].categoryId;

      const filtered = await caller.materials.list({
        categoryId,
        limit: 100,
        offset: 0,
      });

      expect(Array.isArray(filtered)).toBe(true);
      filtered.forEach((material) => {
        expect(material.categoryId).toBe(categoryId);
      });
    }
  });

  it("should get material by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Get first material
    const allMaterials = await caller.materials.list({
      limit: 1,
      offset: 0,
    });

    if (allMaterials.length > 0) {
      const materialId = allMaterials[0].id;
      const material = await caller.materials.byId(materialId);

      expect(material).not.toBeNull();
      expect(material?.id).toBe(materialId);
      expect(material?.namePortuguese).toBeDefined();
      expect(material?.stores).toBeDefined();
    }
  });

  it("should search materials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.materials.search("cimento");

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("categories router", () => {
  it("should list all categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("namePortuguese");
    expect(result[0]).toHaveProperty("nameEnglish");
    expect(result[0]).toHaveProperty("itemCount");
  });

  it("should have expected categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();
    const categoryNames = result.map((cat) => cat.namePortuguese);

    expect(categoryNames).toContain("Elétrica");
    expect(categoryNames).toContain("Estrutural");
    expect(categoryNames).toContain("Hidráulica");
    expect(categoryNames).toContain("Fundações");
    expect(categoryNames).toContain("Ferramentas");
    expect(categoryNames).toContain("Acabamentos");
  });
});

describe("knowledgeBase router", () => {
  it("should list knowledge base articles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.knowledgeBase.articles({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("titlePortuguese");
      expect(result[0]).toHaveProperty("contentPortuguese");
    }
  });

  it("should list featured articles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.knowledgeBase.articles({
      featured: true,
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get article by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const allArticles = await caller.knowledgeBase.articles({
      limit: 1,
      offset: 0,
    });

    if (allArticles.length > 0) {
      const articleId = allArticles[0].id;
      const article = await caller.knowledgeBase.byId(articleId);

      expect(article).not.toBeNull();
      expect(article?.id).toBe(articleId);
      expect(article?.titlePortuguese).toBeDefined();
    }
  });
});
