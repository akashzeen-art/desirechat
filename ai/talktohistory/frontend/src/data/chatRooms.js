const ROOMS_KEY = "desirechat_rooms_v1";

export const ROOM_THEMES = [
  {
    id: "blush-hour",
    name: "Blush Hour",
    tagline: "Soft lights, softer words",
    accent: "#E91E8C",
    secondary: "#FF6BCB",
    bgClass: "room-theme-blush",
  },
  {
    id: "midnight-spark",
    name: "Midnight Spark",
    tagline: "Late-night chemistry",
    accent: "#7C3AED",
    secondary: "#E91E8C",
    bgClass: "room-theme-midnight",
  },
  {
    id: "velvet-tease",
    name: "Velvet Tease",
    tagline: "Bold looks, playful lines",
    accent: "#C4268C",
    secondary: "#7C3AED",
    bgClass: "room-theme-velvet",
  },
  {
    id: "champagne-flirt",
    name: "Champagne Flirt",
    tagline: "Bubbly banter energy",
    accent: "#FF6BCB",
    secondary: "#E91E8C",
    bgClass: "room-theme-champagne",
  },
  {
    id: "summer-heat",
    name: "Summer Heat",
    tagline: "Sun-warmed, easy chemistry",
    accent: "#FF4DB8",
    secondary: "#A855F7",
    bgClass: "room-theme-summer",
  },
  {
    id: "afterglow",
    name: "Afterglow",
    tagline: "Slow, sweet, lingering",
    accent: "#7C3AED",
    secondary: "#E91E8C",
    bgClass: "room-theme-afterglow",
  },
];

export function getRoomTheme(themeId) {
  return ROOM_THEMES.find((t) => t.id === themeId) || ROOM_THEMES[0];
}

function readRooms() {
  try {
    const raw = localStorage.getItem(ROOMS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeRooms(rooms) {
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    return true;
  } catch {
    try {
      const slim = rooms.map((r) => ({
        ...r,
        messages: (r.messages || []).slice(-80).map((m) => {
          if (m.image && String(m.image).startsWith("data:")) {
            const { image, ...rest } = m;
            return { ...rest, content: rest.content || "[photo]" };
          }
          return m;
        }),
      }));
      localStorage.setItem(ROOMS_KEY, JSON.stringify(slim));
      return true;
    } catch {
      return false;
    }
  }
}

function uid() {
  return `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listRooms() {
  return readRooms().sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
}

export function getRoom(roomId) {
  return readRooms().find((r) => r.id === roomId) || null;
}

export function createRoom({ name, themeId, memberIds }) {
  const members = [...new Set((memberIds || []).filter(Boolean))];
  if (members.length < 2) throw new Error("Add at least 2 companions to start a room.");
  if (members.length > 6) throw new Error("Max 6 companions in a room.");

  const room = {
    id: uid(),
    name: (name || "Flirty Lounge").trim().slice(0, 40) || "Flirty Lounge",
    themeId: themeId || ROOM_THEMES[0].id,
    memberIds: members,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const rooms = readRooms();
  rooms.unshift(room);
  writeRooms(rooms);
  return room;
}

export function updateRoom(roomId, patch) {
  const rooms = readRooms();
  const i = rooms.findIndex((r) => r.id === roomId);
  if (i < 0) return null;
  const next = {
    ...rooms[i],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (patch.memberIds) {
    next.memberIds = [...new Set(patch.memberIds.filter(Boolean))].slice(0, 6);
  }
  rooms[i] = next;
  writeRooms(rooms);
  return next;
}

export function saveRoomMessages(roomId, messages) {
  return updateRoom(roomId, { messages });
}

export function deleteRoom(roomId) {
  const rooms = readRooms().filter((r) => r.id !== roomId);
  writeRooms(rooms);
}

export function addRoomMember(roomId, characterId) {
  const room = getRoom(roomId);
  if (!room) return null;
  if (room.memberIds.includes(characterId)) return room;
  if (room.memberIds.length >= 6) throw new Error("Room is full (max 6).");
  return updateRoom(roomId, { memberIds: [...room.memberIds, characterId] });
}

export function removeRoomMember(roomId, characterId) {
  const room = getRoom(roomId);
  if (!room) return null;
  const next = room.memberIds.filter((id) => id !== characterId);
  if (next.length < 2) throw new Error("Keep at least 2 companions in the room.");
  return updateRoom(roomId, { memberIds: next });
}
