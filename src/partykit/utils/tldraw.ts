/* A utility class to work with tldraw
 *
 * Instantiate with:
 * - clientId -- will get made into a presenceId in the constructor
 * - serverName -- will be used as the userId
 * - roomId -- this is the persistence key of the tldraw instance
 * - pageId -- this is the page of the canvas that we're on
 */

import type { TLInstancePresence, TLPageId } from "@tldraw/tldraw";
import * as Y from "yjs";
import YProvider from "y-partykit/provider";

export default class TldrawUtils {
  doc: Y.Doc | undefined;
  awareness: YProvider["awareness"] | undefined;

  presenceId: any;
  userId: string | undefined;
  roomId: string | undefined;
  pageId: any;

  async init(
    doc: Y.Doc,
    awareness: YProvider["awareness"],
    clientId: number,
    serverName: string,
    partyId: string
  ) {
    const { InstancePresenceRecordType } = await import("@tldraw/tldraw");

    this.doc = doc;
    this.awareness = awareness;
    this.presenceId = InstancePresenceRecordType.createId(clientId.toString());
    this.userId = serverName;
    this.roomId = `tl_${partyId}`;

    return this;
  }

  async summon(currentPageId: string, presenceFields: {}) {
    this.pageId = currentPageId;
    await this.updatePresence(presenceFields);
  }

  async updatePresence(presenceFields: any) {
    const presence = await this.makePresenceRecord();
    const cursor = {
      ...presence.cursor,
      ...(presenceFields.cursor ?? {}),
    };
    const newPresence = {
      ...presence,
      ...presenceFields,
      cursor,
      lastActivityTimestamp: Date.now(),
    };
    //console.log("newPresence", JSON.stringify(newPresence, null, 2));
    this.awareness?.setLocalStateField("presence", newPresence);
  }

  async makePresenceRecord() {
    // Makes a templated presence record which can be overridden later
    const { InstancePresenceRecordType } = await import("@tldraw/tldraw");

    const record = {
      id: this.presenceId,
      currentPageId: this.pageId,
      userId: this.userId,
      userName: "🐬", // dolphin emoji
      cursor: {
        x: 0,
        y: 0,
        type: "default",
        rotation: 0,
      },
      chatMessage: "eeee e ee",
      color: "#4aa181", //"#d9f3d6" is the completion color for AI. The darker is the button color
    } as TLInstancePresence;

    return InstancePresenceRecordType.create(record);
  }
}
