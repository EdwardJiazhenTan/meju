import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  typescript: {
    // 暂时忽略构建错误，开发时会显示
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default withNextIntl(nextConfig);