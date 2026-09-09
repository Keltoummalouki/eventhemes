/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Les visuels de la maquette sont servis par des CDN externes et utilisent un
  // repli `onError`. On garde donc la balise <img> native (cf. SmartImage) plutôt
  // que next/image, afin de préserver exactement les filtres et transitions CSS.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
