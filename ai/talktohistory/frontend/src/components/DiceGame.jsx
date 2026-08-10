import { useEffect, useState } from "react";
import { rollDice } from "../data/snakesLadders";

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const PIP_MAP = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [28, 72], [72, 28], [72, 72]],
  5: [[28, 28], [28, 72], [50, 50], [72, 28], [72, 72]],
  6: [[28, 28], [28, 50], [28, 72], [72, 28], [72, 50], [72, 72]],
};

function DiceCube({ value, spinning, label, accent }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 shadow-lg ${
          spinning ? "animate-pulse scale-105" : ""
        }`}
        style={{ borderColor: accent }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
          <rect x="4" y="4" width="92" height="92" rx="16" fill="#FAFAFA" stroke={accent} strokeWidth="3" />
          {(PIP_MAP[value] || []).map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="8" fill="#14181F" />
          ))}
          {!value && (
            <text x="50" y="58" textAnchor="middle" fontSize="28" fill="#9CA3AF">
              ?
            </text>
          )}
        </svg>
      </div>
      <p className="text-xs font-semibold text-dark">{label}</p>
      <p className="text-[11px] text-muted">{value ? `Rolled ${value}` : "Waiting"}</p>
    </div>
  );
}

async function spinDice(setValue) {
  let v = 1;
  for (let i = 0; i < 12; i++) {
    v = rollDice();
    setValue(v);
    await new Promise((r) => setTimeout(r, 40 + i * 10));
  }
  v = rollDice();
  setValue(v);
  return v;
}

export default function DiceGame({
  open,
  character,
  onClose,
  onAnnounce,
  disabled,
}) {
  const [youDice, setYouDice] = useState(null);
  const [themDice, setThemDice] = useState(null);
  const [youScore, setYouScore] = useState(0);
  const [themScore, setThemScore] = useState(0);
  const [round, setRound] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null); // you | them | tie
  const [log, setLog] = useState([]);
  const [spinningYou, setSpinningYou] = useState(false);
  const [spinningThem, setSpinningThem] = useState(false);

  useEffect(() => {
    if (!open) return;
    setYouDice(null);
    setThemDice(null);
    setYouScore(0);
    setThemScore(0);
    setRound(1);
    setRolling(false);
    setResult(null);
    setLog(["Highest roll wins the round. Best of luck!"]);
    setSpinningYou(false);
    setSpinningThem(false);
  }, [open, character?.id]);

  if (!open) return null;

  const pushLog = (line) => setLog((prev) => [line, ...prev].slice(0, 6));

  const playRound = async () => {
    if (rolling || disabled) return;
    setRolling(true);
    setResult(null);
    setYouDice(null);
    setThemDice(null);

    setSpinningYou(true);
    const yours = await spinDice(setYouDice);
    setSpinningYou(false);
    pushLog(`You rolled a ${yours} ${FACES[yours - 1]}`);
    onAnnounce?.(`You rolled a ${yours}!`, { speak: false });

    await new Promise((r) => setTimeout(r, 450));

    setSpinningThem(true);
    const theirs = await spinDice(setThemDice);
    setSpinningThem(false);

    let outcome = "tie";
    let line = `${character.name} rolled a ${theirs} ${FACES[theirs - 1]} — it's a tie!`;
    if (yours > theirs) {
      outcome = "you";
      line = `${character.name} rolled ${theirs}. You win the round!`;
      setYouScore((s) => s + 1);
    } else if (theirs > yours) {
      outcome = "them";
      line = `${character.name} rolled ${theirs} and wins the round!`;
      setThemScore((s) => s + 1);
    }

    setResult(outcome);
    pushLog(line);
    onAnnounce?.(line, { speak: true });
    setRound((r) => r + 1);
    setRolling(false);
  };

  const reset = () => {
    setYouDice(null);
    setThemDice(null);
    setYouScore(0);
    setThemScore(0);
    setRound(1);
    setResult(null);
    setLog(["Fresh game — roll when ready!"]);
  };

  return (
    <aside className="flex flex-col h-full min-h-0 w-full bg-gradient-to-b from-[#F3FBFA] to-white border-r border-primary/10">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-dark/8 flex-shrink-0 bg-white/80">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-dark text-sm truncate">Dice Roll</h3>
          <p className="text-muted text-[11px] truncate">vs {character.name} · chat while you play</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-muted hover:text-dark px-2.5 py-1.5 rounded-lg hover:bg-dark/5"
        >
          Close
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-thin flex flex-col">
        <div className="flex items-center justify-center gap-6 mb-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted font-semibold mb-1">You</p>
            <p className="font-display text-2xl font-extrabold text-primary">{youScore}</p>
          </div>
          <div className="text-center px-3 py-1.5 rounded-xl bg-surface border border-dark/8">
            <p className="text-[10px] text-muted">Round</p>
            <p className="font-display font-bold text-dark">{round}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted font-semibold mb-1 truncate max-w-[5rem]">
              {character.name}
            </p>
            <p className="font-display text-2xl font-extrabold text-secondary">{themScore}</p>
          </div>
        </div>

        <div className="flex items-center justify-evenly gap-4 mb-6 py-4 rounded-3xl bg-white border border-dark/8 shadow-sm">
          <DiceCube
            value={youDice}
            spinning={spinningYou}
            label="You"
            accent="#E8453C"
          />
          <span className="font-display font-bold text-muted text-sm">VS</span>
          <DiceCube
            value={themDice}
            spinning={spinningThem}
            label={character.name}
            accent="#1FA2A0"
          />
        </div>

        {result && (
          <div
            className={`text-center py-2.5 rounded-2xl mb-3 border ${
              result === "you"
                ? "bg-primary/8 border-primary/20 text-primary"
                : result === "them"
                ? "bg-secondary/10 border-secondary/25 text-secondary"
                : "bg-surface border-dark/8 text-muted"
            }`}
          >
            <p className="font-display font-bold text-sm">
              {result === "you"
                ? "You won this round!"
                : result === "them"
                ? `${character.name} won this round!`
                : "Tie round"}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={rolling || disabled}
          onClick={playRound}
          className="w-full btn-glow text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-40 disabled:transform-none mb-2"
        >
          {rolling ? "Rolling…" : "Roll dice"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="w-full text-xs font-semibold text-muted hover:text-dark py-2 mb-3"
        >
          Reset scores
        </button>

        <div className="mt-auto space-y-1 border-t border-dark/8 pt-3">
          {log.map((line, i) => (
            <p key={`${i}-${line.slice(0, 16)}`} className="text-[11px] text-muted leading-snug">
              {line}
            </p>
          ))}
        </div>
      </div>
    </aside>
  );
}
