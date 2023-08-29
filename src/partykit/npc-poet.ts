import type {
  Party,
  PartyRequest,
  PartyServer,
  PartyConnection,
  PartyConnectionContext,
} from "partykit/server";

import type { TLPageId } from "@tldraw/tldraw";

import * as Y from "yjs";
import YProvider from "y-partykit/provider";

import { getChatCompletionResponse, AIMessage } from "./utils/openai";

// The NPC runs as a state machine
enum NPCState {
  NotConnected,
  Idle,
}

type NPCMemory = {
  pageId: string;
  centralX: number;
  centralY: number;
  radius: number;
  startTime: number;
};

export type InitMessage = {
  type: "init";
  pageId: string;
  embassyX: number;
  embassyY: number;
};

export type AnimateMessage = {
  type: "animate";
  x: number;
  y: number;
  radius: number;
};

export type ComposeMessage = {
  type: "compose";
  x: number;
  y: number;
};

const AI_PROMPT: AIMessage[] = [
  {
    role: "system",
    content:
      "You are a dolphin poet. Compose a 2-4 line poem about the ocean, fish, or some other topic of high interest to dolphins.",
  },
];

export default class NPC implements PartyServer {
  constructor(readonly party: Party) {}

  // Retain details about this server
  host: string | undefined;
  server: string | undefined;

  doc: Y.Doc | undefined;
  provider: YProvider | undefined;
  awareness: YProvider["awareness"] | undefined;

  npcState: NPCState = NPCState.NotConnected;
  npcMemory: NPCMemory = {} as NPCMemory;

  /*async onRequest(req: PartyRequest) {
    // POST request to this room is an invitation to connect to the party
    if (req.method === "POST") {
      if (!this.doc) {
        const host = await req.text();
        await this.onInvitation(host);
      }
    }

    return new Response("OK", { status: 200 });
  }*/

  async onConnect(connection: PartyConnection, ctx: PartyConnectionContext) {
    const url = new URL(ctx.request.url);
    this.host = url.host;
    // the url has the pattern /parties/:server/:party.id. We need to grab ':server'
    // Be explicit about this: remove '/parties' from the beginning, and go up to the next '/'
    this.server = url.pathname.slice("/parties".length).split("/")[1];
  }

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    const msg = JSON.parse(message as string);
    console.log("[npc] onMessage", JSON.stringify(msg, null, 2));
    if (msg.type === "init") {
      const initMessage = msg as InitMessage;
      const { pageId, embassyX, embassyY } = initMessage;
      this.npcMemory.pageId = pageId;
      await this.initNpc(pageId, embassyX, embassyY);
    } else if (msg.type === "animate") {
      const animateMessage = msg as AnimateMessage;
      this.npcMemory = {
        ...this.npcMemory,
        centralX: animateMessage.x,
        centralY: animateMessage.y,
        radius: animateMessage.radius,
      };
      this.animateNpc();
    } else if (msg.type === "compose") {
      const composeMessage = msg as ComposeMessage;
      // create a new x and y which are 100 away from msg.x and msg.y in a random direction
      // randomise the angle then use trig
      const angle = Math.random() * 2 * Math.PI;
      const x = composeMessage.x + 100 * Math.cos(angle);
      const y = composeMessage.y + 100 * Math.sin(angle);
      const map = this.doc!.getMap(`tl_${this.party.id}`);
      const index = getNewHighestIndex(map, this.npcMemory.pageId);
      const shapeId = await makeShapeId();
      let poem = "";
      getChatCompletionResponse(
        this.party.env,
        AI_PROMPT,
        async () => {
          const text = makeText(
            shapeId,
            this.npcMemory.pageId,
            index,
            x,
            y,
            poem
          );
          map.set(text.id, text);
        },
        async (token) => {
          poem += token;
          const text = makeText(
            shapeId,
            this.npcMemory.pageId,
            index,
            x,
            y,
            poem
          );
          map.set(text.id, text);
        }
      );
    }
  }

  async initNpc(pageId: string, embassyX: number, embassyY: number) {
    const room = this.party.id;
    this.doc = new Y.Doc();
    this.provider = new YProvider(this.host!, room, this.doc);
    this.awareness = this.provider.awareness;
    this.doc.on("update", this.onContentUpdate.bind(this));
    this.awareness.on("change", this.onAwarenessUpdate.bind(this));
    const x = embassyX;
    const y = embassyY;
    const presence = await makePresence(
      this.doc.clientID,
      this.server!,
      pageId,
      x,
      y
    );
    this.awareness.setLocalStateField("presence", {
      ...presence,
      lastActivityTimestamp: Date.now(),
    });
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
      const presence = await makePresence(
        this.doc!.clientID,
        this.server!,
        this.npcMemory.pageId,
        x,
        y
      );
      this.awareness!.setLocalStateField("presence", {
        ...presence,
        lastActivityTimestamp: currentTime,
      });
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

  onAwarenessUpdate() {
    const connectedPeople = this.awareness?.getStates().size;
    //console.log(
    //  `${connectedPeople} ${connectedPeople === 1 ? "Person" : "People"} here.`
    //);
  }

  onContentUpdate() {
    /*const message = this.doc?.getText("message");
    if (!message) {
      return;
    }

    // if the message contains the string "@npc", respond with a message
    const text = message.toJSON();
    if (text.includes("@npc")) {
      setTimeout(() => {
        const newText = `npc ${this.party.id} reporting for duty 🫡`;
        this.doc?.transact(() => {
          message.delete(0, message.length);
          message.insert(0, newText);
        });
      }, 500);
    }*/
  }
}

async function makePresence(
  clientId: number,
  userId: string,
  pageId: string,
  x: number,
  y: number
) {
  const { InstancePresenceRecordType } = await import("@tldraw/tldraw");
  const presenceId = InstancePresenceRecordType.createId(clientId.toString());

  const record = {
    id: presenceId, //InstancePresenceRecordType.createId(editor.store.id),
    currentPageId: pageId as TLPageId,
    userId: userId,
    userName: "🐬", // dolphin emoji
    cursor: {
      x: x,
      y: y,
      type: "default",
      rotation: 0,
    },
    chatMessage: "eeee e ee",
    color: "#4aa181", //"#d9f3d6" is the completion color for AI. The darker is the button color
  };
  //console.log("[npc] makePresence", JSON.stringify(record, null, 2));
  return InstancePresenceRecordType.create(record);
}

async function makeShapeId() {
  const { createShapeId } = await import("@tldraw/tldraw");
  return createShapeId();
}

function makeText(
  id: string,
  pageId: string,
  index: string,
  x: number,
  y: number,
  text = ""
) {
  const textShape = {
    id,
    type: "text",
    x,
    y,
    isLocked: false,
    rotation: 0,
    opacity: 1,
    meta: {},
    props: {
      color: "black",
      size: "m",
      w: 100,
      // "w": etc
      text: text,
      font: "draw",
      align: "middle",
      autoSize: true,
      scale: 1,
    },
    parentId: pageId as TLPageId,
    index: index,
    typeName: "shape",
  };
  return textShape;
}

function getNewHighestIndex(map: Y.Map<any>, pageId: string) {
  // Get all indexes of records with `parentId: pageId as TLPageId`
  // We can use map.entries, or map.values
  const records = Array.from(map.values());
  const indexes = records
    .filter((record) => record.parentId === (pageId as TLPageId))
    .map((record) => record.index);
  // Find the highest index using string comparison ("a6" is greater than "a5")
  const highestIndex = indexes.reduce((highest, index) => {
    if (index > highest) {
      return index;
    }
    return highest;
  }, "a0");
  // Increment the highest index
  const newHighestIndex = highestIndex.replace(
    /(\d+)$/,
    (match: string, number: string) => `${match}${parseInt(number, 10) + 1}`
  );
  return newHighestIndex;
}
