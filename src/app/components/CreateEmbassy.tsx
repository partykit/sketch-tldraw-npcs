import {
  DefaultColorStyle,
  Editor,
  TLGeoShape,
  TLShapePartial,
  Tldraw,
  createShapeId,
  useEditor,
} from "@tldraw/tldraw";
import { useNpc } from "./npc-context";

export default function CreateEmbassy() {
  const { editor } = useNpc();

  if (!editor) return null;

  const handleCreate = (editor: Editor) => {
    const x = 128 + Math.random() * 500;
    const y = 128 + Math.random() * 500;

    const bargeSide = 160;
    // barge is an equilateral triangle
    const bargeHeight = (Math.sqrt(3) / 2) * bargeSide;
    // pool is a circle that fit snugly inside the equilateral triangle, without going outside
    const poolRadius = (Math.sqrt(3) / 6) * bargeSide;

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
          w: bargeSide,
          h: bargeHeight,
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
        x: x + poolRadius,
        y: y - poolRadius - bargeSide / 2,
        props: {
          geo: "ellipse",
          w: poolRadius * 2,
          h: poolRadius * 2,
          dash: "draw",
          color: "blue",
          size: "m",
        },
      },
    ]);

    // Create a group of these shapes
    const embassyId = createShapeId("embassy");
    editor.groupShapes([bargeId, poolId], embassyId);

    editor.zoomToFit();
  };

  return (
    <button
      onClick={() => handleCreate(editor)}
      className="w-full outline outline-1 outline-neutral-200 bg-neutral-100 hover:bg-neutral-300 text-neutral-500 rounded-full p-2"
    >
      Create Embassy
    </button>
  );
}
