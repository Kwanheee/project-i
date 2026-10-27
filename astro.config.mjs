// @ts-check
import { defineConfig } from 'astro/config';

// 공개 주소: https://heethinks.com (GitHub Pages + 사용자 도메인, public/CNAME 참고)
export default defineConfig({
  site: 'https://heethinks.com',
  trailingSlash: 'ignore',
});
