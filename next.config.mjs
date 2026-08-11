import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.110.252', 'localhost', '127.0.0.1', '0.0.0.0'],
  turbopack: {},
};

export default withPWA(nextConfig);
