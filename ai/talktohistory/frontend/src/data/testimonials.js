import { getActiveUserId } from "./accounts";
import { getDisplayName, getUserProfile } from "./userProfile";

const KEY = "desirechat_ratings_v1";

export const TESTIMONIAL_VIDEOS = [
  {
    id: "t1",
    src: encodeURI("/testivideos/IMG_6611.MOV"),
    name: "Riya",
    place: "Mumbai",
    quote: "Felt like a real late-night chat — I kept coming back.",
    seedStars: 5,
    seedCount: 18,
  },
  {
    id: "t2",
    src: encodeURI("/testivideos/IMG_6615.MOV"),
    name: "Aarav",
    place: "Delhi",
    quote: "The voice replies actually sound like them. Wild.",
    seedStars: 5,
    seedCount: 14,
  },
  {
    id: "t3",
    src: encodeURI("/testivideos/IMG_6618.MOV"),
    name: "Meera",
    place: "Bengaluru",
    quote: "I invited a friend and we both talked to the same companion.",
    seedStars: 4,
    seedCount: 11,
  },
  {
    id: "t4",
    src: encodeURI("/testivideos/IMG_6621.MOV"),
    name: "Kabir",
    place: "Pune",
    quote: "Games + voice made it way more fun than a normal chatbot.",
    seedStars: 5,
    seedCount: 16,
  },
];

function emptyStore() {
  return { reviews: [], byVideo: {} };
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

export function listReviews() {
  return readStore().reviews.slice().sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function getMyReview() {
  const uid = getActiveUserId() || "anon";
  return listReviews().find((r) => r.userId === uid) || null;
}

export function saveReview({ stars, text, name }) {
  const uid = getActiveUserId() || "anon";
  const profile = getUserProfile();
  const display = (name || getDisplayName(profile) || profile?.name || "Guest").trim().slice(0, 32);
  const store = readStore();
  const next = {
    id: uid,
    userId: uid,
    name: display,
    stars: Math.min(5, Math.max(1, Number(stars) || 5)),
    text: String(text || "").trim().slice(0, 180),
    at: new Date().toISOString(),
  };
  store.reviews = store.reviews.filter((r) => r.userId !== uid);
  store.reviews.unshift(next);
  writeStore(store);
  return next;
}

export function rateVideo(videoId, stars) {
  const uid = getActiveUserId() || "anon";
  const store = readStore();
  const list = Array.isArray(store.byVideo[videoId]) ? store.byVideo[videoId] : [];
  const filtered = list.filter((r) => r.userId !== uid);
  filtered.push({ userId: uid, stars: Math.min(5, Math.max(1, Number(stars) || 5)) });
  store.byVideo[videoId] = filtered;
  writeStore(store);
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
