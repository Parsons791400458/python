// Neo-brutalism knowledge console
// Command palette best practice: Ctrl/Cmd+K for global search & quick navigation.

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { CardDoc } from "@/lib/cards";
import { BookOpen, Network, Sparkles } from "lucide-react";

export default function CommandPalette({
  cards,
  onOpenCard,
  onNavigate,
}: {
  cards: CardDoc[];
  onOpenCard: (cardId: string) => void;
  onNavigate: (view: "console" | "map") => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const top = useMemo(() => cards.slice(0, 60), [cards]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-[720px] rounded-none border-2 border-foreground bg-card">
        <Command className="rounded-none">
          <div className="flex items-center justify-between px-3 pt-3">
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-display text-xl">命令面板</span>
            </div>
            <Badge variant="outline" className="rounded-none border-foreground/70">
              Ctrl/⌘ + K
            </Badge>
          </div>
          <CommandInput placeholder="搜索卡片，或输入 action…" />
          <CommandList>
            <CommandEmpty>没有匹配结果</CommandEmpty>

            <CommandGroup heading="导航">
              <CommandItem
                value="nav console"
                onSelect={() => {
                  onNavigate("console");
                  setOpen(false);
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                控制台
              </CommandItem>
              <CommandItem
                value="nav map"
                onSelect={() => {
                  onNavigate("map");
                  setOpen(false);
                }}
              >
                <Network className="mr-2 h-4 w-4" />
                知识地图
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="卡片（前 60 条）">
              {top.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.title + " " + c.tags.join(" ")}
                  onSelect={() => {
                    onOpenCard(c.id);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{c.title}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-none border border-foreground/40">
                      {c.type}
                    </Badge>
                    <Badge variant="outline" className="rounded-none border-foreground/70">
                      {c.outputReady}
                    </Badge>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
