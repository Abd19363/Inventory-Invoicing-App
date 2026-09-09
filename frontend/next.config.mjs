function backendOrigin() {
  const raw = (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (!raw) return "";
  if (/localhost|127\.0\.0\.1|vercel\.app/i.test(raw)) return "";
  return raw;
}

const backendUrl = backendOrigin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (!backendUrl) {
      return [];
    }

    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
