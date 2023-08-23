import { useEffect, useState } from "react";
import {
  DefaultColorStyle,
  Editor,
  TLGeoShape,
  TLShapePartial,
  TLShape,
  Tldraw,
  createShapeId,
  useEditor,
} from "@tldraw/tldraw";
import { useNpc } from "./npc-context";

const EMBASSY_ID_STRING = "embassy";

// barge is an equilateral triangle
const BARGE_SIDE = 160;
const BARGE_HEIGHT = (Math.sqrt(3) / 2) * BARGE_SIDE;
// pool is a circle that fit snugly inside the equilateral triangle, without going outside
export const POOL_RADIUS = (Math.sqrt(3) / 6) * BARGE_SIDE;

export function getCentroidForEmbassy(embassy: TLShape) {
  const centroid = {
    x: embassy.x + BARGE_HEIGHT - POOL_RADIUS,
    y: embassy.y + BARGE_SIDE / 2,
  };
  return centroid;
}

export default function CreateEmbassy() {
  const { editor, embassyId, setEmbassyId } = useNpc();

  // The embassy may already exist
  useEffect(() => {
    if (!editor) return;
    const id = createShapeId(EMBASSY_ID_STRING);
    // @TODO handle multiple pages
    if (editor.currentPageShapeIds.has(id)) {
      setEmbassyId(id);
    }
  }, [editor]);

  if (!editor) return null;

  const handleCreate = (editor: Editor) => {
    const x = 128 + Math.random() * 500;
    const y = 128 + Math.random() * 500;

    // Create the barge
    const bargeId = createShapeId("barge");
    editor.createShapes<TLGeoShape>([
      {
        id: bargeId,
        type: "geo",
        x,
        y,
        rotation: -Math.PI / 2,
        props: {
          geo: "triangle",
          w: BARGE_SIDE,
          h: BARGE_HEIGHT,
          dash: "draw",
          color: "blue",
          size: "m",
        },
      },
    ]);

    const poolId = createShapeId("pool");
    editor.createShapes<TLGeoShape>([
      {
        id: poolId,
        type: "geo",
        x: x + POOL_RADIUS,
        y: y - POOL_RADIUS - BARGE_SIDE / 2,
        props: {
          geo: "ellipse",
          w: POOL_RADIUS * 2,
          h: POOL_RADIUS * 2,
          dash: "draw",
          color: "blue",
          size: "m",
        },
      },
    ]);

    // Create a group of these shapes
    const embassyId = createShapeId(EMBASSY_ID_STRING);
    editor.groupShapes([bargeId, poolId], embassyId);
    setEmbassyId(embassyId);

    editor.zoomToFit();
  };

  return (
    <button
      onClick={() => handleCreate(editor)}
      className="w-full outline outline-1 outline-neutral-200 bg-neutral-100 hover:bg-neutral-300 disabled:bg-neutral-200 disabled:hover:bg-neutral-200 disabled:cursor-not-allowed text-neutral-500 disabled:text-neutral-400 rounded-full p-2"
      disabled={embassyId !== null}
    >
      Create Embassy
      {embassyId && (
        <span
          className="w-5 h-5 rounded-full inline-block ml-2 flex-inline justify-center items-center"
          style={{ backgroundColor: "#d9f3d6" }}
        >
          ✓
        </span>
      )}
    </button>
  );
}
