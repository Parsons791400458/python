// Neo-brutalism teaching mode
// Immersive, slide-like view for teaching a specific card.

import { Streamdown } from "streamdown";
import type { CardDoc } from "@/lib/cards";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Maximize2, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function PresentMode({ 
  card, 
  onClose 
}: { 
  card: CardDoc; 
  onClose: () => void 
}) {
  const [step, setStep] = useState(0);
  
  // Parse content into pseudo-slides based on H2 headers
  const contentParts = card.content.split(/(?=##\s+)/g);
  
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col font-display selection:bg-accent selection:text-accent-foreground">
      {/* HUD Header */}
      <div className="p-6 border-b-4 border-foreground flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 border-2 border-foreground bg-accent shadow-[3px_3px_0_0_rgba(0,0,0,1)] text-xs font-bold uppercase">
            Presenting: L2 Knowledge Brick
          </div>
          <h2 className="text-3xl leading-none truncate max-w-xl">{card.title}</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClose}
          className="rounded-none border-4 border-foreground hover:bg-red-50"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Main Stage */}
        <main className="p-8 md:p-16 flex flex-col items-center justify-center bg-lego-studs">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-4xl bg-white border-8 border-foreground p-10 md:p-16 shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative"
            >
              <div className="absolute -top-6 -left-6 px-6 py-2 bg-black text-white border-4 border-foreground text-2xl">
                SLIDE {step + 1} / {contentParts.length}
              </div>
              
              <article className="prose prose-2xl prose-neutral max-w-none prose-headings:font-display prose-headings:text-5xl prose-headings:mb-10 prose-headings:tracking-tighter">
                <Streamdown>{contentParts[step]}</Streamdown>
              </article>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Presenter Sidebar */}
        <aside className="border-l-4 border-foreground bg-sidebar p-8 flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 flex items-center gap-2">
              <Monitor className="w-3 h-3" /> Teacher Controls
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                disabled={step === 0}
                onClick={() => setStep(s => Math.max(0, s - 1))}
                className="rounded-none border-2 border-foreground h-16 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none font-bold"
              >
                <ChevronLeft className="w-6 h-6 mr-2" /> 上一步
              </Button>
              <Button 
                onClick={() => setStep(s => Math.min(contentParts.length - 1, s + 1))}
                disabled={step === contentParts.length - 1}
                className="rounded-none border-2 border-foreground h-16 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none font-bold"
              >
                下一步 <ChevronRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40">Topic Navigation</p>
            <div className="space-y-2 max-h-[300px] overflow-auto pr-2">
              {contentParts.map((part, i) => {
                const title = part.match(/##\s+(.*)/)?.[1] || "Introduction";
                return (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`w-full text-left p-3 border-2 border-foreground font-bold text-sm transition-colors ${step === i ? 'bg-accent shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-card shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-secondary'}`}
                  >
                    {i + 1}. {title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto p-4 border-4 border-dashed border-foreground/30 bg-background flex flex-col items-center justify-center text-center">
            <Maximize2 className="w-6 h-6 opacity-30 mb-2" />
            <p className="text-[10px] font-black leading-tight text-foreground/50 uppercase">
              Full Immersive View<br/>For Online Teaching
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
