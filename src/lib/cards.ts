// Neo-brutalism knowledge console
// Principles: high-contrast borders, chip-as-bricks, fast scan, strong hierarchy

export type CardType = "概念" | "方法" | "案例" | "资源" | "（缺）" | "（失败）";
export type OutputReady = "低" | "中" | "高" | "（缺）";

import { getCategoryByTag, suggestCategories } from "./ontology";
import type { OntologyCategory } from "./ontology";

export interface CardDoc {
  id: string; // stable id (from filename suffix)
  title: string;
  type: CardType;
  outputReady: OutputReady;
  tags: string[];
  categories: OntologyCategory[];
  sourceUrl?: string;
  content: string; // raw markdown
}

function parseMeta(md: string) {
  const lines = md.split(/\r?\n/);
  const h1 = lines.find((l) => l.startsWith("# "))?.replace(/^#\s+/, "").trim() || "未命名";

  const pick = (prefix: string) => {
    const line = lines.find((l) => l.trim().startsWith(prefix));
    if (!line) return undefined;
    return line.split(prefix)[1]?.trim();
  };

  const typeRaw = pick("- 类型：") || "（缺）";
  const outputRaw = pick("- 可输出性：") || "（缺）";
  const tagsRaw = pick("- 标签：") || "";
  const url = pick("- 来源URL：") || undefined;

  const tags = tagsRaw
    .split(/,|，/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);

  const normalizeType = (t: string) => {
    const v = t.replace(/[\s（）()]/g, "");
    if (v.includes("概念")) return "概念";
    if (v.includes("方法")) return "方法";
    if (v.includes("案例")) return "案例";
    if (v.includes("资源")) return "资源";
    if (t.includes("失败")) return "（失败）";
    return "（缺）";
  };

  const normalizeOutput = (t: string) => {
    if (!t) return "（缺）";
    if (t.includes("高")) return "高";
    if (t.includes("中")) return "中";
    if (t.includes("低")) return "低";
    return "（缺）";
  };

  return {
    title: h1,
    type: normalizeType(typeRaw),
    outputReady: normalizeOutput(outputRaw),
    tags,
    sourceUrl: url && url.length > 4 ? url : undefined,
  };
}

// Vite will bundle these at build time
const modules = import.meta.glob("@/content/cards/*.md", { as: "raw", eager: true }) as Record<
  string,
  string
>;

export const cards: CardDoc[] = Object.entries(modules)
  .map(([path, content]) => {
    const file = path.split("/").pop() || path;
    const idMatch = file.match(/_([0-9a-f]{8})\.md$/i);
    const id = idMatch ? idMatch[1] : file;
    const meta = parseMeta(content);
    // 初始分类：基于标签匹配
    const tagCategories = meta.tags.map(tag => getCategoryByTag(tag)).filter((c): c is OntologyCategory => !!c);
    
    // 联想分类：基于全文语义内容匹配
    const contentCategories = suggestCategories(content);
    
    // 合并并去重
    const categories = Array.from(new Set([...tagCategories, ...contentCategories]))
      .sort((a, b) => a.id.localeCompare(b.id));

    return {
      id,
      title: meta.title,
      type: meta.type as any,
      outputReady: meta.outputReady as any,
      tags: meta.tags,
      categories,
      sourceUrl: meta.sourceUrl,
      content,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));

export const allTags = Array.from(new Set(cards.flatMap((c) => c.tags))).sort((a, b) =>
  a.localeCompare(b, "zh-CN")
);
