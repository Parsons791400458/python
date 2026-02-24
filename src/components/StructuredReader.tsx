// Microsoft Fluent Design Structured Reader
// Clean typography, structured layout, action-oriented sidebar.

import { Streamdown } from "streamdown";
import type { CardDoc } from "@/lib/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ExternalLink, 
  Layers, 
  Target, 
  Quote, 
  HelpCircle,
  PlayCircle,
  Presentation,
  Hash,
  Sparkles,
  Zap,
  ArrowRight,
  Link
} from "lucide-react";

import type { Backlink } from "@/lib/graph";

export default function StructuredReader({ 
  card, 
  backlinks = [],
  onPresent,
  onOpenCard
}: { 
  card: CardDoc; 
  backlinks?: Backlink[];
  onPresent?: () => void;
  onOpenCard?: (id: string) => void;
}) {
  const sections = [
    { id: "core", icon: Target, title: "核心观点", color: "text-blue-600" },
    { id: "explanation", icon: HelpCircle, title: "解释说明", color: "text-indigo-600" },
    { id: "examples", icon: Quote, title: "实例论证", color: "text-violet-600" },
    { id: "scenarios", icon: PlayCircle, title: "应用场景", color: "text-emerald-600" },
  ];

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden antialiased">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth bg-white custom-scrollbar">
          <div className="max-w-4xl mx-auto p-10 md:p-16 space-y-12">
            {/* Header */}
            <header className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none px-3 font-bold">
                  BRICK L2
                </Badge>
                <Badge variant="outline" className="rounded-full border-border/50 uppercase text-[10px] tracking-widest font-bold text-foreground/40">
                  {card.type}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
                {card.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {card.tags.map(t => (
                  <Badge key={t} variant="outline" className="rounded-full border-border/60 text-foreground/50 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                    <Hash className="w-3 h-3 mr-1" />
                    {t}
                  </Badge>
                ))}
              </div>
            </header>

            <Separator className="bg-border/30" />

            {/* Markdown Content */}
            <article className="prose prose-slate prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:border-b-0 prose-h2:mb-8
              prose-p:leading-relaxed prose-p:text-slate-600
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
              <Streamdown>{card.content}</Streamdown>
            </article>

            {/* Semantic Suggestions */}
            {card.categories.length > 0 && (
              <div className="pt-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary/60 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> 语义联想推荐
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {card.categories.map(cat => (
                    <div key={cat.id} className="group p-4 rounded-xl border border-border/40 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all cursor-default">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        检测到文中包含与 <span className="text-primary font-medium">{cat.members.slice(0, 3).join("、")}</span> 等相关的专业表述，已自动关联至该本体。
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Backlinks Panel */}
            {backlinks.length > 0 && (
              <div className="pt-8 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary/60 uppercase tracking-widest">
                  <Link className="w-3 h-3" /> 被以下内容引用 ({backlinks.length})
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {backlinks.map((link, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onOpenCard?.(link.sourceId)}
                      className="group p-4 rounded-xl border border-border/40 bg-white hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer ring-1 ring-black/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors flex items-center gap-2">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {link.sourceTitle}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-border/30 font-mono">
                        "{link.context}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Metrics */}
            <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 ring-1 ring-black/5 flex flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Ready Status
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">内容就绪度</span>
                  <Badge className={`rounded-full ${card.outputReady === '高' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {card.outputReady}
                  </Badge>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 ring-1 ring-black/5 flex flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Layers className="w-3 h-3" /> System Logic
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">知识架构</span>
                  <span className="text-sm font-medium text-slate-500 underline">乐高式体系 / {card.tags[0] || 'Unsorted'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-[280px] flex-col border-l border-border/30 bg-slate-50/50 p-6 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Control</p>
            <Button 
              className="w-full justify-start h-12 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-1px] transition-all font-bold"
              onClick={onPresent}
            >
              <Presentation className="w-4 h-4 mr-3" />
              开启教学模式
            </Button>
            {card.sourceUrl && (
              <Button 
                variant="outline"
                asChild
                className="w-full justify-start h-12 rounded-xl bg-white border-border/60 hover:bg-slate-50 font-bold"
              >
                <a href={card.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-3" />
                  查看原始来源
                </a>
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</p>
            <div className="grid gap-2">
              {sections.map(s => (
                <button 
                  key={s.id}
                  onClick={() => {
                    const el = document.getElementById(s.title);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-left group"
                >
                  <s.icon className={`w-4 h-4 ${s.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 rounded-xl border border-dashed border-border/60 bg-white/50 space-y-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Metadata</p>
            <code className="text-[9px] block break-all font-mono text-slate-400">UUID: {card.id}</code>
          </div>
        </aside>
      </div>
    </div>
  );
}
