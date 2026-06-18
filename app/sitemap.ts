import type { MetadataRoute } from "next";
import { site } from "@/content/site.config";

const BASE = site.url;

export default function sitemap(): MetadataRoute.Sitemap {
  // newest single drives the home page's lastModified
  const lastSingle = site.releases[0]?.date;
  const lastMod = lastSingle ? new Date(lastSingle) : new Date();

  return [
    { url: `${BASE}/`, lastModified: lastMod, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
