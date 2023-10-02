import NPC, { NPCState } from "./utils/npc";

import type { PartyConnection } from "partykit/server";

import type { TLShape } from "@tldraw/tldraw";

import {
  getChatCompletionResponse,
  AIMessage,
  AIFunction,
} from "./utils/openai";

type NPCMemory = {};

const AI_PROMPT: AIMessage[] = [
  {
    role: "system",
    content:
      "You assist the user in drawing shapes on a 2D canvas. You will be given instructions of what to draw. Respond ONLY with function calls (any other responses will be ignored)",
  },
  {
    role: "user",
    content:
      "The canvas has width 640 and height 480. The next message will be a description of what to draw. Respond with a function call to draw the necessary shapes. Fill most of the canvas.",
  } as AIMessage,
];

const AI_FUNCTIONS = [
  {
    name: "drawShapes",
    description: "Draws multiple shapes on the canvas",
    parameters: {
      type: "object",
      properties: {
        shapes: {
          type: "array",
          description: "A list of shapes to draw",
          items: {
            type: "object",
            properties: {
              x: {
                type: "number",
                description: "The x coordinate of the shape",
              },
              y: {
                type: "number",
                description: "The y coordinate of the shape",
              },
              width: {
                type: "number",
                description: "The width of the shape",
              },
              height: {
                type: "number",
                description: "The height of the shape",
              },
              geometry: {
                type: "string",
                description: "The type of shape to draw",
                enum: ["rectangle", "circle", "triangle"],
              },
            },
          },
        },
      },
    },
  },
] as AIFunction[];

export default class NPCPoet extends NPC {
  npcMemory: NPCMemory = {} as NPCMemory;

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    await super.onMessage(message, connection);

    const msg = JSON.parse(message as string);

    if (msg.type === "summon") {
      this.tldraw!.updatePresence({
        userName: "👷",
        color: "#0891b2",
        chatMessage: "Maker",
      });
    } else if (msg.type === "boxes") {
      await this.sendChatMessage("Ok I need to think about this...");
      this.changeState(NPCState.Thinking);
      this.circle(10, this.embassy!.x, this.embassy!.y);
      const messages = [
        ...AI_PROMPT,
        {
          role: "user",
          content: msg.prompt,
        } as AIMessage,
      ];
      let response = "";
      getChatCompletionResponse({
        env: this.party.env,
        messages: messages,
        functions: AI_FUNCTIONS,
        onStartCallback: async () => {
          console.log("started");
        },
        onTokenCallback: async (token) => {
          response += token;
          //console.log(response);
        },
        onFunctionCall: async (name: string, args: any) => {
          //console.log("onFunctionCall (callback)", name, JSON.stringify(args));
          if (name === "drawShapes") {
            this.changeState(NPCState.Making);
            const { shapes } = args;
            for (const shape of shapes) {
              console.log(
                new Date().toISOString(),
                "creating shape",
                JSON.stringify(shape, null, 2)
              );
              await this.travel(shape.x, shape.y);
              await this.tldraw!.createGeoShape(
                shape.x,
                shape.y,
                shape.width,
                shape.height,
                shape.geometry
              );
            }
            await this.travel(this.embassy?.x || 0, this.embassy?.y || 0);
          }
          this.changeState(NPCState.Idle);
          await this.sendChatMessage("Done!");
          return { success: true };
        },
      });
    }
  }
}
