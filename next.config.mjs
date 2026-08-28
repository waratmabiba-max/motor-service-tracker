/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cegah prerender halaman yang pakai Firebase
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
