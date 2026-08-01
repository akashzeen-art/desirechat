import { useRef, useEffect } from "react";
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
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full bg-white/70 backdrop-blur-xl border-x border-primary/10">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-primary/10 flex-shrink-0 gap-2">
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
              {character.emoji} {character.name}
            </h2>
            <p className="text-muted text-xs truncate">
              {isListening
                ? "Listening..."
                : isSpeaking
                ? "Speaking..."
                : isTyping
                ? "Typing..."
                : `${mood} mood${todMode ? " · T&D on" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
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
          >
            Clear
          </button>
        </div>
      </div>

      {/* Game + ideas toolbar */}
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
          🎲 Truth or Dare {todMode ? "ON" : ""}
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
          onClick={onOpenIdeas}
          disabled={isTyping || messages.length < 1}
          className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 disabled:opacity-40"
        >
          💡 Want suggestions?
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.length <= 1 && (
          <div className="pb-1 text-center">
            <p className="text-muted text-xs mb-1">Say hi and start flirting</p>
            <p className="text-dark/50 text-[11px]">Tap “Want suggestions?” anytime you need a line</p>
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
