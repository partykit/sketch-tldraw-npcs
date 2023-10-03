/*
 * Can be used with
 * https://github.com/tldraw/tldraw-yjs-example/tree/main/src
 * and the hostName
 * ws://127.0.0.1:1999/party
 */

/*
 * Can be used with
 * https://github.com/tldraw/tldraw-yjs-example/tree/main/src
 * and the hostName
 * ws://127.0.0.1:1999/party
 */

import type * as Party from "partykit/server";
import { onConnect, unstable_getYDoc, type YPartyKitOptions } from "y-partykit";
import type { Doc as YDoc } from "yjs";
import { YKeyValue } from "y-utility/y-keyvalue";
import { type TLRecord } from "@tldraw/tldraw";

export default class YjsServer implements Party.Server {
  yjsOptions: YPartyKitOptions = { persist: true, gc: true };
  constructor(public party: Party.Party) {}

  getOpts() {
    // options must match when calling unstable_getYDoc and onConnect
    const opts: YPartyKitOptions = {
      persist: true,
      callback: { handler: (yDoc) => this.handleYDocChange(yDoc) },
    };
    return opts;
  }

  async onRequest() {
    const yDoc = await unstable_getYDoc(this.party, this.getOpts());
    const room = `tl_${this.party.id}`;
    const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(room);
    const yStore = new YKeyValue(yArr);

    return new Response(JSON.stringify({ [room]: yStore }, null, 2));
  }
  onConnect(conn: Party.Connection) {
    return onConnect(conn, this.party, this.getOpts());
  }
  handleYDocChange(yDoc: YDoc) {
    // called on every ydoc change
    //console.log("ydoc changed");
    /*const awareness = (yDoc as any).awareness;
    const states = awareness.getStates();
    console.log("states", states);*/
  }
}
