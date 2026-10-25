import { getCollection, type CollectionEntry } from 'astro:content';

export type Source = CollectionEntry<'sources'>;
export type Excerpt = CollectionEntry<'excerpts'>;
export type Idea = CollectionEntry<'ideas'>;
export type Writing = CollectionEntry<'writings'>;

function push<T>(map: Map<string, T[]>, key: string, value: T) {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

function pushUnique<T extends { id: string }>(map: Map<string, T[]>, key: string, value: T | undefined) {
  if (!value) return;
  const arr = map.get(key);
  if (!arr) map.set(key, [value]);
  else if (!arr.some((v) => v.id === value.id)) arr.push(value);
}

export const ko = (a: string, b: string) => a.localeCompare(b, 'ko');

/** 인용 본문의 첫 줄(미리보기용). */
export function excerptPreview(e: Excerpt, max = 90): string {
  const first = (e.body ?? '').split('\n').map((l) => l.trim()).filter(Boolean)[0] ?? '';
  return first.length > max ? first.slice(0, max).trimEnd() + '…' : first;
}

/** 『제목』, 저자, 연도 형태의 짧은 출처 표기. */
export function cite(s: Source): string {
  const parts = [`『${s.data.title}』`];
  if (s.data.authors.length) parts.push(s.data.authors.join(', '));
  if (s.data.year) parts.push(String(s.data.year));
  return parts.join(', ');
}

export async function loadGraph() {
  const [sources, excerpts, ideas, writings] = await Promise.all([
    getCollection('sources'),
    getCollection('excerpts'),
    getCollection('ideas'),
    getCollection('writings'),
  ]);

  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const excerptById = new Map(excerpts.map((e) => [e.id, e]));
  const ideaById = new Map(ideas.map((i) => [i.id, i]));

  // 자료 → 인용
  const excerptsBySource = new Map<string, Excerpt[]>();
  for (const e of excerpts) push(excerptsBySource, e.data.source.id, e);

  // 인용 → 생각 (역방향)
  const ideasByExcerpt = new Map<string, Idea[]>();
  for (const i of ideas) for (const ref of i.data.evidence) pushUnique(ideasByExcerpt, ref.id, i);

  // 자료 ↔ 생각 (인용을 거쳐 집계)
  const ideasBySource = new Map<string, Idea[]>();
  const sourcesByIdea = new Map<string, Source[]>();
  for (const i of ideas) {
    for (const ref of i.data.evidence) {
      const e = excerptById.get(ref.id);
      if (!e) continue;
      const s = sourceById.get(e.data.source.id);
      if (!s) continue;
      pushUnique(ideasBySource, s.id, i);
      pushUnique(sourcesByIdea, i.id, s);
    }
  }

  // 관련 생각 (양방향)
  const relatedByIdea = new Map<string, Idea[]>();
  for (const i of ideas) {
    for (const r of i.data.related) {
      pushUnique(relatedByIdea, i.id, ideaById.get(r.id));
      pushUnique(relatedByIdea, r.id, i);
    }
  }

  // 생각 → 글 (역방향)
  const writingsByIdea = new Map<string, Writing[]>();
  for (const w of writings) for (const m of w.data.materials) pushUnique(writingsByIdea, m.id, w);

  // 영역별 집계
  const areaCounts = new Map<string, number>();
  for (const i of ideas) for (const a of i.data.areas) areaCounts.set(a, (areaCounts.get(a) ?? 0) + 1);
  const areas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1] || ko(a[0], b[0]));

  const evidenceCount = (i: Idea) => i.data.evidence.length;

  return {
    sources,
    excerpts,
    ideas,
    writings,
    sourceById,
    excerptById,
    ideaById,
    excerptsBySource,
    ideasByExcerpt,
    ideasBySource,
    sourcesByIdea,
    relatedByIdea,
    writingsByIdea,
    areas,
    evidenceCount,
  };
}

export type Graph = Awaited<ReturnType<typeof loadGraph>>;
