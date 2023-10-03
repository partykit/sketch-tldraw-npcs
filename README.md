# sketch-tldraw-npcs

This is a _design exploration_ of NPCs ("non-player characters", or fake users) on tldraw, a multiplayer "infinite canvas"-style whiteboard app.

WARNING: this is a sketch and not intended for production use. The code is scrappy! But you may get something out of it, so here it is.

See also:

- [tldraw developer documentation](https://tldraw.dev)
- [sketch-tldraw](https://github.com/partykit/sketch-tldraw) -- a minimal implementation of tldraw using PartyKit as a Yjs backend.

Also, read the blog post about this exploration: TK

## Experimental!

This app was created during [Matt](https://interconnected.org)'s summer 2023 residency. The purpose is to experiment with multiplayer interactions, and simultaneously see what PartyKit can do. It's called a sketch because it's lightweight and quick, and because we learn something in making it.

## What you'll find here

tldraw is a client-side app that can use a Yjs backend as a sync server. PartyKit has first-party support to run as a Yjs server, in the form of [y-partykit](https://docs.partykit.io/reference/y-partykit-api/) _(docs)._

What we're additionally doing here is:

- we have PartyKit servers such as `npc-poet.ts` which joins the same Yjs room as the tldraw clients. It can monitor the canvas, add shapes and text to the canvas, and also take part in "presence": it can update a user object to drive a cursor around the screen.
- in the client, the user can interact with these NPCs and ask them to perform tasks.

![architecture](/assets/architecture-sm.png)

The design exploration looks at:

- sending commands to an NPC
- having a proactive NPC which monitors the user's document and offers to help
- smart NPCs that interpret commands using OpenAI function calling.
