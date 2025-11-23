/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimisations pour développement local
  swcMinify: true,
  // Configuration des images si nécessaire
  images: {
    unoptimized: true, // Pour développement local
  },
};

module.exports = nextConfig;


