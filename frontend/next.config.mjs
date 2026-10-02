/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/demo',
        destination: '/publisher.html',
      },
      {
        source: '/ad',
        destination: `${apiUrl}/ad`,
      },
      {
        source: '/track/:path*',
        destination: `${apiUrl}/track/:path*`,
      },
      {
        source: '/reset-frequency-caps',
        destination: `${apiUrl}/reset-frequency-caps`,
      },
    ];
  },
};

export default nextConfig;
