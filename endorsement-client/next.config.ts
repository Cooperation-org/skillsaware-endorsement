import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  transpilePackages: ['skillsaware-endorsement-sdk'],
  turbopack: {
    root: path.resolve(__dirname)
  }
}

export default nextConfig
