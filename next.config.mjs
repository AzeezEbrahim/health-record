const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX || '' : '',
  basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };
    
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });
    
    // Add rule for DICOM files to be served as static assets
    config.module.rules.push({
      test: /\.dcm$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
  
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issue
  },
  
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
