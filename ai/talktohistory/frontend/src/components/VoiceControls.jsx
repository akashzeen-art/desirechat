import { useEffect, useRef, useState } from "react";

const EMOJIS = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😜",
  "😉", "🙂", "🤗", "🤔", "😎", "🥰", "😭", "😅",
  "❤️", "💕", "💖", "💘", "🔥", "✨", "💋", "🌹",
  "👍", "👏", "🙌", "🤝", "🙈", "😏", "🤤", "🥺",
  "😳", "😈", "👻", "🦋", "🌙", "⭐", "🍫", "🍷",
];

async function fileToDataUrl(file, maxW = 960, quality = 0.72) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

export default function VoiceControls({
  input,
  setInput,
  onSend,
  onSendImage,
  onMicClick,
  onStopSpeaking,
  isListening,
  isTyping,
  isSpeaking,
  characterFirstName,
  inputRef,
}) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e) => {
      if (!panelRef.current?.contains(e.target)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emojiOpen]);

  const insertEmoji = (emoji) => {
    setInput((prev) => `${prev || ""}${emoji}`);
    setTimeout(() => inputRef?.current?.focus(), 0);
  };

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPendingImage(dataUrl);
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  };

  const sendNow = () => {
    if (pendingImage) {
      const caption = input.trim();
      onSendImage?.(pendingImage, caption);
      setPendingImage(null);
      setInput("");
      setEmojiOpen(false);
      return;
    }
    onSend();
    setEmojiOpen(false);
  };

  const canSend = Boolean(pendingImage) || Boolean(input.trim());

  return (
    <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-primary/10 flex-shrink-0 bg-white/50 relative" ref={panelRef}>
      {pendingImage && (
        <div className="mb-3 flex items-start gap-3 bg-white border border-primary/15 rounded-2xl p-2.5">
          <img src={pendingImage} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-1">Ready to send</p>
            <p className="text-sm text-dark truncate">Photo attached</p>
          </div>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-muted hover:text-primary px-2 py-1"
          >
            Remove
          </button>
        </div>
      )}

      {emojiOpen && (
        <div className="absolute bottom-[calc(100%-0.5rem)] left-3 right-3 z-20 bg-white border border-dark/8 rounded-2xl shadow-xl p-3 max-h-44 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-8 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => insertEmoji(e)}
                className="text-xl hover:bg-primary/10 rounded-lg py-1.5 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <button
          onClick={onMicClick}
          title={isListening ? "Stop" : "Speak"}
          className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
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

        <button
          type="button"
          onClick={() => setEmojiOpen((v) => !v)}
          title="Emoji"
          disabled={isTyping || isListening}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all ${
            emojiOpen
              ? "bg-primary/10 border-primary/40 text-primary"
              : "bg-white border-primary/15 text-muted hover:text-primary hover:border-primary/40"
          }`}
        >
          😊
        </button>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Send image"
          disabled={isTyping || isListening || uploading}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-primary/15 text-muted hover:text-primary hover:border-primary/40 disabled:opacity-40"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendNow();
            }
          }}
          placeholder={
            isListening
              ? "Listening..."
              : isSpeaking
              ? `${characterFirstName} is speaking...`
              : pendingImage
              ? "Add a caption (optional)..."
              : `Message ${characterFirstName}...`
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
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-red-100"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        )}

        <button
          onClick={sendNow}
          disabled={!canSend || isTyping}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary hover:bg-rose-600 disabled:bg-primary/20 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
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
          : "Emoji · photo · mic · Enter to send"}
      </p>
    </div>
  );
}
