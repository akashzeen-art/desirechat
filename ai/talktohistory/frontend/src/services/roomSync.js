import Peer from "peerjs";
import { getActiveUserId } from "../data/accounts";
import { getDisplayName, getUserProfile } from "../data/userProfile";

/** PeerJS-safe id from room id */
export function hostPeerIdForRoom(roomId) {
  const clean = String(roomId || "").replace(/[^a-zA-Z0-9]/g, "");
  return `desirechat${clean}`.slice(0, 60);
}

export function inviteUrlForRoom(roomId) {
  if (typeof window === "undefined") return `/join/${roomId}`;
  return `${window.location.origin}/join/${encodeURIComponent(roomId)}`;
}

/** Stable invite id for a 1:1 character chat (host + companion). */
export function chatShareId(characterId, userId) {
  const c = String(characterId || "").replace(/[^a-z0-9]/gi, "").slice(0, 24);
  const u = String(userId || "anon").replace(/[^a-z0-9]/gi, "").slice(0, 20);
  return `c${c}${u}`.slice(0, 48);
}

export function getMyHuman() {
  const profile = getUserProfile();
  return {
    id: getActiveUserId() || "anon",
    name: getDisplayName(profile) || profile?.name || "Guest",
    avatar: profile?.avatar || "",
  };
}

function slimMessages(messages = []) {
  return (messages || []).slice(-80).map((m) => {
    if (m.image && String(m.image).startsWith("data:")) {
      const { image, ...rest } = m;
      return { ...rest, content: rest.content || "[photo]" };
    }
    return m;
  });
}

function mergeById(local = [], remote = []) {
  const map = new Map();
  [...local, ...remote].forEach((m) => {
    if (!m?.id) return;
    if (!map.has(m.id)) map.set(m.id, m);
  });
  return [...map.values()].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );
}

function mergeHumans(local = [], remote = []) {
  const map = new Map();
  [...local, ...remote].forEach((h) => {
    if (!h?.id) return;
    map.set(h.id, { ...map.get(h.id), ...h });
  });
  return [...map.values()];
}

/**
 * Live room sync over PeerJS (works across devices; host must keep the room open).
 */
export function createRoomSync({
  roomId,
  role, // "host" | "guest"
  getSnapshot,
  onSnapshot,
  onStatus,
}) {
  let peer = null;
  let destroyed = false;
  const conns = new Set();
  let status = "starting";

  const setStatus = (next, detail = "") => {
    status = next;
    onStatus?.(next, detail);
  };

  const broadcast = (payload, except = null) => {
    const raw = JSON.stringify(payload);
    conns.forEach((conn) => {
      if (conn === except) return;
      if (conn.open) {
        try {
          conn.send(raw);
        } catch {
          /* ignore */
        }
      }
    });
  };

  const handlePayload = (data, fromConn) => {
    let msg = data;
    try {
      if (typeof data === "string") msg = JSON.parse(data);
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "hello" && role === "host") {
      const snap = getSnapshot?.() || {};
      const humans = mergeHumans(snap.humans || [], msg.human ? [msg.human] : []);
      onSnapshot?.({
        room: snap.room,
        messages: snap.messages || [],
        humans,
      });
      try {
        fromConn.send(
          JSON.stringify({
            type: "snapshot",
            room: snap.room,
            messages: slimMessages(snap.messages),
            humans,
          })
        );
      } catch {
        /* ignore */
      }
      broadcast(
        {
          type: "humans",
          humans,
        },
        fromConn
      );
      return;
    }

    if (msg.type === "snapshot") {
      onSnapshot?.({
        room: msg.room,
        messages: msg.messages || [],
        humans: msg.humans || [],
      });
      setStatus("connected", "Synced with host");
      return;
    }

    if (msg.type === "message" && msg.message) {
      const snap = getSnapshot?.() || {};
      const messages = mergeById(snap.messages || [], [msg.message]);
      onSnapshot?.({
        room: snap.room,
        messages,
        humans: snap.humans || [],
      });
      if (role === "host") broadcast({ type: "message", message: msg.message }, fromConn);
      return;
    }

    if (msg.type === "messages" && Array.isArray(msg.messages)) {
      const snap = getSnapshot?.() || {};
      const messages = mergeById(snap.messages || [], msg.messages);
      onSnapshot?.({
        room: snap.room,
        messages,
        humans: msg.humans || snap.humans || [],
      });
      if (role === "host") {
        broadcast(
          { type: "messages", messages: slimMessages(messages), humans: msg.humans || snap.humans },
          fromConn
        );
      }
      return;
    }

    if (msg.type === "humans" && Array.isArray(msg.humans)) {
      const snap = getSnapshot?.() || {};
      const humans = mergeHumans(snap.humans || [], msg.humans);
      onSnapshot?.({
        room: snap.room,
        messages: snap.messages || [],
        humans,
      });
      if (role === "host") broadcast({ type: "humans", humans }, fromConn);
    }
  };

  const wireConn = (conn) => {
    conns.add(conn);
    conn.on("data", (data) => handlePayload(data, conn));
    conn.on("close", () => {
      conns.delete(conn);
      if (role === "guest") setStatus("disconnected", "Host left — ask them to reopen the room");
      else if (conns.size === 0) setStatus("waiting", "Invite sent — waiting for friends");
    });
    conn.on("open", () => {
      setStatus("connected", role === "host" ? "Friend connected" : "Joined host");
      if (role === "guest") {
        conn.send(
          JSON.stringify({
            type: "hello",
            human: getMyHuman(),
          })
        );
      } else {
        const snap = getSnapshot?.() || {};
        conn.send(
          JSON.stringify({
            type: "snapshot",
            room: snap.room,
            messages: slimMessages(snap.messages),
            humans: snap.humans || [],
          })
        );
      }
    });
  };

  const start = () => {
    if (destroyed) return;
    const hostId = hostPeerIdForRoom(roomId);
    setStatus(role === "host" ? "waiting" : "connecting", role === "host" ? "Ready to share" : "Connecting…");

    peer = new Peer(role === "host" ? hostId : undefined, {
      debug: 0,
    });

    peer.on("open", () => {
      if (destroyed) return;
      if (role === "host") {
        setStatus("waiting", "Share the link — keep this page open");
      } else {
        const conn = peer.connect(hostId, { reliable: true });
        wireConn(conn);
      }
    });

    peer.on("connection", (conn) => {
      if (destroyed) return;
      wireConn(conn);
    });

    peer.on("error", (err) => {
      const text = err?.type || err?.message || "Connection error";
      if (role === "host" && /taken|unavailable/i.test(String(text))) {
        setStatus("error", "This room is already open in another tab. Close the other tab and try again.");
        return;
      }
      if (role === "guest" && /peer-unavailable|could not connect/i.test(String(text))) {
        setStatus("waiting", "Host is offline — ask them to open the room & keep it open");
        return;
      }
      setStatus("error", String(text));
    });

    peer.on("disconnected", () => {
      if (destroyed) return;
      try {
        peer.reconnect();
      } catch {
        setStatus("disconnected", "Reconnecting…");
      }
    });
  };

  start();

  return {
    getStatus: () => status,
    publishMessage(message) {
      broadcast({ type: "message", message });
    },
    publishMessages(messages, humans) {
      broadcast({
        type: "messages",
        messages: slimMessages(messages),
        humans: humans || [],
      });
    },
    publishHumans(humans) {
      broadcast({ type: "humans", humans: humans || [] });
    },
    destroy() {
      destroyed = true;
      conns.forEach((c) => {
        try {
          c.close();
        } catch {
          /* ignore */
        }
      });
      conns.clear();
      try {
        peer?.destroy();
      } catch {
        /* ignore */
      }
      peer = null;
    },
  };
}

export { mergeById, mergeHumans, slimMessages };
