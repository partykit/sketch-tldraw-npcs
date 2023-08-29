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
  pageId: TLPageId | undefined;

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
    this.pageId = currentPageId as TLPageId;
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

  updateShape(shape: any, shapeFields?: any) {
    const map = this.doc!.getMap(this.roomId);
    const props = {
      ...shape.props,
      ...(shapeFields?.props ?? {}),
    };
    const newShape = {
      ...shape,
      ...(shapeFields ?? {}),
      props,
    };
    map.set(newShape.id, newShape);
  }

  async getShapeId(id?: string) {
    const { createShapeId } = await import("@tldraw/tldraw");
    return createShapeId(id ?? undefined);
  }

  async makeTextShape(x: number, y: number, text?: string, id?: string) {
    const shapeId = id ?? (await this.getShapeId());
    const textContent = text ?? "";
    const textShape = {
      id: shapeId,
      type: "text",
      x,
      y,
      isLocked: false,
      rotation: 0,
      opacity: 1,
      meta: {},
      props: {
        color: "black",
        size: "s",
        w: 100,
        // "w": etc
        text: textContent,
        font: "draw",
        align: "middle",
        autoSize: true,
        scale: 1,
      },
      parentId: this.pageId,
      index: this.getNewHighestIndex(),
      typeName: "shape",
    };
    return textShape;
  }

  getNewHighestIndex() {
    // Get all indexes of records with `parentId: pageId as TLPageId`
    // We can use map.entries, or map.values
    const map = this.doc!.getMap(this.roomId);
    const records = Array.from(map.values());
    const indexes = records
      .filter((record) => record.parentId === this.pageId)
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
}