import type { TreemapItem } from "@/components/data-display/category-treemap";
import type { TreemapGridConfig } from "@/lib/mock-data/treemap-hierarchy";
import { parseRevenueMillion } from "@/lib/mock-data/treemap-revenue";

const GRID_COLS = 12;
const GRID_ROWS = 9;

type Rect = { x: number; y: number; w: number; h: number };

interface WeightedItem {
  id: string;
  value: number;
}

function toGridArea({ x, y, w, h }: Rect): string {
  return `${y + 1} / ${x + 1} / ${y + h + 1} / ${x + w + 1}`;
}

function worst(row: number[], side: number): number {
  if (row.length === 0) return Infinity;
  const sum = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  const s2 = sum * sum;
  const l2 = side * side;
  return Math.max((l2 * max) / s2, s2 / (l2 * min));
}

function squarify(items: WeightedItem[], rect: Rect, out: Map<string, Rect>): void {
  if (items.length === 0) return;

  if (items.length === 1) {
    out.set(items[0].id, { ...rect });
    return;
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const horizontal = rect.w >= rect.h;
  const side = horizontal ? rect.h : rect.w;

  const row: WeightedItem[] = [];
  const rest = [...items];

  while (rest.length > 0) {
    const candidate = rest[0];
    const rowValues = [...row, candidate].map((item) => item.value);
    if (
      row.length === 0 ||
      worst(rowValues, side) <= worst(
        row.map((item) => item.value),
        side,
      )
    ) {
      row.push(candidate);
      rest.shift();
    } else {
      break;
    }
  }

  const rowSum = row.reduce((sum, item) => sum + item.value, 0);
  const fraction = rowSum / total;

  if (horizontal) {
    const stripW = Math.max(1, Math.round(rect.w * fraction));
    let offsetY = rect.y;
    const rowBottom = rect.y + rect.h;

    row.forEach((item, index) => {
      const isLast = index === row.length - 1;
      const itemH = isLast ? rowBottom - offsetY : Math.max(1, Math.round((rect.h * item.value) / rowSum));
      out.set(item.id, { x: rect.x, y: offsetY, w: stripW, h: itemH });
      offsetY += itemH;
    });

    if (rest.length > 0) {
      squarify(rest, {
        x: rect.x + stripW,
        y: rect.y,
        w: Math.max(1, rect.w - stripW),
        h: rect.h,
      }, out);
    }
    return;
  }

  const stripH = Math.max(1, Math.round(rect.h * fraction));
  let offsetX = rect.x;
  const rowRight = rect.x + rect.w;

  row.forEach((item, index) => {
    const isLast = index === row.length - 1;
    const itemW = isLast ? rowRight - offsetX : Math.max(1, Math.round((rect.w * item.value) / rowSum));
    out.set(item.id, { x: offsetX, y: rect.y, w: itemW, h: stripH });
    offsetX += itemW;
  });

  if (rest.length > 0) {
    squarify(rest, {
      x: rect.x,
      y: rect.y + stripH,
      w: rect.w,
      h: Math.max(1, rect.h - stripH),
    }, out);
  }
}

/** Re-layout treemap tiles by revenue so filtered categories fill the grid without gaps. */
export function layoutTreemapItems(items: TreemapItem[]): {
  items: TreemapItem[];
  gridConfig: TreemapGridConfig;
} {
  if (items.length === 0) {
    return {
      items: [],
      gridConfig: { columns: 1, rowTemplate: "1fr" },
    };
  }

  if (items.length === 1) {
    return {
      items: [{ ...items[0], gridArea: toGridArea({ x: 0, y: 0, w: GRID_COLS, h: GRID_ROWS }) }],
      gridConfig: {
        columns: GRID_COLS,
        rowTemplate: `repeat(${GRID_ROWS}, 1fr)`,
      },
    };
  }

  const weighted = [...items]
    .map((item) => ({
      id: item.id,
      value: Math.max(parseRevenueMillion(item.revenue), 0.05),
    }))
    .sort((a, b) => b.value - a.value);

  const rects = new Map<string, Rect>();
  squarify(weighted, { x: 0, y: 0, w: GRID_COLS, h: GRID_ROWS }, rects);

  return {
    items: items.map((item) => ({
      ...item,
      gridArea: rects.has(item.id) ? toGridArea(rects.get(item.id)!) : item.gridArea,
    })),
    gridConfig: {
      columns: GRID_COLS,
      rowTemplate: `repeat(${GRID_ROWS}, 1fr)`,
    },
  };
}
