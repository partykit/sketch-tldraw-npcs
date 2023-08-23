/*
 * Can be used with
 * https://github.com/tldraw/tldraw-yjs-example/tree/main/src
 * and the hostName
 * ws://127.0.0.1:1999/party
 */
/*
import { PartyKitServer } from "partykit/server";
import { onConnect } from "y-partykit";

import { type TLInstancePresence } from "@tldraw/tldraw";

//export default { onConnect };
export default {
  onConnect(ws, room) {
    console.log("onConnect");
    return onConnect(ws, room, {
      callback: {
        async handler(ydoc) {
          // called every few seconds after edits
          try {
            const awareness = (ydoc as any).awareness;
            const states = awareness.getStates() as Map<
              number,
              { presence: TLInstancePresence }
            >;
            // pretty print the whole of states
            console.log("states", JSON.stringify(Array.from(states), null, 2));
          } catch (e) {
            console.error(e);
          }
        },
      },
    });
  },
} satisfies PartyKitServer;
*/
