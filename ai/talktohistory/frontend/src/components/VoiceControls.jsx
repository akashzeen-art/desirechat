export default function VoiceControls({
  input,
  setInput,
  onSend,
  onMicClick,
  onStopSpeaking,
  isListening,
  isTyping,
  isSpeaking,
  characterFirstName,
  inputRef,
}) {
  return (
    <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-primary/10 flex-shrink-0 bg-white/50">
      <div className="flex items-end gap-3">
        <button
          onClick={onMicClick}
          title={isListening ? "Stop" : "Speak"}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            isListening
              ? "bg-red-100 border border-red-300 text-red-500 scale-110"
              : "bg-white border border-primary/15 text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-2xl bg-red-200/60 animate-ping" />
          )}
          <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
          </svg>
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={
            isListening
              ? "Listening..."
              : isSpeaking
              ? `${characterFirstName} is speaking...`
              : `Flirt with ${characterFirstName}...`
          }
          rows={1}
          disabled={isTyping || isListening}
          className="flex-1 bg-white border border-primary/15 hover:border-primary/30 focus:border-primary/50 focus:outline-none text-dark placeholder-muted/60 rounded-2xl px-4 py-3 text-sm resize-none transition-all duration-200 max-h-28 overflow-y-auto"
          style={{ minHeight: "44px" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 112) + "px";
          }}
        />

        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            title="Stop speaking"
            className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-red-100"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        )}

        <button
          onClick={() => onSend()}
          disabled={!input.trim() || isTyping}
          className="w-11 h-11 rounded-2xl bg-primary hover:bg-rose-600 disabled:bg-primary/20 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
        >
          {isTyping ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-muted/70 text-xs mt-2 text-center">
        {isListening
          ? "Listening — speak now"
          : isSpeaking
          ? "Speaking — tap stop to interrupt"
          : "Enter to send · mic to speak"}
      </p>
    </div>
  );
}
