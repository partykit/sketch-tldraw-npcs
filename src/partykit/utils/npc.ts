import type {
  Party,
  PartyServer,
  PartyConnection,
  PartyConnectionContext,
  PartyRequest,
} from "partykit/server";

import type { TLShape } from "@tldraw/tldraw";

import * as Y from "yjs";
import YProvider from "y-partykit/provider";

import TldrawUtils from "./tldraw";

import { getCentroidForEmbassy } from "@/shared/embassy";

// The NPC runs as a state machine
export enum NPCState {
  NotConnected,
  Idle,
  Painting,
  Making,
}

export type SummonMessage = {
  type: "summon";
  pageId: string;
};

export type BanishMessage = {
  type: "banish";
};

export type StateMessage = {
  type: "state";
  state: NPCState;
};

export default class NPC implements PartyServer {
  constructor(readonly party: Party) {}

  doc: Y.Doc | undefined;
  provider: YProvider | undefined;
  awareness: YProvider["awareness"] | undefined;

  tldraw: TldrawUtils | undefined;

  embassy: { x: number; y: number } | undefined;

  npcState: NPCState = NPCState.NotConnected;

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
      /*console.log(
        "Attempting to connect to host, server, partyId",
        host,
        server,
        partyId
      );*/

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

  onAlarm() {
    if (this.npcState !== NPCState.NotConnected) {
      this.tldraw!.updatePresence({});
      //console.log("onAlarm: updating presence");
      this.party.storage.setAlarm(new Date().getTime() + 1000 * 30);
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
    if (msg.type === "summon") {
      const summonMessage = msg as SummonMessage;
      const { pageId } = summonMessage;
      if (!this.embassy) return;
      await this.tldraw!.summon(pageId, {
        cursor: {
          x: this.embassy.x + Math.random() * 70 - 35,
          y: this.embassy.y + Math.random() * 70 - 35,
        },
      });
      this.changeState(NPCState.Idle);
      // Keep this NPC alive
      this.party.storage.setAlarm(new Date().getTime() + 1000 * 30);
    } else if (msg.type === "banish") {
      this.tldraw!.banish();
      this.changeState(NPCState.NotConnected);
    }
  }

  async updatePosition(targetX: number, targetY: number) {
    const CURSOR_SPEED = 3;

    const currentPresence = await this.tldraw!.getPresence();
    const { x: currentX, y: currentY } = currentPresence.cursor;
    // Get the distance between the current position and the target position
    const distance = Math.sqrt(
      (currentX - targetX) ** 2 + (currentY - targetY) ** 2
    );
    // If it's less than the speed, we're done
    if (distance < CURSOR_SPEED * 6) {
      return false;
    }

    const speed = Math.max(
      CURSOR_SPEED * 5,
      Math.max(CURSOR_SPEED, distance / 20)
    );
    // Otherwise, move towards the target
    const angle = Math.atan2(targetY - currentY, targetX - currentX);
    const newX = currentX + speed * Math.cos(angle);
    const newY = currentY + speed * Math.sin(angle);
    await this.tldraw!.updatePresence({ cursor: { x: newX, y: newY } });
    return true;
  }

  async travel(x: number, y: number) {
    let interval: NodeJS.Timeout;

    const doTravel = (): Promise<void> => {
      return new Promise((resolve) => {
        // Call updatePosition every 30ms until it returns false
        interval = setInterval(async () => {
          const keepGoing = await this.updatePosition(x, y);
          //console.log("keepGoing", keepGoing);
          if (!keepGoing) {
            clearInterval(interval);
            resolve();
          }
        }, 30);
      });
    };
    await Promise.race([
      doTravel(),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
    ]).finally(() => {
      clearInterval(interval);
    });
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
      if (this.embassy) {
        this.embassy = undefined;
      }
    }
    if (embassy) {
      this.embassy = getCentroidForEmbassy(embassy);
      if (this.npcState === NPCState.Idle) {
        this.travel(this.embassy.x, this.embassy.y);
      }
    }

    return map; // so that subclasses can use it
  }
}
