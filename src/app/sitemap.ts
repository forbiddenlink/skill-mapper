import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Public pages only. src/test/sitemap.test.ts fails if a page under src/app is
// added without an entry here.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/showcase`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
