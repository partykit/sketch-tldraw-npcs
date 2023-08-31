import NPC, { NPCState } from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type { TLShape } from "@tldraw/tldraw";

import * as Y from "yjs";

import { getChatCompletionResponse, AIMessage } from "./utils/openai";

type NPCMemory = {
  pageId: string;
  centralX: number;
  centralY: number;
  radius: number;
  startTime: number;
  star: TLShape;
};

export type AnimateMessage = {
  type: "animate";
  radius: number;
};

export type ComposeMessage = {
  type: "compose";
};

export type BanishMessage = {
  type: "banish";
};

const AI_PROMPT: AIMessage[] = [
  {
    role: "system",
    content:
      "You are a dolphin poet. Compose a 2-4 line poem about the ocean, fish, or some other topic of high interest to dolphins. Dolphins are not balladic. Their language is earthy, vernacular. Short sentences. They are highly specific and knowledgable, so pick a random element of e.g. the sound of something or light or a detail about fish or an under-ocean feature and zoom waaaay in on that for your poem. This is not necessary a happy poem or one filled with wonder. It describes.",
  },
];

export default class NPCPoet extends NPC {
  npcMemory: NPCMemory = {} as NPCMemory;

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    await super.onMessage(message, connection);

    const msg = JSON.parse(message as string);

    if (msg.type === "animate") {
      const animateMessage = msg as AnimateMessage;
      this.npcMemory = {
        ...this.npcMemory,
        centralX: this.embassy!.x,
        centralY: this.embassy!.y,
        radius: animateMessage.radius,
      };
      this.animateNpc();
    } else if (msg.type === "compose") {
      const composeMessage = msg as ComposeMessage;
      // create a new x and y which are 100 away from msg.x and msg.y in a random direction
      // randomise the angle then use trig
      const originX = this.embassy!.x;
      const originY = this.embassy!.y;
      const angle = Math.random() * 2 * Math.PI;
      const x = originX + 300 * Math.cos(angle);
      const y = originY + 300 * Math.sin(angle);
      await this.travel(x, y);
      const blankTextShape = await this.tldraw?.makeTextShape(x, y);
      let poem = "";
      await getChatCompletionResponse(
        this.party.env,
        AI_PROMPT,
        async () => {
          this.tldraw!.updateShape(blankTextShape!);
        },
        async (token) => {
          poem += token;
          this.tldraw!.updateShape(blankTextShape!, { props: { text: poem } });
        }
      );
      await this.travel(originX, originY);
    } else if (msg.type === "paint") {
      if (!this.npcMemory.star) return;
      this.tldraw!.updateShape(this.npcMemory.star, {
        props: { fill: "pattern", color: "yellow" },
      });
      await this.travel(this.embassy!.x, this.embassy!.y);
      this.changeState(NPCState.Idle);
    }
  }

  animateNpc() {
    this.npcMemory.startTime = Date.now();
    const MOVING_CURSOR_SPEED = 0.3;

    // Make a function to update the localStateField. We'll call this every 10ms
    const updatePosition = async () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.npcMemory.startTime;
      const k = 1000 / MOVING_CURSOR_SPEED;
      const t = (elapsedTime % k) / k;
      const x =
        this.npcMemory.centralX +
        this.npcMemory.radius * Math.cos(2 * Math.PI * t);
      const y =
        this.npcMemory.centralY +
        this.npcMemory.radius * Math.sin(2 * Math.PI * t);
      await this.tldraw!.updatePresence({ cursor: { x, y } });
    };

    // Call updatePosition every 10ms, and cancel after 5s
    // Remember that updatePosition is async
    const interval = setInterval(() => {
      updatePosition();
    }, 10);

    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
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
