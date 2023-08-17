"use client";

import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <h1 className="text-6xl font-bold">Hello, Dolphin.</h1>
      <div className="fixed inset-0">
        <Tldraw />
      </div>
    </main>
  );
}
