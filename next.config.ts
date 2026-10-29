import type {NextConfig} from 'next';
import path from 'node:path';
const nextConfig:NextConfig={
  webpack(config,{webpack}){
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/,path.resolve(process.cwd(),'app/runtime-env.ts')));
    return config;
  },
};
export default nextConfig;
