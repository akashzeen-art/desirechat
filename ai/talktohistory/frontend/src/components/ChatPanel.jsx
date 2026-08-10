import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import VoiceControls from "./VoiceControls";

export default function ChatPanel({
  character,
  messages,
  isTyping,
  isSpeaking,
  isListening,
  error,
  input,
  setInput,
  onSend,
  onSendImage,
  onMicClick,
  onStopSpeaking,
  onClear,
  onBack,
  inputRef,
  isFavorite,
  onToggleFavorite,
  mood,
  todMode,
  onToggleTod,
  onTruth,
  onDare,
  onOpenIdeas,
  resumed,
  onOpenSnakes,
  onOpenDice,
  split = false,
  snakesActive = false,
  diceActive = false,
  userProfile = {},
  displayName = "",
  onSaveNickname,
}) {
  const messagesEndRef = useRef(null);
  const [nickOpen, setNickOpen] = useState(false);
  const [nickDraft, setNickDraft] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    setNickDraft(userProfile.nickname || userProfile.name || "");
  }, [userProfile.nickname, userProfile.name]);

  const saveNick = () => {
    onSaveNickname?.(nickDraft.trim());
    setNickOpen(false);
  };

  return (
    <div className={`flex flex-col h-full min-h-0 w-full bg-white/70 backdrop-blur-xl ${split ? "border-l border-primary/10" : "max-w-3xl mx-auto border-x border-primary/10"}`}>
      <div className="flex items-center justify-between px-4 sm:px-5 pt-3.5 pb-3 border-b border-primary/10 flex-shrink-0 gap-2 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted hover:text-primary text-sm transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isListening ? "bg-red-400 animate-pulse" : isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-primary"}`} />
          <div className="min-w-0">
            <h2 className="text-dark font-display font-bold text-sm truncate">
              {character.name}
            </h2>
            <p className="text-muted text-xs truncate">
              {isListening
                ? "Listening..."
                : isSpeaking
                ? "Speaking..."
                : isTyping
                ? "Typing..."
                : displayName
                ? `Chatting with ${displayName}`
                : `${character.regionLabel || ""} · ${mood}${todMode ? " · T&D" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            to="/profile"
            title="Your profile"
            className="text-muted hover:text-primary text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/15"
          >
            {displayName ? `✦ ${displayName}` : "Profile"}
          </Link>
          <button
            onClick={() => setNickOpen((v) => !v)}
            title="Quick nickname"
            className="text-muted hover:text-primary text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/15 hidden sm:inline-flex"
          >
            Nick
          </button>
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? "Unfavorite" : "Favorite"}
            className="w-8 h-8 rounded-lg hover:bg-primary/10 text-base"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="text-primary text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary/10 border border-primary/20"
            >
              Stop
            </button>
          )}
          <button
            onClick={onClear}
            className="text-muted hover:text-dark text-xs px-2.5 py-1.5 rounded-lg hover:bg-primary/5 border border-primary/10"
            title="Start a fresh chat"
          >
            New chat
          </button>
        </div>
      </div>

      {nickOpen && (
        <div className="px-3 sm:px-4 py-2.5 border-b border-primary/10 bg-primary/5 flex flex-wrap items-center gap-2 flex-shrink-0">
          <label className="text-xs text-muted font-medium">Your nickname</label>
          <input
            type="text"
            value={nickDraft}
            onChange={(e) => setNickDraft(e.target.value.slice(0, 24))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveNick();
              }
            }}
            placeholder="e.g. Parth"
            className="flex-1 min-w-[8rem] text-sm px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-dark outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={saveNick}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-white"
          >
            Save
          </button>
          {userProfile.nickname && (
            <button
              type="button"
              onClick={() => {
                onSaveNickname?.("");
                setNickDraft(userProfile.name || "");
                setNickOpen(false);
              }}
              className="text-xs text-muted hover:text-dark px-2"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="px-3 sm:px-4 py-2 border-b border-primary/10 flex flex-wrap gap-2 items-center flex-shrink-0 bg-white/40">
        <button
          type="button"
          onClick={onToggleTod}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            todMode
              ? "bg-primary text-white border-primary"
              : "bg-white text-muted border-primary/15 hover:border-primary/40 hover:text-primary"
          }`}
        >
          Truth or Dare {todMode ? "ON" : ""}
        </button>
        {todMode && (
          <>
            <button
              type="button"
              onClick={onTruth}
              disabled={isTyping}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-primary/15 text-dark hover:border-primary/40 disabled:opacity-50"
            >
              Truth
            </button>
            <button
              type="button"
              onClick={onDare}
              disabled={isTyping}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-primary/15 text-dark hover:border-primary/40 disabled:opacity-50"
            >
              Dare
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onOpenSnakes}
          disabled={isTyping}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
            snakesActive
              ? "bg-secondary text-white border-secondary"
              : "bg-white border-primary/15 text-dark hover:border-primary/40"
          }`}
        >
          🐍 Snakes
        </button>
        <button
          type="button"
          onClick={onOpenDice}
          disabled={isTyping}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${
            diceActive
              ? "bg-primary text-white border-primary"
              : "bg-white border-primary/15 text-dark hover:border-primary/40"
          }`}
        >
          🎲 Dice
        </button>
        <button
          type="button"
          onClick={onOpenIdeas}
          disabled={isTyping || messages.length < 1}
          className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-40"
        >
          💡 Ideas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {resumed && (
          <div className="pb-1 text-center">
            <p className="text-secondary text-xs font-semibold">
              {displayName ? `Welcome back, ${displayName}` : "Continuing your chat"}
            </p>
            <p className="text-dark/50 text-[11px]">Tap “New chat” anytime to start over</p>
          </div>
        )}
        {!resumed && messages.length <= 1 && (
          <div className="pb-1 text-center">
            <p className="text-muted text-xs mb-1">
              {displayName
                ? `Say hi — they’ll call you ${displayName}`
                : "Share your name & where you’re from"}
            </p>
            <p className="text-dark/50 text-[11px]">Or set a nickname up top · try dice, snakes, emoji or photo</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} character={character} />
        ))}

        {isTyping && <TypingIndicator character={character} />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-500 text-xs animate-fade-in">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <VoiceControls
        input={input}
        setInput={setInput}
        onSend={onSend}
        onSendImage={onSendImage}
        onMicClick={onMicClick}
        onStopSpeaking={onStopSpeaking}
        isListening={isListening}
        isTyping={isTyping}
        isSpeaking={isSpeaking}
        characterFirstName={character.name.split(" ")[0]}
        inputRef={inputRef}
      />
    </div>
  );
}
