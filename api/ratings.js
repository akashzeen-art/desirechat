const STORE_KEY = "desirechat_ratings_v1";

function emptyStore() {
  return { reviews: [], byVideo: {} };
}

function parseStore(raw) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (parsed && Array.isArray(parsed.reviews)) {
      return {
        reviews: parsed.reviews,
        byVideo: parsed.byVideo && typeof parsed.byVideo === "object" ? parsed.byVideo : {},
      };
    }
  } catch {
    /* ignore */
  }
  return emptyStore();
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

  const videos = new Set([
    ...Object.keys(a.byVideo || {}),
    ...Object.keys(b.byVideo || {}),
  ]);
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

async function redisCommand(command) {
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) return null;
  return res.json();
}

async function loadStore() {
  const data = await redisCommand(["GET", STORE_KEY]);
  if (data?.result) return parseStore(data.result);
  return emptyStore();
}

async function persistStore(store) {
  const data = await redisCommand(["SET", STORE_KEY, JSON.stringify(store)]);
  return Boolean(data?.result === "OK" || data?.result === store || data);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const hasRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (req.method === "GET") {
    if (!hasRedis) {
      res.statusCode = 200;
      res.end(JSON.stringify(emptyStore()));
      return;
    }
    try {
      const store = await loadStore();
      res.statusCode = 200;
      res.end(JSON.stringify(store));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message || "Failed to load ratings" }));
    }
    return;
  }

  if (req.method === "POST") {
    if (!hasRedis) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "Ratings sync not configured on server" }));
      return;
    }

    try {
      const payload = await readBody(req);
      const store = mergeStores(await loadStore(), parseStore(payload.clientStore || emptyStore()));

      if (payload.action === "saveReview" && payload.review?.userId) {
        const r = payload.review;
        store.reviews = store.reviews.filter((x) => x.userId !== r.userId);
        store.reviews.unshift({
          id: r.userId,
          userId: r.userId,
          name: String(r.name || "Guest").slice(0, 32),
          stars: Math.min(5, Math.max(1, Number(r.stars) || 5)),
          text: String(r.text || "").slice(0, 180),
          at: r.at || new Date().toISOString(),
        });
      }

      if (payload.action === "rateVideo" && payload.videoId && payload.userId) {
        const vid = String(payload.videoId);
        const list = Array.isArray(store.byVideo[vid]) ? store.byVideo[vid] : [];
        const stars = Math.min(5, Math.max(1, Number(payload.stars) || 5));
        store.byVideo[vid] = [
          ...list.filter((x) => x.userId !== payload.userId),
          { userId: payload.userId, stars },
        ];
      }

      if (payload.action === "merge" && payload.store) {
        Object.assign(store, mergeStores(store, parseStore(payload.store)));
      }

      await persistStore(store);
      res.statusCode = 200;
      res.end(JSON.stringify(store));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message || "Failed to save rating" }));
    }
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: "Method not allowed" }));
}
