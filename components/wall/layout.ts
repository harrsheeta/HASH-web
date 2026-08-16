import { boardSections, type BoardSection, type Video } from "@/lib/data";

export type CardSpec = {
  video: Video;
  sectionKey: string;
  x: number;
  y: number;
  rot: number;
  w: number;
  h: number;
  pinColor: string;
};

export type Cluster = { cx: number; cy: number; w: number; h: number };

export type WallLayout = {
  cards: CardSpec[];
  clusters: Record<string, Cluster>;
  overview: Cluster;
  sections: BoardSection[];
};

// Canvas pixel sizes drive card aspect ratios (polaroid frame + caption).
export const LAND = { cw: 640, ch: 504, w: 2.4 };
export const PORT = { cw: 360, ch: 746, w: 1.4 };

export const PIN_COLORS: Record<string, string> = {
  long: "#dfa155",
  short: "#3fbe8f",
  "3d": "#8c96c6",
};

const GAP = 0.5;
const ROW_GAP = 2.1; // vertical space between board rows (room for tape labels)
const COL_GAP = 2.4; // horizontal space between clusters sharing a row

// The wall is a collage: Long Form spans the top row,
// Reels and 3D sit side by side underneath.
const BOARD_ROWS: string[][] = [["long"], ["short", "3d"]];

// Deterministic tilt so SSR/CSR and re-renders agree.
const tilt = (i: number) => (((i * 47) % 21) / 21 - 0.5) * 0.11;

type ClusterShape = { section: BoardSection; w: number; h: number; cardW: number; cardH: number; rowCounts: number[] };

function shapeOf(section: BoardSection): ClusterShape {
  const dims = section.videos[0].orientation === "landscape" ? LAND : PORT;
  const cardW = dims.w;
  const cardH = (dims.w * dims.ch) / dims.cw;
  const perRow = 4;
  const rows = Math.ceil(section.videos.length / perRow);
  const rowCounts: number[] = [];
  let remaining = section.videos.length;
  for (let r = 0; r < rows; r++) {
    rowCounts.push(Math.min(perRow, remaining));
    remaining -= Math.min(perRow, remaining);
  }
  const w = Math.max(...rowCounts) * cardW + (Math.max(...rowCounts) - 1) * GAP;
  const h = rows * cardH + (rows - 1) * GAP;
  return { section, w, h, cardW, cardH, rowCounts };
}

export function buildWallLayout(): WallLayout {
  const cards: CardSpec[] = [];
  const clusters: Record<string, Cluster> = {};
  const shapes = new Map(boardSections.map((s) => [s.key, shapeOf(s)]));

  const rowHeights = BOARD_ROWS.map((row) => Math.max(...row.map((k) => shapes.get(k)!.h)));
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + (BOARD_ROWS.length - 1) * ROW_GAP;

  let globalIdx = 0;
  let yCursor = totalH / 2;

  BOARD_ROWS.forEach((row, ri) => {
    const rowH = rowHeights[ri];
    const rowW = row.reduce((acc, k) => acc + shapes.get(k)!.w, 0) + (row.length - 1) * COL_GAP;
    let xCursor = -rowW / 2;
    const rowCy = yCursor - rowH / 2;

    for (const key of row) {
      const shape = shapes.get(key)!;
      const cx = xCursor + shape.w / 2;

      let vi = 0;
      for (let r = 0; r < shape.rowCounts.length; r++) {
        const count = shape.rowCounts[r];
        const innerRowW = count * shape.cardW + (count - 1) * GAP;
        const y = rowCy + shape.h / 2 - shape.cardH / 2 - r * (shape.cardH + GAP);
        for (let c = 0; c < count; c++) {
          const x = cx - innerRowW / 2 + shape.cardW / 2 + c * (shape.cardW + GAP);
          cards.push({
            video: shape.section.videos[vi],
            sectionKey: key,
            x,
            y,
            rot: tilt(globalIdx),
            w: shape.cardW,
            h: shape.cardH,
            pinColor: PIN_COLORS[key] ?? "#dfa155",
          });
          vi++;
          globalIdx++;
        }
      }

      clusters[key] = { cx, cy: rowCy, w: shape.w, h: shape.h };
      xCursor += shape.w + COL_GAP;
    }

    yCursor -= rowH + ROW_GAP;
  });

  const maxRowW = Math.max(...BOARD_ROWS.map((row) => row.reduce((acc, k) => acc + shapes.get(k)!.w, 0) + (row.length - 1) * COL_GAP));

  return {
    cards,
    clusters,
    overview: { cx: 0, cy: 0.3, w: maxRowW, h: totalH + 0.4 },
    sections: boardSections,
  };
}
