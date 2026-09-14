/**
 * Bot vs real companion availability — same idea as pandit roster fillers.
 *
 * Real  → local AI companions (chat anytime when available)
 * Bot   → filler profiles; never available; rotate busy ↔ away
 * UI never labels anyone as "bot"
 */

export const STATUS_TICK_MS = 5 * 60 * 1000; // ~5 minutes

export const COMPANION_STATUS = {
  available: "available",
  busy: "busy",
  away: "away",
  offline: "offline",
};

function hashString(input = "") {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getStatusTick(now = Date.now()) {
  return Math.floor(now / STATUS_TICK_MS);
}

export function isBotCompanion(companion) {
  if (!companion) return false;
  return companion.kind === "bot" || companion.isBot === true;
}

export function getCompanionKind(companion) {
  return isBotCompanion(companion) ? "bot" : "real";
}

/** Bot → busy | away only. Real → available (unless overridden). */
export function resolveCompanionStatus(companion, now = Date.now()) {
  if (!companion) return COMPANION_STATUS.offline;
  if (isBotCompanion(companion)) {
    const tick = getStatusTick(now);
    const n = hashString(`${companion.id}:${tick}`);
    return n % 2 === 0 ? COMPANION_STATUS.busy : COMPANION_STATUS.away;
  }
  const forced = companion.status;
  if (
    forced === COMPANION_STATUS.busy ||
    forced === COMPANION_STATUS.away ||
    forced === COMPANION_STATUS.offline
  ) {
    return forced;
  }
  return COMPANION_STATUS.available;
}

/** Only real + available can open a chat */
export function canStartChat(companion, now = Date.now()) {
  return (
    getCompanionKind(companion) === "real" &&
    resolveCompanionStatus(companion, now) === COMPANION_STATUS.available
  );
}

export function canStartSession(companion, now = Date.now()) {
  return canStartChat(companion, now);
}

function seededShuffle(items, seed) {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * API/local reals + hardcoded bots → unique ids → shuffle every tick → attach live status.
 * Featured preference: first real+available when present.
 */
export function getShuffledRoster(realCompanions = [], botCompanions = [], now = Date.now()) {
  const tick = getStatusTick(now);
  const seen = new Set();
  const merged = [];

  for (const c of [...realCompanions, ...botCompanions]) {
    if (!c?.id || seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push({
      ...c,
      kind: getCompanionKind(c),
      isBot: isBotCompanion(c),
      status: resolveCompanionStatus(c, now),
    });
  }

  return groupAvailableThenMixRest(
    seededShuffle(merged, hashString(`roster:${tick}`)),
    now,
    hashString(`rest:${tick}`)
  );
}

/**
 * Available together at top (shuffled among themselves),
 * then busy + away mixed together.
 */
export function groupAvailableThenMixRest(roster = [], now = Date.now(), restSeed = 1) {
  const available = [];
  const rest = [];
  for (const c of roster) {
    const s = resolveCompanionStatus(c, now);
    if (s === COMPANION_STATUS.available) available.push(c);
    else rest.push(c);
  }
  return [...available, ...seededShuffle(rest, restSeed)];
}

/** available → busy → away → offline (keeps relative order within each group) */
export function sortRosterByStatus(roster = [], now = Date.now()) {
  const rank = {
    [COMPANION_STATUS.available]: 0,
    [COMPANION_STATUS.busy]: 1,
    [COMPANION_STATUS.away]: 2,
    [COMPANION_STATUS.offline]: 3,
  };
  return [...roster].sort((a, b) => {
    const sa = resolveCompanionStatus(a, now);
    const sb = resolveCompanionStatus(b, now);
    return (rank[sa] ?? 9) - (rank[sb] ?? 9);
  });
}

export function pickFeaturedCompanion(roster = [], now = Date.now()) {
  const availableReal = roster.find(
    (c) => getCompanionKind(c) === "real" && resolveCompanionStatus(c, now) === COMPANION_STATUS.available
  );
  return availableReal || roster[0] || null;
}

export function countByStatus(roster = [], now = Date.now()) {
  const counts = { available: 0, busy: 0, away: 0, offline: 0 };
  for (const c of roster) {
    const s = resolveCompanionStatus(c, now);
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
}

/** Button copy key + style for pick cards */
export function getCompanionAction(companion, { canContinue = false, now = Date.now() } = {}) {
  const status = resolveCompanionStatus(companion, now);
  if (status === COMPANION_STATUS.available && canStartChat(companion, now)) {
    return {
      status,
      enabled: true,
      labelKey: canContinue ? "common.continue" : "common.chatNow",
      tone: "available",
    };
  }
  if (status === COMPANION_STATUS.busy) {
    return {
      status,
      enabled: false,
      labelKey: "pick.statusBusy",
      tone: "busy",
    };
  }
  if (status === COMPANION_STATUS.away) {
    return {
      status,
      enabled: false,
      labelKey: "pick.statusAway",
      tone: "away",
    };
  }
  return {
    status: COMPANION_STATUS.offline,
    enabled: false,
    labelKey: "pick.statusOffline",
    tone: "offline",
  };
}
