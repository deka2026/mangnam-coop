/** @type {import('next').NextConfig} */
// GitHub Pages(sakyowon.co.kr/mangnam-coop) 정적 배포용 설정.
// 프로젝트 하위경로에 올라가므로 basePath를 둔다.
const nextConfig = {
  output: "export",
  basePath: "/mangnam-coop",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
