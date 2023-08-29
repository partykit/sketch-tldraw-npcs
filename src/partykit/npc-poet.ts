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
import TldrawUtils from "./utils/tldraw";

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

  doc: Y.Doc | undefined;
  provider: YProvider | undefined;
  awareness: YProvider["awareness"] | undefined;

  tldraw: TldrawUtils | undefined;

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
    if (!this.tldraw) {
      // This is shared amongst all connections, So if it's not here already,
      // we need to set it up

      // the url has the pattern /parties/:server/:party.id. We need to grab ':server'
      // Be explicit about this: remove '/parties' from the beginning, and go up to the next '/'
      const url = new URL(ctx.request.url);
      const host = url.host;
      const server = url.pathname.slice("/parties".length).split("/")[1];
      const partyId = this.party.id;

      this.doc = new Y.Doc();
      this.provider = new YProvider(host, partyId, this.doc);
      this.awareness = this.provider.awareness;
      this.doc.on("update", this.onContentUpdate.bind(this));
      this.awareness.on("change", this.onAwarenessUpdate.bind(this));

      this.tldraw = await new TldrawUtils().init(
        this.doc,
        this.awareness,
        this.doc.clientID,
        server,
        partyId
      );
    }
  }

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    const msg = JSON.parse(message as string);
    console.log("[npc] onMessage", JSON.stringify(msg, null, 2));
    if (msg.type === "init") {
      const initMessage = msg as InitMessage;
      const { pageId, embassyX, embassyY } = initMessage;
      await this.tldraw!.summon(pageId, {
        cursor: { x: embassyX, y: embassyY },
      });
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
      const x = composeMessage.x + 300 * Math.cos(angle);
      const y = composeMessage.y + 300 * Math.sin(angle);
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
      await this.travel(composeMessage.x, composeMessage.y);
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

  async travel(x: number, y: number) {
    const currentTime = Date.now();
    const CURSOR_SPEED = 3;

    const updatePosition = async () => {
      const currentPresence = await this.tldraw!.getPresence();
      const { x: currentX, y: currentY } = currentPresence.cursor;
      // Get the distance between the current position and the target position
      const distance = Math.sqrt((currentX - x) ** 2 + (currentY - y) ** 2);
      // If it's less than the speed, we're done
      if (distance < CURSOR_SPEED) {
        return false;
      }
      // Otherwise, move towards the target
      const angle = Math.atan2(y - currentY, x - currentX);
      const newX = currentX + CURSOR_SPEED * Math.cos(angle);
      const newY = currentY + CURSOR_SPEED * Math.sin(angle);
      await this.tldraw!.updatePresence({ cursor: { x: newX, y: newY } });
      return true;
    };

    // Call updatePosition every 10ms until it returns false
    const interval = setInterval(async () => {
      const keepGoing = await updatePosition();
      if (!keepGoing) {
        clearInterval(interval);
      }
    }, 10);
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
