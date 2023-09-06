/*
 * Can be used with
 * https://github.com/tldraw/tldraw-yjs-example/tree/main/src
 * and the hostName
 * ws://127.0.0.1:1999/party
 */

import { PartyKitServer, PartyKitRoom } from "partykit/server";
import { onConnect } from "y-partykit";
import { YPartyKitStorage } from "y-partykit/storage";

import { type TLInstancePresence, TLRecord } from "@tldraw/tldraw";

type YDocRoom = {
  ydoc: any;
  awareness: any;
} & PartyKitRoom;

//export default { onConnect };
export default {
  onConnect(ws, room) {
    console.log("[main] onConnect: someone connected");
    return onConnect(ws, room, {
      persist: true,
      callback: {
        async handler(ydoc) {
          // called every few seconds after edits
          /*
          try {
            (room as YDocRoom).ydoc = ydoc;
            const awareness = (ydoc as any).awareness;
            (room as YDocRoom).awareness = awareness;
            const states = awareness.getStates() as Map<
              number,
              { presence: TLInstancePresence }
            >;
            // pretty print the whole of states
            //console.log("states", JSON.stringify(Array.from(states), null, 2));
          } catch (e) {
            console.error(e);
          }*/
        },
      },
    });
  },
  async onRequest(req, room) {
    const storage = new YPartyKitStorage(room.storage);
    const ydoc = await storage.getYDoc(room.id);

    if (req.method === "GET") {
      if (!ydoc) {
        return new Response("No ydoc yet", { status: 404 });
      }
      const map = ydoc.getMap(`tl_${room.id}`);
      return new Response(JSON.stringify(map.toJSON(), null, 2));
    }

    return new Response("Unsupported method", { status: 400 });
  },
} satisfies PartyKitServer;
