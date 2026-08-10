import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOARD_SIZE,
  LADDERS,
  SNAKES,
  applyMove,
  boardRows,
  describeMove,
  rollDice,
} from "../data/snakesLadders";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const ROWS = boardRows();

const TILE_COLORS = [
  "#FFE8EC", "#E8F7F6", "#FFF3E0", "#EDE7F6",
  "#E3F2FD", "#F1F8E9", "#FCE4EC", "#E0F2F1",
  "#FFF8E1", "#F3E5F5",
];

function cellPos(n) {
  for (let r = 0; r < ROWS.length; r++) {
    const c = ROWS[r].indexOf(n);
    if (c !== -1) return { r, c };
  }
  return { r: 0, c: 0 };
}

function centerOf(n) {
  const { r, c } = cellPos(n);
  return { x: c * 10 + 5, y: r * 10 + 5 };
}

function ladderPath(from, to) {
  const a = centerOf(from);
  const b = centerOf(to);
  const mx = (a.x + b.x) / 2 + (a.y < b.y ? 2.2 : -2.2);
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

function snakePath(from, to) {
  const a = centerOf(from);
  const b = centerOf(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const c1x = a.x + dx * 0.25 + (dy > 0 ? 6 : -6);
  const c1y = a.y + dy * 0.3;
  const c2x = a.x + dx * 0.75 + (dy > 0 ? -6 : 6);
  const c2y = a.y + dy * 0.7;
  return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
}

async function animateDice(setDice) {
  let face = 1;
  for (let i = 0; i < 10; i++) {
    face = rollDice();
    setDice(face);
    await new Promise((r) => setTimeout(r, 45 + i * 12));
  }
  const roll = rollDice();
  setDice(roll);
  return roll;
}

export default function SnakesLaddersGame({
  open,
  character,
  onClose,
  onAnnounce,
  disabled,
}) {
  const [youPos, setYouPos] = useState(0);
  const [themPos, setThemPos] = useState(0);
  const [turn, setTurn] = useState("you");
  const [dice, setDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const youRef = useRef(0);
  const themRef = useRef(0);
  const winnerRef = useRef(null);

  const overlays = useMemo(() => {
    const ladders = Object.entries(LADDERS).map(([from, to]) => ({
      from: Number(from),
      to: Number(to),
      d: ladderPath(Number(from), Number(to)),
    }));
    const snakes = Object.entries(SNAKES).map(([from, to]) => ({
      from: Number(from),
      to: Number(to),
      d: snakePath(Number(from), Number(to)),
    }));
    return { ladders, snakes };
  }, []);

  useEffect(() => {
    if (!open) return;
    youRef.current = 0;
    themRef.current = 0;
    winnerRef.current = null;
    setYouPos(0);
    setThemPos(0);
    setTurn("you");
    setDice(null);
    setRolling(false);
    setLog(["Roll a 6 to enter the board. First to 100 wins!"]);
    setWinner(null);
  }, [open, character?.id]);

  if (!open) return null;

  const pushLog = (line) => setLog((prev) => [line, ...prev].slice(0, 5));

  const playTurn = async (player) => {
    if (rolling || winnerRef.current || disabled) return;
    setRolling(true);
    setTurn(player);

    const roll = await animateDice(setDice);
    const from = player === "you" ? youRef.current : themRef.current;
    const move = applyMove(from, roll);
    await new Promise((r) => setTimeout(r, 220));

    const isYou = player === "you";
    const line = describeMove(character.name, move, isYou);
    pushLog(line);
    onAnnounce?.(line, { speak: !isYou });

    if (isYou) {
      youRef.current = move.final;
      setYouPos(move.final);
    } else {
      themRef.current = move.final;
      setThemPos(move.final);
    }

    if (move.won) {
      winnerRef.current = player;
      setWinner(player);
      setRolling(false);
      return;
    }

    const extra = move.roll === 6 && !move.needSix && !move.bounced;
    setRolling(false);

    if (extra) {
      if (player === "them") {
        await new Promise((r) => setTimeout(r, 650));
        await playTurn("them");
      } else setTurn("you");
      return;
    }

    if (player === "you") {
      setTurn("them");
      await new Promise((r) => setTimeout(r, 850));
      await playTurn("them");
    } else setTurn("you");
  };

  const reset = () => {
    youRef.current = 0;
    themRef.current = 0;
    winnerRef.current = null;
    setYouPos(0);
    setThemPos(0);
    setTurn("you");
    setDice(null);
    setWinner(null);
    setLog(["Rematch! Roll a 6 to start."]);
  };

  const tokenStyle = (n) => {
    if (!n) return null;
    const { r, c } = cellPos(n);
    return {
      left: `${c * 10 + 5}%`,
      top: `${r * 10 + 5}%`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <aside className="flex flex-col h-full min-h-0 w-full bg-gradient-to-b from-[#FFF8F5] to-white border-r border-primary/10">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-dark/8 flex-shrink-0 bg-white/80">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-dark text-sm truncate">Snakes & Ladders</h3>
          <p className="text-muted text-[11px] truncate">vs {character.name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-muted hover:text-dark px-2.5 py-1.5 rounded-lg hover:bg-dark/5"
        >
          Close
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 scrollbar-thin">
        {/* Board */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(20,24,31,0.12)] border-[3px] border-[#5D4037] bg-[#5D4037]">
          <div className="absolute inset-[3px] grid grid-cols-10 grid-rows-10 gap-[1px] bg-[#5D4037] rounded-xl overflow-hidden">
            {ROWS.flat().map((n) => {
              const { r, c } = cellPos(n);
              const bg = TILE_COLORS[(r + c) % TILE_COLORS.length];
              const isFinish = n === BOARD_SIZE;
              const isLadder = Boolean(LADDERS[n]);
              const isSnake = Boolean(SNAKES[n]);
              return (
                <div
                  key={n}
                  className="relative flex items-start justify-start p-[2px] sm:p-1"
                  style={{
                    background: isFinish ? "#FFD54F" : isLadder ? "#C8E6C9" : isSnake ? "#FFCDD2" : bg,
                  }}
                >
                  <span className="text-[7px] sm:text-[9px] font-bold text-dark/55 leading-none">
                    {n}
                  </span>
                  {isFinish && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-extrabold text-dark/70">
                      ★
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Snakes & ladders SVG */}
          <svg
            className="absolute inset-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)] pointer-events-none z-[5]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ladderGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A017" />
                <stop offset="100%" stopColor="#8B5A00" />
              </linearGradient>
              <linearGradient id="snakeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#43A047" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
            </defs>

            {overlays.ladders.map((l) => {
              const a = centerOf(l.from);
              const b = centerOf(l.to);
              const angle = Math.atan2(b.y - a.y, b.x - a.x);
              const nx = Math.cos(angle + Math.PI / 2) * 1.1;
              const ny = Math.sin(angle + Math.PI / 2) * 1.1;
              const steps = 5;
              const rungs = [];
              for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const x = a.x + (b.x - a.x) * t;
                const y = a.y + (b.y - a.y) * t;
                rungs.push(
                  <line
                    key={`${l.from}-rung-${i}`}
                    x1={x - nx}
                    y1={y - ny}
                    x2={x + nx}
                    y2={y + ny}
                    stroke="#F0C040"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                  />
                );
              }
              return (
                <g key={`ladder-${l.from}`}>
                  <line x1={a.x - nx} y1={a.y - ny} x2={b.x - nx} y2={b.y - ny} stroke="url(#ladderGrad)" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={a.x + nx} y1={a.y + ny} x2={b.x + nx} y2={b.y + ny} stroke="url(#ladderGrad)" strokeWidth="1.2" strokeLinecap="round" />
                  {rungs}
                </g>
              );
            })}

            {overlays.snakes.map((s) => (
              <g key={`snake-${s.from}`}>
                <path
                  d={s.d}
                  fill="none"
                  stroke="url(#snakeGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx={centerOf(s.from).x} cy={centerOf(s.from).y} r="1.4" fill="#C62828" />
                <circle cx={centerOf(s.to).x} cy={centerOf(s.to).y} r="1.1" fill="#2E7D32" />
              </g>
            ))}
          </svg>

          {/* Tokens */}
          {youPos > 0 && (
            <div
              className="absolute z-20 w-[7%] h-[7%] min-w-[14px] min-h-[14px] rounded-full bg-primary border-2 border-white shadow-lg transition-all duration-500"
              style={tokenStyle(youPos)}
              title="You"
            />
          )}
          {themPos > 0 && (
            <div
              className="absolute z-20 w-[7%] h-[7%] min-w-[14px] min-h-[14px] rounded-full bg-secondary border-2 border-white shadow-lg transition-all duration-500"
              style={{
                ...tokenStyle(themPos),
                marginLeft: youPos === themPos ? "4%" : 0,
              }}
              title={character.name}
            />
          )}
        </div>

        {/* Legend + start */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 mb-2 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> You</span>
          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> {character.name}</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-[#D4A017]" /> Ladder</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-0.5 bg-[#43A047] rounded" /> Snake</span>
        </div>

        {(youPos === 0 || themPos === 0) && (
          <div className="flex items-center gap-2 mb-2 bg-white border border-dark/8 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] font-semibold text-muted uppercase">Off board</span>
            {youPos === 0 && <span className="w-3 h-3 rounded-full bg-primary border border-white shadow" />}
            {themPos === 0 && <span className="w-3 h-3 rounded-full bg-secondary border border-white shadow" />}
            <span className="text-[10px] text-muted">need a 6</span>
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 text-[11px] space-y-0.5">
            <p>You · <strong>{youPos || "start"}</strong></p>
            <p className="truncate">{character.name} · <strong>{themPos || "start"}</strong></p>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl bg-white border-2 border-dark/10 shadow-inner flex flex-col items-center justify-center ${
              rolling ? "animate-pulse scale-105" : ""
            }`}
          >
            <span className="text-3xl leading-none">{dice ? DICE_FACES[dice - 1] : "🎲"}</span>
            <span className="text-[9px] text-muted mt-0.5">{dice || "-"}</span>
          </div>
        </div>

        {winner ? (
          <div className="text-center py-2.5 bg-[#FFF3E0] border border-[#FFD54F]/60 rounded-2xl mb-2">
            <p className="font-display font-bold text-dark text-sm">
              {winner === "you" ? "You win!" : `${character.name} wins!`}
            </p>
            <button type="button" onClick={reset} className="mt-1 text-xs font-semibold text-primary">
              Play again
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={rolling || turn !== "you" || disabled}
            onClick={() => playTurn("you")}
            className="w-full btn-glow text-white font-semibold py-2.5 rounded-2xl text-sm disabled:opacity-40 disabled:transform-none mb-2"
          >
            {rolling ? "Rolling…" : turn === "you" ? "Roll dice" : `${character.name} rolling…`}
          </button>
        )}

        <div className="space-y-1 border-t border-dark/8 pt-2">
          {log.map((line, i) => (
            <p key={`${i}-${line.slice(0, 18)}`} className="text-[10px] text-muted leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function QuickDiceButton({ onRoll, disabled }) {
  const [face, setFace] = useState(null);
  const [busy, setBusy] = useState(false);

  const roll = async () => {
    if (busy || disabled) return;
    setBusy(true);
    for (let i = 0; i < 6; i++) {
      setFace(rollDice());
      await new Promise((r) => setTimeout(r, 50));
    }
    const value = rollDice();
    setFace(value);
    setBusy(false);
    onRoll?.(value);
  };

  return (
    <button
      type="button"
      onClick={roll}
      disabled={disabled || busy}
      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-primary/15 text-dark hover:border-primary/40 disabled:opacity-50"
      title="Roll a dice"
    >
      {face ? `${DICE_FACES[face - 1]} ${face}` : "🎲 Dice"}
    </button>
  );
}
