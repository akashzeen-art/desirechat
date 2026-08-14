import { getActiveUserId } from "./accounts";
import { getDisplayName, getUserProfile } from "./userProfile";

const KEY = "desirechat_ratings_v1";

export const TESTIMONIAL_VIDEOS = [
  {
    id: "t1",
    src: "/testivideos/IMG_6611.mp4",
    poster: "/testivideos/IMG_6611-poster.jpg",
    name: "Riya",
    place: "Mumbai",
    quote: "Felt like a real late-night chat — I kept coming back.",
    seedStars: 5,
    seedCount: 18,
  },
  {
    id: "t2",
    src: "/testivideos/IMG_6615.mp4",
    poster: "/testivideos/IMG_6615-poster.jpg",
    name: "Liam",
    place: "Cape Town",
    quote: "The voice replies actually sound like them. Wild.",
    seedStars: 5,
    seedCount: 14,
  },
  {
    id: "t3",
    src: "/testivideos/IMG_6618.mp4",
    poster: "/testivideos/IMG_6618-poster.jpg",
    name: "Wei Chen",
    place: "Shanghai",
    quote: "I invited a friend and we both talked to the same companion.",
    seedStars: 4,
    seedCount: 11,
  },
  {
    id: "t4",
    src: "/testivideos/IMG_6621.mp4",
    poster: "/testivideos/IMG_6621-poster.jpg",
    name: "Amara",
    place: "Lagos",
    quote: "Games + voice made it way more fun than a normal chatbot.",
    seedStars: 5,
    seedCount: 16,
  },
];

function emptyStore() {
  return { reviews: [], byVideo: {} };
}

function mergeStores(a, b) {
  const out = emptyStore();
  const reviewMap = new Map();
  [...(a.reviews || []), ...(b.reviews || [])].forEach((r) => {
    if (!r?.userId) return;
    const prev = reviewMap.get(r.userId);
    if (!prev || new Date(r.at || 0) > new Date(prev.at || 0)) reviewMap.set(r.userId, r);
  });
  out.reviews = [...reviewMap.values()].sort((x, y) => new Date(y.at || 0) - new Date(x.at || 0));

  const videos = new Set([...Object.keys(a.byVideo || {}), ...Object.keys(b.byVideo || {})]);
  videos.forEach((vid) => {
    const map = new Map();
    [...(a.byVideo?.[vid] || []), ...(b.byVideo?.[vid] || [])].forEach((r) => {
      if (!r?.userId) return;
      map.set(r.userId, r);
    });
    if (map.size) out.byVideo[vid] = [...map.values()];
  });
  return out;
}

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.reviews)) return parsed;
  } catch {
    /* ignore */
  }
  return emptyStore();
}

function writeStore(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

async function postToServer(payload) {
  const res = await fetch("/api/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, clientStore: readStore() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Ratings sync failed (${res.status})`);
  }
  return res.json();
}

/** Load shared ratings from server and merge into local storage. */
export async function syncRatingsFromServer() {
  try {
    const res = await fetch("/api/ratings", { method: "GET" });
    if (!res.ok) return readStore();
    const remote = await res.json();
    const merged = mergeStores(readStore(), remote);
    writeStore(merged);
    return merged;
  } catch {
    return readStore();
  }
}

export function listReviews() {
  return readStore().reviews.slice().sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function getMyReview() {
  const uid = getActiveUserId() || "anon";
  return listReviews().find((r) => r.userId === uid) || null;
}

export async function saveReview({ stars, text, name }) {
  const uid = getActiveUserId() || "anon";
  const profile = getUserProfile();
  const display = (name || getDisplayName(profile) || profile?.name || "Guest").trim().slice(0, 32);
  const next = {
    id: uid,
    userId: uid,
    name: display,
    stars: Math.min(5, Math.max(1, Number(stars) || 5)),
    text: String(text || "").trim().slice(0, 180),
    at: new Date().toISOString(),
  };

  const store = readStore();
  store.reviews = store.reviews.filter((r) => r.userId !== uid);
  store.reviews.unshift(next);
  writeStore(store);

  try {
    const remote = await postToServer({ action: "saveReview", review: next });
    writeStore(mergeStores(store, remote));
  } catch {
    /* keep local copy */
  }
  return next;
}

export async function rateVideo(videoId, stars) {
  const uid = getActiveUserId() || "anon";
  const store = readStore();
  const list = Array.isArray(store.byVideo[videoId]) ? store.byVideo[videoId] : [];
  store.byVideo[videoId] = [
    ...list.filter((r) => r.userId !== uid),
    { userId: uid, stars: Math.min(5, Math.max(1, Number(stars) || 5)) },
  ];
  writeStore(store);

  try {
    const remote = await postToServer({
      action: "rateVideo",
      videoId,
      userId: uid,
      stars,
    });
    writeStore(mergeStores(store, remote));
  } catch {
    /* keep local copy */
  }
}

export function getVideoRating(videoId) {
  const clip = TESTIMONIAL_VIDEOS.find((t) => t.id === videoId);
  const seedStars = clip?.seedStars || 5;
  const seedCount = clip?.seedCount || 8;
  const extra = readStore().byVideo[videoId] || [];
  const extraSum = extra.reduce((s, r) => s + (r.stars || 0), 0);
  const count = seedCount + extra.length;
  const avg = count ? (seedStars * seedCount + extraSum) / count : seedStars;
  const uid = getActiveUserId() || "anon";
  const mine = extra.find((r) => r.userId === uid);
  return { avg, count, mine: mine?.stars || 0 };
}

export function getOverallRating() {
  const reviews = listReviews();
  const videoAvgs = TESTIMONIAL_VIDEOS.map((t) => getVideoRating(t.id).avg);
  const reviewAvg = reviews.length
    ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length
    : 0;
  const seed = videoAvgs.reduce((s, n) => s + n, 0) / Math.max(1, videoAvgs.length);
  const avg = reviews.length ? (seed * 4 + reviewAvg * reviews.length) / (4 + reviews.length) : seed;
  const count = TESTIMONIAL_VIDEOS.reduce((s, t) => s + getVideoRating(t.id).count, 0) + reviews.length;
  return { avg, count };
}
