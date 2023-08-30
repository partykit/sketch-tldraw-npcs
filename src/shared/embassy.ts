import { type TLShape } from "@tldraw/tldraw";

// barge is an equilateral triangle
export const BARGE_SIDE = 160;
export const BARGE_HEIGHT = (Math.sqrt(3) / 2) * BARGE_SIDE;
// pool is a circle that fit snugly inside the equilateral triangle, without going outside
export const POOL_RADIUS = (Math.sqrt(3) / 6) * BARGE_SIDE;

export function getCentroidForEmbassy(embassy: TLShape) {
  const centroid = {
    x: embassy.x + BARGE_HEIGHT - POOL_RADIUS,
    y: embassy.y + BARGE_SIDE / 2,
  };
  return centroid;
}
