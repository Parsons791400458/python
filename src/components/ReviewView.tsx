// Neo-brutalism knowledge console
// Review view: Spaced repetition logic (simplified) using localStorage state.

import { useEffect, useMemo, useState } from "react";
import type { CardDoc } from "@/lib/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface ReviewState {
  [cardId: string]: {
    lastReviewed: number; // timestamp
    count: number;
  };
}

export default function ReviewView({ cards, onSelectCard }: { cards: CardDoc[]; onSelectCard: (id: string) => void }) {
  const [reviewState, setReviewState] = useState<ReviewState>({});

  useEffect(() => {
    const saved = localStorage.getItem("lk_review_state");
    if (saved) {
      try { setReviewState(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveReview = (id: string) => {
    const newState = {
      ...reviewState,
      [id]: { lastReviewed: Date.now(), count: (reviewState[id]?.count || 0) + 1 }
    };
    setReviewState(newState);
    localStorage.setItem("lk_review_state", JSON.stringify(newState));
    toast.success("已标记为今日复习完成！");
  };

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const la = reviewState[a.id]?.lastReviewed || 0;
      const lb = reviewState[b.id]?.lastReviewed || 0;
      return la - lb; // oldest first
    });
  }, [cards, reviewState]);

  const pendingCount = useMemo(() => {
    const today = new Date().setHours(0,0,0,0);
    return cards.filter(c => (reviewState[c.id]?.lastReviewed || 0) < today).length;
  }, [cards, reviewState]);

  return (
    <div className="border-2 border-foreground h-full flex flex-col bg-background">
      <div className="p-4 border-b-2 border-foreground bg-accent/20 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl leading-none">知识复习</h2>
          <p className="text-xs text-foreground/70 mt-1">
            今日待复习：<span className="font-bold text-foreground">{pendingCount}</span> 篇。基于“乐高巩固机制”：反复讲清，直到成积木。
          </p>
        </div>
        <RefreshCw className="w-8 h-8 opacity-20" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sortedCards.map((c) => {
            const state = reviewState[c.id];
            const isDoneToday = state && state.lastReviewed > new Date().setHours(0,0,0,0);

            return (
              <Card 
                key={c.id} 
                className={`rounded-none border-2 border-foreground p-4 flex flex-col md:flex-row items-center gap-4 transition-all ${isDoneToday ? 'bg-muted opacity-60' : 'bg-card shadow-[6px_6px_0_0_rgba(0,0,0,1)]'}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-2xl leading-none truncate">{c.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      上次：{state ? new Date(state.lastReviewed).toLocaleDateString() : '从未'}
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      次数：{state?.count || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-none border-2 border-foreground flex-1 md:flex-none"
                    onClick={() => onSelectCard(c.id)}
                  >
                    查看内容
                  </Button>
                  <Button 
                    variant={isDoneToday ? "outline" : "default"}
                    size="sm" 
                    disabled={isDoneToday}
                    className="rounded-none border-2 border-foreground flex-1 md:flex-none"
                    onClick={() => saveReview(c.id)}
                  >
                    {isDoneToday ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
                    {isDoneToday ? "已复习" : "标记复习"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
