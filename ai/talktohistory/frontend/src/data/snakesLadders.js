/** Classic 100-square Snakes & Ladders */

export const BOARD_SIZE = 100;

export const LADDERS = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

export const SNAKES = {
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78,
};

export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

/** Apply a dice roll from current position. Returns move details. */
export function applyMove(from, roll) {
  let to = from + roll;
  let bounced = false;

  if (from === 0 && roll !== 6) {
    return {
      from,
      roll,
      to: 0,
      final: 0,
      needSix: true,
      event: null,
    };
  }

  if (from === 0 && roll === 6) {
    to = 6;
  }

  if (to > BOARD_SIZE) {
    bounced = true;
    to = from;
  }

  let final = to;
  let event = null;

  if (LADDERS[to]) {
    final = LADDERS[to];
    event = "ladder";
  } else if (SNAKES[to]) {
    final = SNAKES[to];
    event = "snake";
  }

  return {
    from,
    roll,
    to,
    final,
    bounced,
    event,
    won: final === BOARD_SIZE,
  };
}

/** Visual row order for a 10×10 board (bottom-left start, boustrophedon). */
export function boardRows() {
  const rows = [];
  for (let r = 9; r >= 0; r--) {
    const cells = [];
    for (let c = 0; c < 10; c++) {
      const n = r % 2 === 0 ? r * 10 + c + 1 : r * 10 + (9 - c) + 1;
      cells.push(n);
    }
    rows.push(cells);
  }
  return rows;
}

export function describeMove(name, move, isYou) {
  const who = isYou ? "You" : name;
  if (move.needSix) {
    return `${who} rolled a ${move.roll} — need a 6 to start!`;
  }
  if (move.bounced) {
    return `${who} rolled a ${move.roll} but need an exact finish — still on ${move.from}.`;
  }
  let line = `${who} rolled a ${move.roll} → square ${move.to}`;
  if (move.event === "ladder") line += ` 🪜 ladder up to ${move.final}!`;
  if (move.event === "snake") line += ` 🐍 snake down to ${move.final}!`;
  if (move.won) line += ` 🎉 ${who} wins!`;
  return line;
}
