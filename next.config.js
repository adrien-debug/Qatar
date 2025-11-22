/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuration pour hosting local
  output: 'standalone',
  // Optimisations pour développement local
  swcMinify: true,
  // Configuration des images si nécessaire
  images: {
    unoptimized: true, // Pour développement local
  },
};

module.exports = nextConfig;


