import { useEffect } from "react";
import { Editor, TLGeoShape, createShapeId } from "@tldraw/tldraw";
import { useNpc } from "./npc-context";

import Button from "./Button";

import { BARGE_SIDE, BARGE_HEIGHT, POOL_RADIUS } from "@/shared/embassy";

export const EMBASSY_ID_STRING = "embassy";

export default function CreateEmbassy() {
  const { editor, embassy } = useNpc();

  // The embassy may already exist
  useEffect(() => {
    if (!editor) return;
    const id = createShapeId(EMBASSY_ID_STRING);
    // @TODO handle multiple pages
    if (editor.currentPageShapeIds.has(id)) {
      //setEmbassyId(id);
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

    editor.zoomToFit();
  };

  if (embassy) return;

  return (
    <Button onClick={() => handleCreate(editor)} disabled={embassy !== null}>
      Create Embassy
    </Button>
  );
}
