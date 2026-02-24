// Neo-brutalism knowledge console
// Output Queue: cards ready for content production (outputReady: 高)

import { useMemo } from "react";
import type { CardDoc } from "@/lib/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PenLine, FileText, ArrowRight } from "lucide-react";

export default function OutputQueue({ cards, onSelectCard }: { cards: CardDoc[]; onSelectCard: (id: string) => void }) {
  const readyCards = useMemo(() => cards.filter((c) => c.outputReady === "高"), [cards]);

  return (
    <div className="border-2 border-foreground h-full flex flex-col bg-background">
      <div className="p-4 border-b-2 border-foreground bg-accent/20 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl leading-none">输出队列</h2>
          <p className="text-xs text-foreground/70 mt-1">
            当前共有 {readyCards.length} 篇卡片处于“高可输出”状态，建议优先将其转化为文章或课件。
          </p>
        </div>
        <PenLine className="w-8 h-8 opacity-20" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {readyCards.map((c) => (
            <Card key={c.id} className="rounded-none border-2 border-foreground bg-card p-4 flex flex-col gap-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-display text-xl leading-tight truncate flex-1">{c.title}</h3>
                <Badge variant="outline" className="rounded-none border-foreground/50 shrink-0">
                  {c.type}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {c.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1 rounded-none border border-foreground/30">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto pt-2 flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="rounded-none border-2 border-foreground flex-1"
                  onClick={() => onSelectCard(c.id)}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  阅读并加工
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-none border-2 border-foreground bg-accent shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  onClick={() => alert("功能开发中：自动生成大纲...")}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
          {readyCards.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground">
              当前没有高可输出的卡片。请在控制台中标注更多 L2 卡片。
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
