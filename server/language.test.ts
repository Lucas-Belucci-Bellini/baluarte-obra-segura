import { describe, it, expect } from "vitest";
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

describe("language support", () => {
  it("should return Portuguese content when available", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const materials = await caller.materials.list({
      limit: 1,
      offset: 0,
    });

    expect(materials.length).toBeGreaterThan(0);
    expect(materials[0]).toHaveProperty("namePortuguese");
    expect(materials[0]).toHaveProperty("nameEnglish");
    expect(materials[0].namePortuguese).toBeTruthy();
    expect(materials[0].nameEnglish).toBeTruthy();
  });

  it("should return English content for all materials", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const materials = await caller.materials.list({
      limit: 10,
      offset: 0,
    });

    materials.forEach((material) => {
      expect(material.nameEnglish).toBeTruthy();
      expect(material.descriptionEnglish).toBeTruthy();
    });
  });

  it("should return bilingual categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();

    categories.forEach((category) => {
      expect(category.namePortuguese).toBeTruthy();
      expect(category.nameEnglish).toBeTruthy();
    });
  });

  it("should return bilingual knowledge base articles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledgeBase.articles({
      limit: 10,
      offset: 0,
    });

    articles.forEach((article) => {
      expect(article.titlePortuguese).toBeTruthy();
      expect(article.titleEnglish).toBeTruthy();
      expect(article.contentPortuguese).toBeTruthy();
      expect(article.contentEnglish).toBeTruthy();
    });
  });

  it("should have consistent material data across languages", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const materials = await caller.materials.list({
      limit: 5,
      offset: 0,
    });

    materials.forEach((material) => {
      // Check that both language versions exist
      expect(material.namePortuguese.length).toBeGreaterThan(0);
      expect(material.nameEnglish.length).toBeGreaterThan(0);

      // Check that risk levels are consistent
      expect(["RISCO_ALTO", "ATENCAO", "NORMAL"]).toContain(material.riskLevel);

      // Check that store counts are present
      expect(material.storeCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("search functionality", () => {
  it("should return results for search query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.materials.search("cimento");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return all materials for empty search", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.materials.search("");

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle search with various queries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const queries = ["fio", "disjuntor", "pvc", "cimento"];

    for (const query of queries) {
      const result = await caller.materials.search(query);
      expect(Array.isArray(result)).toBe(true);
    }
  });
});
