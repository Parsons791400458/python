// Microsoft Fluent Design AppShell
// Material: Acrylic (Glassmorphism), Typography: Plus Jakarta Sans

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Terminal, 
  Network, 
  Send, 
  GraduationCap, 
  LayoutDashboard,
  Box,
  Combine
} from "lucide-react";

export default function AppShell({
  view,
  onChangeView,
  children,
  stats,
}: {
  view: "dashboard" | "console" | "map" | "output" | "review" | "dictionary";
  onChangeView: (v: "dashboard" | "console" | "map" | "output" | "review" | "dictionary") => void;
  children: ReactNode;
  stats: { cards: number; tags: number };
}) {
  const NavItem = ({ 
    target, 
    icon: Icon, 
    label,
    comingSoon
  }: { 
    target: any, 
    icon: any, 
    label: string,
    comingSoon?: boolean 
  }) => (
    <Button
      variant={view === target ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start rounded-md px-3 py-2 transition-all duration-200",
        view === target ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-foreground/70 hover:text-foreground hover:bg-accent"
      )}
      onClick={() => comingSoon ? alert("功能建设中...") : onChangeView(target)}
    >
      <Icon className={cn("w-4 h-4 mr-3", view === target ? "text-primary" : "text-foreground/50")} />
      <span className="font-medium text-sm">{label}</span>
    </Button>
  );

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col lg:flex-row antialiased">
      {/* Sidebar */}
      <aside className="w-full lg:w-[260px] glass border-r border-border/50 flex flex-col shrink-0">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-xl tracking-tight">LEGO KM</div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/40 px-0.5">
            Lego Knowledge Management
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-white/50 border border-border/50 rounded-full text-[10px]">
              {stats.cards} 积木
            </Badge>
            <Badge variant="secondary" className="bg-white/50 border border-border/50 rounded-full text-[10px]">
              {stats.tags} 标签
            </Badge>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-bold text-foreground/40 px-3 py-2 uppercase">Workspace</p>
          <NavItem target="dashboard" icon={LayoutDashboard} label="系统仪表盘" />
          <NavItem target="console" icon={Terminal} label="工作控制台" />
          <NavItem target="dictionary" icon={Combine} label="知识本体词典" />
          <NavItem target="map" icon={Network} label="全域知识图谱" />
          
          <div className="pt-4 pb-2">
            <Separator className="bg-border/50" />
          </div>
          
          <p className="text-[10px] font-bold text-foreground/40 px-3 py-2 uppercase">Production</p>
          <NavItem target="output" icon={Send} label="输出队列" />
          <NavItem target="review" icon={GraduationCap} label="巩固训练" />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-white/40 border border-border/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              工作状态: 在线
            </div>
            <p className="text-[10px] text-foreground/40 leading-relaxed">
              快捷键: <kbd className="bg-white px-1 border rounded">Ctrl+K</kbd> 呼出命令面板进行全局导航。
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
