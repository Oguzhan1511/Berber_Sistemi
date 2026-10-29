// Server-only compatibility layer for the Vercel/Next.js build.
// The Vinext preview continues using its real Cloudflare binding module.
export const env=process.env as unknown as Cloudflare.Env;
