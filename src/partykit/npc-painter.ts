import NPC, { NPCState } from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type { TLShape, TLShapeId, TLShapeProps } from "@tldraw/tldraw";

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
      this.tldraw!.updatePresence({ color: "#ec4899", chatMessage: "Painter" });
    } else if (msg.type === "paint") {
      if (!this.npcMemory.starId) return;
      const map = this.tldraw!.doc?.getMap(this.tldraw!.roomId);
      const star = map!.get(this.npcMemory.starId) as TLShape;
      this.tldraw!.updateShape(star, {
        props: { fill: "pattern", color: "light-red" },
      });
      this.tldraw!.updatePresence({ chatMessage: "Painter" });
      await this.travel(this.embassy!.x, this.embassy!.y);
      this.changeState(NPCState.Idle);
    }
  }

  async onContentUpdate() {
    const map = await super.onContentUpdate();
    if (!map) return;

    // Watch for shapes which are stars
    // Characteristics: parentId == this.tldraw.pageId, typeName == "shape", props.geo == "star"
    map.forEach(async (value: unknown, id: string, map: Y.Map<unknown>) => {
      const record = value as TLShape;
      const props = record.props as TLShapeProps;
      if (
        this.npcState === NPCState.Idle &&
        record.typeName === "shape" &&
        record.parentId === this.tldraw!.pageId &&
        props.geo === "star" &&
        props.fill !== "pattern" &&
        props.color !== "light-red"
      ) {
        await this.onNewStarShape(record);
      }
    });
    //console.log("[npc] onContentUpdate", JSON.stringify(this.embassy, null, 2));

    return map;
  }

  async onNewStarShape(shape: TLShape) {
    const x = shape.x + (shape.props as TLShapeProps).w / 2;
    const y = shape.y + (shape.props as TLShapeProps).h / 2;
    this.changeState(NPCState.Painting);
    await this.travel(x, y);
    this.npcMemory["starId"] = shape.id;
    const oh = `O${"h".repeat(1 + Math.floor(Math.random() * 6))}`;
    this.tldraw!.updatePresence({ chatMessage: `${oh} let me help` });
  }
}
