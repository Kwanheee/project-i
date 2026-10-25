/** base 경로(GitHub Pages의 /project-i)를 붙인 사이트 내부 링크를 만듭니다. */
export function u(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return p ? `${base}/${p}` : `${base}/`;
}

export const ideaUrl = (id: string) => u(`ideas/${id}/`);
export const sourceUrl = (id: string) => u(`sources/${id}/`);
export const excerptUrl = (id: string) => u(`excerpts/${id}/`);
export const writingUrl = (id: string) => u(`writings/${id}/`);
