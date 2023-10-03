import NPC, { NPCState } from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type {
  TLShape,
  TLShapeId,
  TLShapeProps,
  TLRecord,
} from "@tldraw/tldraw";

import * as Y from "yjs";

type NPCMemory = {
  starId: TLShapeId;
};

export default class NPCPainter extends NPC {
  npcMemory: NPCMemory = {} as NPCMemory;

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    await super.onMessage(message, connection);

    const msg = JSON.parse(message as string);

    if (msg.type === "summon") {
      this.tldraw!.updatePresence({
        userName: "🧑‍🎨",
        color: "#ec4899",
        chatMessage: "Painter",
      });
    } else if (msg.type === "paint") {
      if (!this.npcMemory.starId) return;
      if (!this.tldraw?.store) return;
      const star = this.tldraw.store.get(this.npcMemory.starId) as TLShape;
      this.tldraw.updateShape(star, {
        props: { fill: "pattern", color: "light-red" },
      });
      this.tldraw.updatePresence({ chatMessage: "Painter" });
      await this.travel(this.embassy!.x, this.embassy!.y);
      this.changeState(NPCState.Idle);
    }
  }

  async onContentUpdate() {
    const store = await super.onContentUpdate();
    if (!store) return;

    // Watch for shapes which are stars
    // Characteristics: parentId == this.tldraw.pageId, typeName == "shape", props.geo == "star"
    store.yarray.forEach(async (record: { key: string; val: TLRecord }) => {
      const shape = record.val as TLShape;
      const props = shape.props as TLShapeProps;
      if (
        this.npcState === NPCState.Idle &&
        shape.typeName === "shape" &&
        shape.parentId === this.tldraw!.pageId &&
        props.geo === "star" &&
        props.fill !== "pattern" &&
        props.color !== "light-red"
      ) {
        await this.onNewStarShape(shape);
      }
    });
    //console.log("[npc] onContentUpdate", JSON.stringify(this.embassy, null, 2));

    return store;
  }

  async onNewStarShape(shape: TLShape) {
    const x = shape.x + (shape.props as TLShapeProps).w / 2;
    const y = shape.y + (shape.props as TLShapeProps).h / 2;
    this.changeState(NPCState.Working);
    await this.travel(x, y);
    this.npcMemory["starId"] = shape.id;
    const oh = `O${"h".repeat(1 + Math.floor(Math.random() * 6))}`;
    await this.sendChatMessage("I can paint that!");
    this.tldraw!.updatePresence({ chatMessage: `${oh} let me help` });
  }
}
