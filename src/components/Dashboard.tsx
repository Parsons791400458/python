// Microsoft Fluent Design Dashboard
// Clean layout, subtle gradients, soft shadows.

import { useEffect, useMemo, useState } from "react";
import { 
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, Tooltip as ReTooltip, LabelList
} from "recharts";
import type { CardDoc } from "@/lib/cards";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KNOWLEDGE_ONTOLOGY } from "@/lib/ontology";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  BarChart3, 
  Zap,
  Combine,
  Bookmark,
  ArrowRight,
  Clock,
  Sparkle
} from "lucide-react";

interface ReviewState {
  [cardId: string]: {
    lastReviewed: number;
    count: number;
  };
}

export default function Dashboard({ 
  cards, 
  onJumpToCard 
}: { 
  cards: CardDoc[]; 
  onJumpToCard: (id: string) => void 
}) {
  const [reviewState, setReviewState] = useState<ReviewState>({});

  useEffect(() => {
    const saved = localStorage.getItem("lk_review_state");
    if (saved) {
      try { setReviewState(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cards]);

  const categoryDistribution = useMemo(() => {
    return KNOWLEDGE_ONTOLOGY.map(cat => ({
      name: cat.label,
      count: cards.filter(c => c.categories.some(cc => cc.id === cat.id)).length,
      color: cat.color
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  }, [cards]);

  const outputData = useMemo(() => {
    const counts: Record<string, number> = { "高": 0, "中": 0, "低": 0, "（缺）": 0 };
    cards.forEach(c => { counts[c.outputReady] = (counts[c.outputReady] || 0) + 1; });
    return [
      { name: "就绪", value: counts["高"] },
      { name: "加工中", value: counts["中"] },
      { name: "原料", value: counts["低"] + counts["（缺）"] },
    ];
  }, [cards]);

  const suggestions = useMemo(() => {
    const now = Date.now();
    return cards
      .map(c => {
        const state = reviewState[c.id];
        const lastTime = state?.lastReviewed || 0;
        const daysSince = lastTime === 0 ? 100 : (now - lastTime) / (1000 * 3600 * 24);
        const score = daysSince * (c.outputReady === "高" ? 2.5 : 1.0);
        return { ...c, score, lastTime, count: state?.count || 0 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [cards, reviewState]);

  const healthScore = useMemo(() => {
    if (cards.length === 0) return 0;
    return Math.round(
      (cards.filter(c => c.outputReady === "高").length / cards.length) * 40 +
      (cards.filter(c => c.tags.length > 0).length / cards.length) * 60
    );
  }, [cards]);

  const MS_BLUE = "oklch(0.55 0.18 255)";
  const COLORS = [MS_BLUE, "oklch(0.6 0.14 200)", "oklch(0.65 0.1 160)", "oklch(0.7 0.08 120)"];

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Sparkle className="w-5 h-5 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">概览</h2>
        </div>
        <p className="text-foreground/50 text-sm">实时分析你的“乐高式”知识体系健康状态与产出效能。</p>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-4 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "资产总量", value: cards.length, unit: "积木", sub: "个" },
            { label: "体系健康度", value: healthScore, unit: "%", sub: "稳定" },
            { label: "知识层级", value: "L1-L4", unit: "", sub: "结构" },
            { label: "今日重点", value: suggestions.length, unit: "项", sub: "复习" },
          ].map((m, i) => (
            <div key={i} className="fluent-card p-6 flex flex-col justify-between h-32 bg-white ring-1 ring-black/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{m.label}</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-primary">{m.value}</span>
                <span className="text-xs font-medium text-foreground/40">{m.unit}</span>
              </div>
              <span className="text-[10px] text-foreground/30 font-medium mt-auto">{m.sub}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="fluent-card p-6 bg-white">
                <h3 className="text-sm font-bold text-foreground/60 mb-6 uppercase flex items-center gap-2">
                  <Combine className="w-4 h-4" /> 本体聚类分析
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={categoryDistribution} margin={{ left: -10, right: 30 }}>
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 600, fill: "oklch(0.4 0.05 250)" }}
                        width={80}
                      />
                      <ReTooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="fluent-card p-6 bg-white">
                <h3 className="text-sm font-bold text-foreground/60 mb-6 uppercase flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> 生产力就绪度
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outputData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.5 0 0)' }} />
                      <Bar dataKey="value" fill={MS_BLUE} radius={[4, 4, 0, 0]} />
                      <ReTooltip cursor={{ fill: 'transparent' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="fluent-card p-8 bg-primary text-white overflow-hidden relative group">
              <Zap className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> 体系化运营洞察
                </h3>
                <div className="space-y-6 max-w-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium opacity-80">
                      <span>卡片化进程 (L1 → L2)</span>
                      <span>{Math.round((cards.filter(c => c.type !== "（缺）").length / cards.length) * 100)}%</span>
                    </div>
                    <Progress value={80} className="h-1.5 bg-white/20" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium opacity-80">
                      <span>网络链接覆盖率</span>
                      <span>53%</span>
                    </div>
                    <Progress value={53} className="h-1.5 bg-white/20" />
                  </div>
                </div>
                <div className="mt-8 bg-white/10 backdrop-blur-md p-4 rounded-lg text-xs leading-relaxed border border-white/10">
                  <p className="font-bold mb-1">💡 行动建议：</p>
                  检测到你有 47% 的卡片处于“孤岛”状态。建议在【知识图谱】中筛选这些点，并补齐它们的关联链接，以强化知识串联深度。
                </div>
              </div>
            </div>
          </div>

          <div className="fluent-card bg-white p-6 flex flex-col h-full ring-1 ring-black/5">
            <h3 className="text-sm font-bold text-foreground/60 mb-6 uppercase flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> 今日复习重点
            </h3>
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-border/50 hover:bg-accent/30 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => onJumpToCard(s.id)}>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">{s.title}</h4>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-foreground/40 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.lastTime === 0 ? '初次学习' : `${Math.floor((Date.now() - s.lastTime)/(1000*3600*24))}天前`}
                    </span>
                    <Badge variant="secondary" className="text-[8px] h-4 py-0 leading-none bg-primary/5 text-primary/70 border-none">
                      {s.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-border/30 text-[9px] text-foreground/40 font-medium italic">
              算法：Spaced-Repetition-v1 (遺忘曲線加权)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
