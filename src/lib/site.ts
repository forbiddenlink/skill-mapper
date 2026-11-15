import { env } from "@/env";

/** Canonical public origin, shared by layout metadata, sitemap and robots. */
export const siteUrl = env.NEXT_PUBLIC_APP_URL ?? "https://skill-mapper-six.vercel.app";
