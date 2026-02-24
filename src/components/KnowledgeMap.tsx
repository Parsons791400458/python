// Neo-brutalism knowledge console
// Knowledge map: force-directed graph (SVG) with pan/zoom + neighbor highlight.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import type { GraphLink, GraphNode } from "@/lib/graph";
import { cn } from "@/lib/utils";
import { Minus, Plus, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MapNode = GraphNode & SimulationNodeDatum;
export type MapLink = GraphLink & SimulationLinkDatum<MapNode>;

function useResizeObserver(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      setSize({ width: Math.max(320, r.width), height: Math.max(360, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export default function KnowledgeMap({
  nodes,
  links,
  selectedId,
  onSelect,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId?: string;
  onSelect?: (node: GraphNode) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver(containerRef);
  const [tick, setTick] = useState(0);

  const [hover, setHover] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  // pan/zoom (simple, best-practice: keep transform in state, update via pointer)
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; lastX: number; lastY: number } | null>(null);

  const simRef = useRef<Simulation<MapNode, MapLink> | null>(null);

  const data = useMemo(() => {
    const ns: MapNode[] = nodes.map((n) => ({ ...n }));
    const idToNode = new Map(ns.map((n) => [n.id, n]));
    const ls: MapLink[] = links
      .map((l) => ({ ...l, source: idToNode.get(l.source)!, target: idToNode.get(l.target)! }))
      .filter((l) => l.source && l.target);
    return { ns, ls };
  }, [nodes, links]);

  // adjacency for highlight
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      if (!m.has(a)) m.set(a, new Set());
      m.get(a)!.add(b);
    };
    for (const l of links) {
      add(l.source, l.target);
      add(l.target, l.source);
    }
    return m;
  }, [links]);

  useEffect(() => {
    if (!data.ns.length) return;

    simRef.current?.stop();

    const sim = forceSimulation<MapNode>(data.ns)
      .force(
        "link",
        forceLink<MapNode, MapLink>(data.ls)
          .id((d: any) => d.id)
          .distance((l) => (l.kind === "module-card" ? 90 : 140))
          .strength((l) => (l.kind === "module-card" ? 0.85 : 0.25))
      )
      .force("charge", forceManyBody().strength(-240))
      .force(
        "collide",
        forceCollide<MapNode>().radius((d) => (d.kind === "module" ? 22 : 14) + 6)
      )
      .force("center", forceCenter(width / 2, height / 2))
      .alpha(1)
      .alphaDecay(0.045);

    sim.on("tick", () => setTick((t) => t + 1));
    simRef.current = sim as unknown as Simulation<MapNode, MapLink>;

    return () => sim.stop();
  }, [data.ns, data.ls, width, height]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = tick;

  const nodeColor = (n: GraphNode) => {
    if (activeKey && n.id === activeKey) return "oklch(0.55 0.18 255)";
    if (n.categoryColor) return n.categoryColor;
    if (n.kind === "module") return "oklch(0.74 0.19 60)";
    return "oklch(0.92 0.06 250)";
  };

  const activeKey = focused ?? hover ?? selectedId ?? null;
  const neighborSet = useMemo(() => {
    if (!activeKey) return null;
    return adjacency.get(activeKey) ?? null;
  }, [activeKey, adjacency]);

  const nodeStroke = (n: GraphNode) => {
    const isActive = activeKey && n.id === activeKey;
    const isNeighbor = neighborSet?.has(n.id);
    if (isActive) return "oklch(0.22 0 0)";
    if (isNeighbor) return "oklch(0.22 0 0 / 90%)";
    return "oklch(0.22 0 0 / 65%)";
  };

  const nodeOpacity = (n: GraphNode) => {
    if (!activeKey) return 1;
    if (n.id === activeKey) return 1;
    if (neighborSet?.has(n.id)) return 1;
    return 0.25;
  };

  const linkOpacity = (l: GraphLink) => {
    if (!activeKey) return 1;
    if (l.source === activeKey || l.target === activeKey) return 1;
    if (neighborSet?.has(l.source) && l.target === activeKey) return 1;
    if (neighborSet?.has(l.target) && l.source === activeKey) return 1;
    return 0.15;
  };

  const linkStroke = (l: GraphLink) => (l.kind === "module-card" ? "oklch(0.22 0 0 / 35%)" : "oklch(0.6 0 0 / 25%)");

  const clampScale = (v: number) => Math.min(2.2, Math.max(0.55, v));

  const zoom = (delta: number) => {
    setScale((s) => clampScale(s + delta));
  };

  const focusCenter = () => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-background relative"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!dragRef.current?.dragging) return;
        const dx = e.clientX - dragRef.current.lastX;
        const dy = e.clientY - dragRef.current.lastY;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      }}
      onPointerUp={() => {
        if (dragRef.current) dragRef.current.dragging = false;
      }}
      onWheel={(e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -0.08 : 0.08;
        setScale((s) => clampScale(s + dir));
      }}
      style={{ touchAction: "none" }}
    >
      <svg width={width} height={height} className="block">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="0" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          <g>
            {data.ls.map((l, i) => {
              const s = l.source as any;
              const t = l.target as any;
              return (
                <line
                  key={i}
                  x1={s?.x ?? 0}
                  y1={s?.y ?? 0}
                  x2={t?.x ?? 0}
                  y2={t?.y ?? 0}
                  stroke={linkStroke(l)}
                  strokeWidth={l.kind === "module-card" ? 2 : 1.5}
                  opacity={linkOpacity(l)}
                />
              );
            })}
          </g>

          <g>
            {data.ns.map((n) => {
              const r = n.kind === "module" ? 18 : 12;
              const isActive = activeKey && n.id === activeKey;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onDoubleClick={() => setFocused((cur) => (cur === n.id ? null : n.id))}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocused(n.id);
                    onSelect?.(n);
                  }}
                  style={{ cursor: "pointer", opacity: nodeOpacity(n) }}
                >
                  <circle
                    r={r}
                    fill={nodeColor(n)}
                    stroke={nodeStroke(n)}
                    strokeWidth={2.2}
                    filter="url(#shadow)"
                  />
                  <circle r={r * 0.28} cx={-r * 0.35} cy={-r * 0.18} fill="rgba(255,255,255,0.65)" />
                  <circle r={r * 0.22} cx={r * 0.2} cy={r * 0.22} fill="rgba(255,255,255,0.45)" />

                  <text
                    y={r + 14}
                    textAnchor="middle"
                    fontSize={n.kind === "module" ? 12 : 10}
                    fill="oklch(0.22 0 0)"
                    style={{ userSelect: "none", fontWeight: isActive ? 700 : 500 }}
                  >
                    {n.label.length > 12 ? n.label.slice(0, 12) + "…" : n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <div
        className={cn(
          "absolute left-3 top-3 bg-card text-card-foreground border-2 border-foreground/70",
          "shadow-[4px_4px_0_0_rgba(0,0,0,0.18)] p-2 text-xs max-w-[300px]"
        )}
      >
        <div className="font-display text-lg leading-none">知识地图</div>
        <div className="mt-1 text-foreground/70 leading-snug">
          拖拽平移、滚轮缩放；单击聚焦节点并高亮邻居；双击取消/锁定聚焦。
        </div>
      </div>

      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-none border-2 border-foreground bg-card"
          onClick={() => zoom(0.12)}
          aria-label="放大"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-none border-2 border-foreground bg-card"
          onClick={() => zoom(-0.12)}
          aria-label="缩小"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-none border-2 border-foreground bg-card"
          onClick={focusCenter}
          aria-label="重置视图"
        >
          <Focus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
