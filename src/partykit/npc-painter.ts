import NPC, { NPCState } from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type { TLShape } from "@tldraw/tldraw";

import * as Y from "yjs";

type NPCMemory = {
  star: TLShape;
};

export default class NPCPainter extends NPC {
  npcMemory: NPCMemory = {} as NPCMemory;

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    await super.onMessage(message, connection);

    const msg = JSON.parse(message as string);

    if (msg.type === "paint") {
      if (!this.npcMemory.star) return;
      this.tldraw!.updateShape(this.npcMemory.star, {
        props: { fill: "pattern", color: "yellow" },
      });
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
      if (
        record.typeName === "shape" &&
        record.parentId === this.tldraw!.pageId &&
        (record.props as any).geo === "star" &&
        (record.props as any).fill !== "pattern" &&
        (record.props as any).color !== "yellow"
      ) {
        await this.onNewStarShape(record);
      }
    });
    //console.log("[npc] onContentUpdate", JSON.stringify(this.embassy, null, 2));

    return map;
  }

  async onNewStarShape(shape: TLShape) {
    await this.travel(shape.x, shape.y);
    this.npcMemory["star"] = shape;
    this.changeState(NPCState.Painting);
  }
}
