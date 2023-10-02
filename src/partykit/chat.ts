import type {
  PartyServer,
  PartyServerOptions,
  PartyConnection,
  PartyConnectionContext,
  Party,
  PartyWorker,
  PartyRequest,
} from "partykit/server";

import * as Y from "yjs";
import YProvider from "y-partykit/provider";

import { type TLInstancePresence } from "@tldraw/tldraw";

export type User = {
  id: number;
  userId: string;
  isAnonymous: boolean;
  color: string;
  userName?: string;
};

type ChatMessage = {
  type: "chat";
  text: string;
  user: User;
};

export type SendMessage = {
  action: "send";
  text: string;
  userId: string;
};

export default class Chat implements PartyServer {
  constructor(readonly party: Party) {}

  doc: Y.Doc | undefined;
  provider: YProvider | undefined;
  awareness: YProvider["awareness"] | undefined;
  users: User[] = [];

  async onConnect(connection: PartyConnection, ctx: PartyConnectionContext) {
    if (!this.awareness) {
      // This is shared amongst all connections, So if it's not here already,
      // we need to set it up

      // the url has the pattern /parties/:server/:party.id. We need to grab ':server'
      // Be explicit about this: remove '/parties' from the beginning, and go up to the next '/'
      const url = new URL(ctx.request.url);
      const host = url.host;

      this.doc = new Y.Doc();
      this.provider = new YProvider(host, this.party.id, this.doc);
      this.awareness = this.provider.awareness;

      this.awareness.on("change", this.onAwarenessUpdate.bind(this));
    }
  }

  onMessage(message: string, connection: PartyConnection) {
    const msg = JSON.parse(message as string);
    switch (msg.type) {
      case "chat": {
        this.party.broadcast(message as string, [connection.id]);
        break;
      }
    }
  }

  onAwarenessUpdate() {
    // this.awareness.getStates() is a Map<number, { presence: TLInstancePresence | {} }>
    // we only want the TLInstancePresence objects, so we filter out the ones that don't have a presence
    const states = Array.from(this.awareness?.getStates() ?? [])
      .filter(([, state]) => state.presence)
      .map(([clientId, state]) => {
        return {
          clientId,
          presence: state.presence as TLInstancePresence,
        };
      });

    this.users =
      states.map(({ clientId, presence }) => {
        return {
          id: clientId,
          userId: presence.userId,
          isAnonymous: presence.userName === "New User",
          color: presence.color,
          userName: presence.userName,
        } as User;
      }) || [];

    this.party.broadcast(
      JSON.stringify({
        type: "presence",
        count: states.length,
        users: this.users,
      })
    );
  }

  async onRequest(req: PartyRequest) {
    const states = this.awareness?.getStates() ?? {};
    console.log("awareness state", this.awareness);

    if (req.method === "GET") {
      return new Response(JSON.stringify(serializable(states), null, 2));
    } else if (req.method === "POST") {
      const { userId, text } = (await req.json()) as SendMessage;
      // Get the user associated with userId
      const user = this.users.find((u) => u.userId === userId);
      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      const chatMessage = {
        type: "chat",
        text,
        user,
      } as ChatMessage;
      this.party.broadcast(JSON.stringify(chatMessage));
      return new Response(JSON.stringify({ status: "ok" }));
    }

    return new Response("Unsupported method", { status: 400 });
  }
}

// A function that converts any value to a JSON serializable value. It calls itself recursively
// Strings, numbers, booleans, and dates are passed through.
// Arrays looked at element by element, recursively.
// Maps and Sets are converted to arrays, and looked at element by element, recursively.
function serializable(value: any): any {
  if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "boolean") {
    return value;
  } else if (value instanceof Date) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map((v) => serializable(v));
  } else if (value instanceof Map) {
    return Array.from(value.entries()).map(([k, v]) => [
      serializable(k),
      serializable(v),
    ]);
  } else if (value instanceof Set) {
    return Array.from(value).map((v) => serializable(v));
  } else if (value === undefined) {
    return "undefined";
  } else if (value === null) {
    return "null";
  } else if (typeof value === "object") {
    const obj = {} as any;
    for (const [k, v] of Object.entries(value)) {
      obj[k] = serializable(v);
    }
    return obj;
  } else {
    return null;
  }
}
