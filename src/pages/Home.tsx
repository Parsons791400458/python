// Microsoft Fluent Design Home
// Focus: Clarity, Spacing, Premium Interactions.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import hero from "@/assets/hero.jpeg";

import { cards as allCards, allTags, type CardDoc, type CardType, type OutputReady } from "@/lib/cards";
import { buildKnowledgeGraph, getBacklinksIndex } from "@/lib/graph";

import AppShell from "@/components/AppShell";
import CommandPalette from "@/components/CommandPalette";
import KnowledgeMap from "@/components/KnowledgeMap";
import OutputQueue from "@/components/OutputQueue";
import ReviewView from "@/components/ReviewView";
import Dashboard from "@/components/Dashboard";
import StructuredReader from "@/components/StructuredReader";
import DictionaryView from "@/components/DictionaryView";
import PresentMode from "@/components/PresentMode";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Tag, X, LayoutGrid, ListFilter } from "lucide-react";

function CardItem({ c, selected, onSelect }: { c: CardDoc; selected?: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        selected 
          ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/5 ring-1 ring-primary/20" 
          : "bg-white border-border/50 hover:border-border hover:bg-slate-50 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-2">
        <h3 className={`font-semibold text-sm leading-tight line-clamp-1 ${selected ? "text-primary" : "text-foreground"}`}>
          {c.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4 bg-slate-100 text-slate-500 border-none font-medium">
            {c.type}
          </Badge>
          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 text-slate-400 border-slate-200">
            就绪:{c.outputReady}
          </Badge>
          {c.tags.slice(0, 1).map(t => (
            <span key={t} className="text-[9px] text-slate-400 font-bold">#{t}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<CardType | "全部">("全部");
  const [outputReady, setOutputReady] = useState<OutputReady | "全部">("全部");
  const [tag, setTag] = useState<string | "全部">("全部");
  const [activeId, setActiveId] = useState<string>(() => allCards[0]?.id ?? "");
  const [tab, setTab] = useState<"dashboard" | "console" | "map" | "output" | "review" | "dictionary">("dashboard");
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lk_filters_v2");
    if (!saved) return;
    try {
      const v = JSON.parse(saved);
      if (v.query) setQuery(v.query);
      if (v.type) setType(v.type);
      if (v.outputReady) setOutputReady(v.outputReady);
      if (v.tag) setTag(v.tag);
      if (v.tab) setTab(v.tab);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("lk_filters_v2", JSON.stringify({ query, type, outputReady, tag, tab }));
  }, [query, type, outputReady, tag, tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCards.filter((c) => {
      if (type !== "全部" && c.type !== type) return false;
      if (outputReady !== "全部" && c.outputReady !== outputReady) return false;
      if (tag !== "全部" && !c.tags.includes(tag)) return false;
      if (!q) return true;
      const hay = (c.title + " " + c.tags.join(" ") + " " + c.content).toLowerCase();
      return hay.includes(q);
    });
  }, [query, type, outputReady, tag]);

  const active = useMemo(() => filtered.find((c) => c.id === activeId) ?? filtered[0], [filtered, activeId]);

  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId]);

  const graph = useMemo(() => buildKnowledgeGraph(allCards, { maxModules: 14 }), []);
  const backlinksIndex = useMemo(() => getBacklinksIndex(allCards), []);

  const onSelectCard = (id: string) => {
    setActiveId(id);
    setTab("console");
  };

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      <AnimatePresence>
        {isPresenting && active && (
          <PresentMode card={active} onClose={() => setIsPresenting(false)} />
        )}
      </AnimatePresence>

      <CommandPalette cards={allCards} onOpenCard={onSelectCard} onNavigate={(v) => setTab(v as any)} />

      <AppShell view={tab} onChangeView={(v) => setTab(v as any)} stats={{ cards: allCards.length, tags: allTags.length }}>
        {/* Unified Layout with conditional views */}
        <div className="h-full flex flex-col">
          {tab === "dashboard" && <Dashboard cards={allCards} onJumpToCard={onSelectCard} />}
          
          {tab === "output" && <OutputQueue cards={allCards} onSelectCard={onSelectCard} />}
          
          {tab === "review" && <ReviewView cards={allCards} onSelectCard={onSelectCard} />}
          
          {tab === "dictionary" && <DictionaryView />}

          {tab === "map" && (
            <div className="flex-1 flex flex-col">
              <div className="p-8 pb-0 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">知识图谱</h2>
                  <p className="text-foreground/50 text-sm">全域资产连接可视化。</p>
                </div>
              </div>
              <div className="flex-1 p-8">
                <div className="h-full bg-white rounded-2xl border border-border/40 shadow-xl shadow-black/5 overflow-hidden">
                  <KnowledgeMap
                    nodes={graph.nodes}
                    links={graph.links}
                    selectedId={`c:${activeId}`}
                    onSelect={(n) => {
                      if (n.kind === "card" && n.cardId) onSelectCard(n.cardId);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "console" && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header with Search & Filter */}
              <div className="p-8 pb-6 border-b border-border/30 bg-white/40 backdrop-blur-md sticky top-0 z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="搜索你的知识资产..."
                      className="pl-10 h-11 bg-white border-border/60 rounded-xl shadow-sm focus:ring-primary/20 transition-all"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger className="w-32 bg-white rounded-xl border-border/60 h-10 shadow-sm">
                        <SelectValue placeholder="类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部类型</SelectItem>
                        <SelectItem value="概念">概念</SelectItem>
                        <SelectItem value="方法">方法</SelectItem>
                        <SelectItem value="案例">案例</SelectItem>
                        <SelectItem value="资源">资源</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" className="rounded-xl bg-white border-border/60 shadow-sm" onClick={() => {setQuery(""); setType("全部");}}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/40 uppercase tracking-widest">
                    <Tag className="w-3 h-3" /> Quick Filter
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {allTags.slice(0, 8).map(t => (
                      <Badge 
                        key={t} 
                        variant={tag === t ? "default" : "secondary"}
                        onClick={() => setTag(tag === t ? "全部" : t)}
                        className={`cursor-pointer rounded-full px-3 py-1 text-[10px] whitespace-nowrap transition-all ${tag === t ? "bg-primary text-white" : "bg-white border-border/40 text-foreground/60 hover:bg-slate-50"}`}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* List Panel */}
                <aside className="w-full max-w-[340px] border-r border-border/30 bg-slate-50/30 flex flex-col min-w-0">
                  <div className="p-4 flex items-center justify-between border-b border-border/30">
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Note List</span>
                    <Badge variant="outline" className="bg-white border-border/40 rounded-full h-5 text-[9px]">
                      {filtered.length} 篇
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-2">
                      {filtered.map((c) => (
                        <CardItem key={c.id} c={c} selected={c.id === activeId} onSelect={() => setActiveId(c.id)} />
                      ))}
                    </div>
                  </ScrollArea>
                </aside>

                {/* Reader Panel */}
                <div className="flex-1 min-w-0 bg-white overflow-hidden flex flex-col">
                  {active ? (
                    <StructuredReader 
                      card={active} 
                      backlinks={backlinksIndex.get(active.id)}
                      onPresent={() => setIsPresenting(true)} 
                      onOpenCard={onSelectCard}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4 opacity-30">
                      <LayoutGrid className="w-12 h-12" />
                      <p className="font-medium">选择一块积木开始拼装</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </div>
  );
}
