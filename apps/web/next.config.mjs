/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true, // 兼容 Nginx 路径规则
  images: {
    unoptimized: true, // 禁用图片优化以兼容静态导出
  },
};

export default nextConfig;
