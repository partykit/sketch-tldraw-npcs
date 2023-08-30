import type {
  Party,
  PartyRequest,
  PartyServer,
  PartyConnection,
  PartyConnectionContext,
} from "partykit/server";

import type { TLPageId, TLRecord, TLShape } from "@tldraw/tldraw";

import * as Y from "yjs";
import YProvider from "y-partykit/provider";

import { getChatCompletionResponse, AIMessage } from "./utils/openai";
import TldrawUtils from "./utils/tldraw";

import { getCentroidForEmbassy } from "@/shared/embassy";

// The NPC runs as a state machine
export enum NPCState {
  NotConnected,
  Idle,
  Painting,
}

type NPCMemory = {
  pageId: string;
  centralX: number;
  centralY: number;
  radius: number;
  startTime: number;
  star: TLShape;
};

export type SummonMessage = {
  type: "summon";
  pageId: string;
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

export type StateMessage = {
  type: "state";
  state: NPCState;
};

const AI_PROMPT: AIMessage[] = [
  {
    role: "system",
    content:
      "You are a dolphin poet. Compose a 2-4 line poem about the ocean, fish, or some other topic of high interest to dolphins. Dolphins are not balladic. Their language is earthy, vernacular. Short sentences. They are highly specific and knowledgable, so pick a random element of e.g. the sound of something or light or a detail about fish or an under-ocean feature and zoom waaaay in on that for your poem. This is not necessary a happy poem or one filled with wonder. It describes.",
  },
];

export default class NPC implements PartyServer {
  constructor(readonly party: Party) {}

  doc: Y.Doc | undefined;
  provider: YProvider | undefined;
  awareness: YProvider["awareness"] | undefined;

  tldraw: TldrawUtils | undefined;

  embassy: { x: number; y: number } | undefined;

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

      this.tldraw = await new TldrawUtils().init(
        this.doc,
        this.awareness,
        this.doc.clientID,
        server,
        partyId
      );

      await this.onContentUpdate(); // call once to init
      this.doc.on("update", this.onContentUpdate.bind(this));
      this.awareness.on("change", this.onAwarenessUpdate.bind(this));
    }

    connection.send(JSON.stringify({ type: "state", state: this.npcState }));
    if (this.npcState !== NPCState.NotConnected) {
      // Update the current presence state so new users can see the NPC
      await this.tldraw.updatePresence({});
    }
  }

  onClose(connection: PartyConnection) {
    const count = Array.from(this.party.getConnections()).length;
    if (count === 0) {
      console.log("Final connection closed, shutting down");
      this.doc?.destroy();
      this.tldraw = undefined;
      this.npcState = NPCState.NotConnected;
    }
  }

  changeState(newState: NPCState) {
    this.npcState = newState;
    this.party.broadcast(
      JSON.stringify({ type: "state", state: this.npcState })
    );
  }

  async onMessage(message: string | ArrayBuffer, connection: PartyConnection) {
    const msg = JSON.parse(message as string);
    /*console.log(
      "[npc] onMessage",
      JSON.stringify(msg, null, 2),
      "embassy",
      JSON.stringify(this.embassy, null, 2)
    );*/
    if (msg.type === "summon") {
      const summonMessage = msg as SummonMessage;
      const { pageId } = summonMessage;
      if (!this.embassy) return;
      await this.tldraw!.summon(pageId, {
        cursor: {
          x: this.embassy.x,
          y: this.embassy.y,
        },
      });
      this.changeState(NPCState.Idle);
    } else if (msg.type === "animate") {
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
    } else if (msg.type === "banish") {
      this.tldraw!.banish();
      this.changeState(NPCState.NotConnected);
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
      if (distance < CURSOR_SPEED * 5) {
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

  async onContentUpdate() {
    const map = this.doc?.getMap(this.tldraw!.roomId);
    if (!map) return;
    const { createShapeId } = await import("@tldraw/tldraw");
    const embassyId = createShapeId("embassy");
    const embassy = map.get(embassyId) as TLShape | undefined;

    if (!embassy) {
      this.embassy = undefined;
    }
    if (embassy) {
      this.embassy = getCentroidForEmbassy(embassy);
    }

    // Also watch for shapes which are stars
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
  }

  async onNewStarShape(shape: TLShape) {
    await this.travel(shape.x, shape.y);
    this.npcMemory["star"] = shape;
    this.changeState(NPCState.Painting);
  }
}
