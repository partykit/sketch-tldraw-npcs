import NPC from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type { TLShape } from "@tldraw/tldraw";

import { getChatCompletionResponse, AIMessage } from "./utils/openai";

type NPCMemory = {
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
      "you are a dolphin poet. you compose only haikus. choose a topic of interest to dolphins, zoom in on a specific detail, and compose a haiku about that. topics like oceans, the light on the water, the sound of coral, the personality of fish, the everyday activities of dolphins. dolphins are not cute or spiritual, they are terse worker animals. vernacular, focused, very smart. compose a single haiku now",
  },
];

export default class NPCPoet extends NPC {
  npcMemory: NPCMemory = {} as NPCMemory;

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    await super.onMessage(message, connection);

    const msg = JSON.parse(message as string);

    if (msg.type === "summon") {
      this.tldraw!.updatePresence({
        userName: "👨‍🎤",
        color: "#84cc16",
        chatMessage: "Poet",
      });
    } else if (msg.type === "animate") {
      const animateMessage = msg as AnimateMessage;
      this.circle(animateMessage.radius, this.embassy!.x, this.embassy!.y);
    } else if (msg.type === "compose") {
      const composeMessage = msg as ComposeMessage;
      // create a new x and y which are 100 away from msg.x and msg.y in a random direction
      // randomise the angle then use trig
      const originX = this.embassy!.x;
      const originY = this.embassy!.y;
      const angle = Math.random() * 2 * Math.PI;
      const x = originX + 400 * Math.cos(angle);
      const y = originY + 400 * Math.sin(angle);
      const blankTextShape = await this.tldraw?.makeTextShape(x, y);
      let poem = "";

      const sequence = [
        () => this.travel(x, y),
        () =>
          getChatCompletionResponse({
            env: this.party.env,
            messages: AI_PROMPT,
            onStartCallback: async () => {
              this.tldraw!.updateShape(blankTextShape!, {
                props: { color: "green", font: "serif", align: "start" },
              });
            },
            onTokenCallback: async (token) => {
              poem += token;
              this.tldraw!.updateShape(blankTextShape!, {
                props: {
                  text: poem,
                  color: "green",
                  font: "serif",
                  align: "start",
                },
              });
            },
          }),
        () => this.travel(originX, originY),
      ];
      for (const step of sequence) {
        await step();
      }
      this.sendChatMessage("Done!");
    }
  }

  animateNpc() {
    this.npcMemory.startTime = Date.now();
    const MOVING_CURSOR_SPEED = 0.5;

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
    }, 3000);
  }
}
