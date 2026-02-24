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

function extractLinkCandidates(md: string): { text: string; context: string }[] {
  const lines = md.split(/\r?\n/);
  // 查找 "## 关联链接" 或者 "## 相关卡片"
  const start = lines.findIndex((l) => /##\s+(关联链接|相关卡片)/.test(l.trim()));
  if (start === -1) return [];
  
  // 仅扫描该标题下的列表项，直到遇到下一个标题或结束
  const candidates: { text: string; context: string }[] = [];
  
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#")) break; // 遇到下一个标题，停止
    if (!line.startsWith("-") && !line.startsWith("*")) continue; // 只看列表项

    const content = line.replace(/^[\-\*]\s+/, "").trim();
    if (!content || content === "（缺）") continue;

    // 分割多个链接 (简单的逗号/分号分隔)
    const parts = content.split(/，|,|、|\||\/|；|;|→|->/g);
    for (const part of parts) {
      const p = part.trim();
      if (p) {
        candidates.push({ text: p, context: content });
      }
    }
  }

  return candidates.slice(0, 20);
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
      for (const { text: cand } of candidates) {
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

export interface Backlink {
  sourceId: string;
  sourceTitle: string;
  context: string;
}

export function getBacklinksIndex(cards: CardDoc[]): Map<string, Backlink[]> {
  const index = new Map<string, Backlink[]>();
  const titleIndex = new Map<string, string>();
  
  // 建立标题索引
  for (const c of cards) titleIndex.set(norm(c.title), c.id);
  
  // 模糊索引
  const fuzzyIndex: Array<{ key: string; id: string }> = [];
  for (const c of cards) {
    const n = norm(c.title);
    if (n.length >= 4) fuzzyIndex.push({ key: n, id: c.id });
  }

  for (const sourceCard of cards) {
    const candidates = extractLinkCandidates(sourceCard.content);
    
    for (const { text, context } of candidates) {
      const cn = norm(text);
      if (!cn || cn.length < 2) continue;

      let targetId = titleIndex.get(cn);
      if (!targetId) {
        // 尝试模糊匹配
        const hit = fuzzyIndex.find((t) => t.key.includes(cn) || cn.includes(t.key));
        targetId = hit?.id;
      }

      if (targetId && targetId !== sourceCard.id) {
        if (!index.has(targetId)) index.set(targetId, []);
        
        // 避免重复添加同一个源
        const list = index.get(targetId)!;
        if (!list.some(bl => bl.sourceId === sourceCard.id)) {
          list.push({
            sourceId: sourceCard.id,
            sourceTitle: sourceCard.title,
            context: context
          });
        }
      }
    }
  }

  return index;
}
