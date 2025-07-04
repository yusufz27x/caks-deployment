/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: '*.supabase.co',
      // },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig; 