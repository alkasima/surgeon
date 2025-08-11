
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export', // Ensure this line is removed or commented out to allow dynamic API routes
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Was for static export compatibility, can be revisited later if image optimization is desired with App Hosting
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Add @opentelemetry/exporter-jaeger to externals to prevent "Module not found" warning
    // as it's an optional dependency for OpenTelemetry.
    config.externals = (config.externals || []).concat([
        '@opentelemetry/exporter-jaeger',
    ]);

    // Ignore warnings from Handlebars about require.extensions
    // This is a common warning when Handlebars is bundled with Webpack for server-side use.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/handlebars\/lib\/index\.js$/,
        message: /require\.extensions is not supported by webpack/,
      },
      // You might see another similar warning from a different path if handlebars is bundled differently
      // For example, if it's resolved through dotprompt
      {
        module: /node_modules\/dotprompt\/.*node_modules\/handlebars\/lib\/index\.js$/,
        message: /require\.extensions is not supported by webpack/,
      }
    ];

    return config;
  },
};

export default nextConfig;
