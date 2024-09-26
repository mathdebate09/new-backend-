/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/api/(.*)', // Apply headers to all API routes
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: 'http://localhost:5173', // Allow your frontend's origin
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, OPTIONS', // Allowed methods
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization', // Allowed headers
            },
            {
              key: 'Access-Control-Allow-Credentials',
              value: 'true', // If you need to send cookies or authentication headers
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  