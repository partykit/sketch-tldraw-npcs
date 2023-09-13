"use client";

import { useMemo } from "react";
import {
  DefaultColorStyle,
  Editor,
  TLGeoShape,
  TLShapePartial,
  Tldraw,
  createShapeId,
  useEditor,
  useValue,
  TLInstancePresence,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useTldraw } from "@/app/hooks/tldraw-context";
import { useYjsStore } from "@/app/hooks/useYjsStore";

export default function Whitedraw() {
  const { setEditor } = useTldraw();

  const store = useYjsStore({
    roomId: "dolphin-example",
    hostUrl: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
  });

  const handleMount = (editor: Editor) => {
    setEditor(editor);
    // Can update a chatMessage on self, but it won't appear to self
    /*editor.updateInstanceState({
      chatMessage: "HELLO WORLD",
      isChatting: true,
    });*/
  };

  return (
    <div className="tldraw__editor">
      <Tldraw store={store} onMount={handleMount}>
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
