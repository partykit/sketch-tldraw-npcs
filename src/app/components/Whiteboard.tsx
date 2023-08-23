"use client";

import {
  DefaultColorStyle,
  Editor,
  TLGeoShape,
  TLShapePartial,
  Tldraw,
  createShapeId,
  useEditor,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useNpc } from "./npc-context";
import { useEffect } from "react";

export default function APIExample() {
  const { setEditor } = useNpc();
  const handleMount = (editor: Editor) => {
    setEditor(editor);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Tldraw persistenceKey="api-example" onMount={handleMount}>
        <InsideOfEditorContext />
      </Tldraw>
    </div>
  );
}

// Another (sneakier) way to access the current app is through React context.
// The Tldraw component provides the context, so you can add children to
// the component and access the app through the useEditor hook.

const InsideOfEditorContext = () => {
  const editor = useEditor();
  /*
  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      const selection = [...editor.selectedShapeIds];
      editor.selectAll();
      editor.setStyle(DefaultColorStyle, i % 2 ? "blue" : "light-blue");
      editor.setSelectedShapes(selection);
      i++;
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [editor]);*/

  return null;
};
