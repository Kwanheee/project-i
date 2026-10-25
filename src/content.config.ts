import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 파일 이름이 _ 로 시작하면(템플릿) 무시됩니다.
const md = (dir: string) => glob({ pattern: '**/[^_]*.md', base: `./content/${dir}` });

/** 📚 자료: 책·영화·영상·논문 등. 한 권 = 한 파일. 본문에는 챕터 요약을 씁니다. */
const sources = defineCollection({
  loader: md('sources'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).default([]),
    authorNote: z.string().optional(),
    year: z.number().int().optional(),
    edition: z.string().optional(),
    type: z.enum(['책', '영화', '영상', '논문', '기사', '기타']).default('책'),
    fields: z.array(z.string()).default([]),
    status: z.enum(['읽을 예정', '읽는 중', '완독', '인용만 있음']).default('인용만 있음'),
    finished: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
});

/** ✂️ 인용: 자료에서 뽑은 구절 하나. 가장 작은 단위. 본문이 인용문입니다. */
const excerpts = defineCollection({
  loader: md('excerpts'),
  schema: z.object({
    source: reference('sources'),
    kind: z.enum(['인용', '요약', '반응']).default('인용'),
    location: z.string().optional(),
    note: z.string().optional(),
  }),
});

/** 💡 생각: 질문 하나. 근거(인용)와 연결되고, 글의 재료가 됩니다. */
const ideas = defineCollection({
  loader: md('ideas'),
  schema: z.object({
    question: z.string(),
    claim: z.string().default(''),
    areas: z.array(z.string()).default([]),
    status: z.enum(['씨앗', '발전 중', '정리됨', '글로 씀']).default('씨앗'),
    evidence: z.array(reference('excerpts')).default([]),
    related: z.array(reference('ideas')).default([]),
    created: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
  }),
});

/** ✍️ 글: 생각들을 재료로 쓴 글. 본문이 초고입니다. */
const writings = defineCollection({
  loader: md('writings'),
  schema: z.object({
    title: z.string(),
    status: z.enum(['구상', '초고', '완성', '발표']).default('구상'),
    date: z.coerce.date().optional(),
    venue: z.string().optional(),
    summary: z.string().optional(),
    materials: z.array(reference('ideas')).default([]),
  }),
});

export const collections = { sources, excerpts, ideas, writings };
