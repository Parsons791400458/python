// Dictionary View: Organized Knowledge Ontology
// Displays grouped terms and consolidated categories.

import { KNOWLEDGE_ONTOLOGY } from "@/lib/ontology";
import { cards } from "@/lib/cards";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Info, Combine } from "lucide-react";

export default function DictionaryView() {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <header className="flex flex-col space-y-1">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Combine className="w-6 h-6 text-primary" />
          知识词典 / 同类项整合
        </h2>
        <p className="text-sm text-muted-foreground">
          自动根据本体规则对碎片化关键词进行聚类管理。
        </p>
      </header>

      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          {KNOWLEDGE_ONTOLOGY.map(category => {
            const relatedCardsCount = cards.filter(c => 
              c.categories.some(cat => cat.id === category.id)
            ).length;

            return (
              <div 
                key={category.id} 
                className="group relative bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all"
              >
                <div 
                  className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" 
                  style={{ backgroundColor: category.color }}
                />
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {category.label}
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 border-none">
                      {relatedCardsCount} 积木
                    </Badge>
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.members.map(member => {
                    const isMentioned = cards.some(c => 
                      c.tags.some(t => t.toLowerCase() === member.toLowerCase() || t.toLowerCase().includes(member.toLowerCase()))
                    );

                    return (
                      <Badge 
                        key={member}
                        variant="outline"
                        className={`rounded-full px-3 py-1 font-medium transition-all ${
                          isMentioned 
                            ? "border-primary/20 bg-primary/5 text-primary" 
                            : "opacity-40 grayscale"
                        }`}
                      >
                        {member}
                      </Badge>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Info className="w-3 h-3" />
                  映射规则：子项出现即归入 {category.label}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
