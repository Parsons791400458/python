// Neo-brutalism knowledge console
// Graph building: modules from top tags + card-to-card links inferred from "关联链接" section.

import type { CardDoc } from "@/lib/cards";
import { getCategoryByTag } from "./ontology";

export type NodeKind = "module" | "card";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  cardId?: string;
  moduleTag?: string;
  categoryColor?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  kind: "module-card" | "card-card";
  weight?: number;
}

function norm(s: string) {
  return s
    .replace(/\s+/g, "")
    .replace(/[【】\[\]（）()“”"'’‘]/g, "")
    .toLowerCase();
}

function extractLinkCandidates(md: string): string[] {
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === "## 关联链接");
  if (start === -1) return [];
  const slice = lines.slice(start, Math.min(lines.length, start + 80));
  const bullets = slice
    .filter((l) => /^-\s+/.test(l.trim()))
    .map((l) => l.replace(/^\s*-\s+/, "").trim())
    .filter((x) => x && x !== "（缺）");

  // split by separators
  return bullets
    .flatMap((b) => b.split(/，|,|、|\||\/|；|;|→|->/g))
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function buildKnowledgeGraph(cards: CardDoc[], opts?: { maxModules?: number; enableCardLinks?: boolean }) {
  const maxModules = opts?.maxModules ?? 12;
  const enableCardLinks = opts?.enableCardLinks ?? true;

  // pick top tags as modules
  const tagFreq = new Map<string, number>();
  for (const c of cards) {
    for (const t of c.tags) tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
  }
  const modules = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxModules)
    .map(([tag]) => tag);

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  for (const tag of modules) {
    const cat = getCategoryByTag(tag);
    nodes.push({ 
      id: `m:${tag}`, 
      kind: "module", 
      label: tag, 
      moduleTag: tag,
      categoryColor: cat?.color
    });
  }

  for (const c of cards) {
    const primaryCat = c.categories[0];
    nodes.push({ 
      id: `c:${c.id}`, 
      kind: "card", 
      label: c.title, 
      cardId: c.id,
      categoryColor: primaryCat?.color
    });
    for (const tag of c.tags) {
      if (modules.includes(tag)) {
        links.push({ source: `m:${tag}`, target: `c:${c.id}`, kind: "module-card", weight: 1 });
      }
    }
  }

  if (enableCardLinks) {
    const titleIndex = new Map<string, string>();
    for (const c of cards) titleIndex.set(norm(c.title), c.id);

    // also index by key substrings (avoid too small)
    const fuzzyIndex: Array<{ key: string; id: string }> = [];
    for (const c of cards) {
      const n = norm(c.title);
      if (n.length >= 6) fuzzyIndex.push({ key: n, id: c.id });
    }

    const edgeSet = new Set<string>();
    for (const c of cards) {
      const candidates = extractLinkCandidates(c.content);
      for (const cand of candidates) {
        const cn = norm(cand);
        if (!cn || cn.length < 4) continue;

        let targetId = titleIndex.get(cn);
        if (!targetId) {
          // naive fuzzy: if cand is substring of any title or vice-versa
          const hit = fuzzyIndex.find((t) => t.key.includes(cn) || cn.includes(t.key));
          targetId = hit?.id;
        }
        if (!targetId || targetId === c.id) continue;

        const a = `c:${c.id}`;
        const b = `c:${targetId}`;
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        links.push({ source: a, target: b, kind: "card-card", weight: 1 });
      }
    }
  }

  return { nodes, links, modules };
}
