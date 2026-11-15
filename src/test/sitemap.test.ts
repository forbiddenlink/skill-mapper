import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteUrl } from "@/lib/site";

const appDir = resolve(__dirname, "../app");

// Folders under src/app that are not public pages.
const PRIVATE = new Set(["api"]);

function publicRoutes(dir = appDir, prefix = ""): string[] {
  const routes: string[] = [];
  if (existsSync(join(dir, "page.tsx"))) routes.push(prefix || "/");
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory() || PRIVATE.has(name)) continue;
    routes.push(...publicRoutes(full, `${prefix}/${name}`));
  }
  return routes;
}

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => new URL(e.url).pathname);

  it("lists every public page under src/app, not just the home page", () => {
    expect(entries.length).toBeGreaterThan(1);
    expect(urls.sort()).toEqual(publicRoutes().sort());
  });

  it("includes /showcase", () => {
    expect(urls).toContain("/showcase");
  });

  it("robots points at the same host as the sitemap", () => {
    const host = new URL(siteUrl).origin;
    expect(robots().sitemap).toBe(`${host}/sitemap.xml`);
  });
});
