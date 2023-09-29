/* A utility class to work with tldraw
 *
 * Instantiate with:
 * - clientId -- will get made into a presenceId in the constructor
 * - serverName -- will be used as the userId
 * - roomId -- this is the persistence key of the tldraw instance
 * - pageId -- this is the page of the canvas that we're on
 */

import {
  shapeIdValidator,
  type TLInstancePresence,
  type TLPageId,
} from "@tldraw/tldraw";
import * as Y from "yjs";
import YProvider from "y-partykit/provider";

export default class TldrawUtils {
  doc: Y.Doc | undefined;
  awareness: YProvider["awareness"] | undefined;

  clientId: number | undefined;
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
    this.clientId = clientId;
    this.presenceId = InstancePresenceRecordType.createId(clientId.toString());
    this.userId = serverName;
    this.roomId = `tl_${partyId}`;

    return this;
  }

  async summon(currentPageId: string, presenceFields: {}) {
    this.pageId = currentPageId as TLPageId;
    await this.updatePresence(presenceFields);
  }

  banish() {
    //this.awareness?.setLocalState(null);
    this.awareness?.setLocalStateField("presence", null);
    this.pageId = undefined;
  }

  async getPresence() {
    return (
      this.awareness?.getStates()?.get(this.clientId!)?.presence ??
      this.makePresenceRecord()
    );
  }

  async updatePresence(presenceFields: any) {
    const presence = await this.getPresence();
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
      currentPageId: this.pageId || "page:page",
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

  async createGeoShape(
    x: number,
    y: number,
    width: number,
    height: number,
    geo: "rectangle" | "triangle" | "circle"
  ) {
    console.log("createGeoShape", x, y, width, height, geo);
    const shapeId = await this.getShapeId();
    const shape = {
      id: shapeId,
      type: "geo",
      x,
      y,
      isLocked: false,
      rotation: 0,
      opacity: 1,
      meta: {},
      props: {
        color: "blue",
        geo: geo,
        size: "m",
        w: width,
        h: height,
        text: "",
        font: "draw",
        labelColor: "black",
        fill: "none",
        dash: "draw",
        align: "middle",
        verticalAlign: "middle",
        growY: 0,
        url: "",
      },
      parentId: this.pageId,
      index: this.getNewHighestIndex(),
      typeName: "shape",
    };
    const map = this.doc!.getMap(this.roomId);
    map.set(shapeId, shape);
    return shapeId;
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
    // Sort the array of strings
    indexes.sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

    // Get the number from the last string and increment it
    const lastNumber = parseInt(indexes[indexes.length - 1].slice(1));
    return `a${lastNumber + 1}`;
  }
}
