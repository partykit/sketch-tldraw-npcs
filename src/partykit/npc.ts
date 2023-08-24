import { PartyKitServer, PartyKitRoom } from "partykit/server";
import YPartyKitProvider from "y-partykit/provider";
import * as Y from "yjs";
import {
  type TLInstancePresence,
  InstancePresenceRecordType,
  TLPageId,
} from "@tldraw/tldraw";

type NPCParty = {
  doc: Y.Doc;
  provider: any; //YPartyKitProvider;
} & PartyKitRoom;

export default {
  onConnect(ws, room) {
    console.log("[npc] onConnect");
    // connect() will return a websocket
    //const server = room.context.parties.main.get(room.id);
    //console.log("[npc] server", JSON.stringify(server, null, 2));
    // create a provider
    const doc = new Y.Doc();
    const provider = new YPartyKitProvider("127.0.0.1:1999", room.id, doc, {
      connect: true,
      disableBc: true,
    });
    //const provider = server.connect();
    console.log("[npc] onConnect: got provider");
    // stash on the room
    (room as NPCParty).doc = doc;
    (room as NPCParty).provider = provider;
  },
  /*  async onMessage(message, ws, room) {
    const msg = JSON.parse(message as string);
    if (msg.type === "go") {
      const provider = (room as NPCParty).provider;
      await provider.connect();
      const awareness = provider.awareness;
      const presence = InstancePresenceRecordType.create({
        id: InstancePresenceRecordType.createId("npc-dolphin"),
        currentPageId: "page-1" as TLPageId,
        userId: "npc-dolphin",
        userName: "🐬", // dolphin emoji
        cursor: {
          x: 90,
          y: 90,
          type: "default",
          rotation: 0,
        },
        chatMessage: "eeee e ee",
        color: "#4aa181", //"#d9f3d6" is the completion color for AI. The darker is the button color
      });
      awareness.setLocalStateField("presence", presence);
    }
  },*/
  onClose(ws, room) {
    console.log("[npc] onClose");
    // disconnect the provider, if any
    if ((room as NPCParty).provider) {
      (room as NPCParty).provider.disconnect();
    }
  },
} satisfies PartyKitServer;
