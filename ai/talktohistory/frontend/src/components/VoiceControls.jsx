import { useEffect, useRef, useState } from "react";
import { translate } from "../i18n/translations";

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😍","😘","😜",
  "😉","🙂","🤗","🤔","😎","🥰","😭","😅",
  "❤️","💕","💖","💘","🔥","✨","💋","🌹",
  "👍","👏","🙌","🤝","🙈","😏","🤤","🥺",
  "😳","😈","👻","🦋","🌙","⭐","🍫","🍷",
];

async function fileToDataUrl(file, maxW = 960, quality = 0.72) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

export default function VoiceControls({
  input, setInput, onSend, onSendImage, onMicClick, onStopSpeaking,
  isListening, isTyping, isSpeaking, characterFirstName, inputRef, lang = "en",
}) {
  const t = (key, vars) => translate(lang, key, vars);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e) => { if (!panelRef.current?.contains(e.target)) setEmojiOpen(false); };
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
    try { setPendingImage(await fileToDataUrl(file)); }
    catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const sendNow = () => {
    if (pendingImage) {
      onSendImage?.(pendingImage, input.trim());
      setPendingImage(null);
      setInput("");
      setEmojiOpen(false);
      return;
    }
    onSend();
    setEmojiOpen(false);
  };

  const canSend = Boolean(pendingImage) || Boolean(input.trim());

  const placeholder = isListening
    ? t("voice.listening")
    : pendingImage
    ? t("voice.captionOptional")
    : t("voice.message", { name: characterFirstName });

  return (
    <div
      className="flex-shrink-0 border-t border-primary/8 relative"
      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      ref={panelRef}
    >
      {/* Image preview */}
      {pendingImage && (
        <div className="mx-4 mt-3 flex items-center gap-3 bg-white border border-primary/15 rounded-2xl p-2.5 shadow-sm">
          <img src={pendingImage} alt={t("voice.preview")} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-dark">{t("voice.photoReady")}</p>
            <p className="text-[11px] text-muted mt-0.5">{t("voice.photoHint")}</p>
          </div>
          <button type="button" onClick={() => setPendingImage(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-dark/5 hover:bg-dark/10 text-muted hover:text-dark transition-colors text-xs">✕</button>
        </div>
      )}

      {/* Emoji picker */}
      {emojiOpen && (
        <div className="absolute bottom-full left-3 right-3 mb-1 z-20 bg-white border border-dark/8 rounded-2xl shadow-2xl p-3 max-h-44 overflow-y-auto scrollbar-thin animate-slide-up">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => insertEmoji(e)} className="text-xl hover:bg-primary/8 rounded-xl py-1.5 transition-colors">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 pt-3">

        {/* Mic */}
        <button
          onClick={onMicClick}
          title={isListening ? t("voice.stop") : t("voice.speak")}
          className={`relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            isListening
              ? "bg-red-100 border border-red-300 text-red-500"
              : "bg-white border border-dark/10 text-muted hover:text-primary hover:border-primary/30"
          }`}
        >
          {isListening && <span className="absolute inset-0 rounded-2xl bg-red-200/50 animate-ping" />}
          <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
          </svg>
        </button>

        {/* Emoji */}
        <button
          type="button"
          onClick={() => setEmojiOpen((v) => !v)}
          disabled={isListening}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all disabled:opacity-40 ${
            emojiOpen ? "bg-primary/10 border-primary/30 text-primary" : "bg-white border-dark/10 text-muted hover:text-primary hover:border-primary/30"
          }`}
          title={t("voice.emoji")}
        >
          <span className="text-base">😊</span>
        </button>

        {/* Image */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isListening || uploading}
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white border border-dark/10 text-muted hover:text-primary hover:border-primary/30 disabled:opacity-40 transition-all"
          title={t("voice.sendImage")}
        >
          {uploading
            ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          }
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendNow(); } }}
          onFocus={() => {
            requestAnimationFrame(() => {
              window.scrollTo(0, 0);
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
            });
          }}
          placeholder={placeholder}
          rows={1}
          disabled={isListening}
          enterKeyHint="send"
          className="flex-1 bg-white border border-dark/10 hover:border-primary/25 focus:border-primary/50 focus:ring-2 focus:ring-primary/8 outline-none text-dark placeholder-muted/50 rounded-2xl px-4 py-2.5 text-sm resize-none transition-all max-h-28 overflow-y-auto"
          style={{ minHeight: "40px" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 112) + "px";
          }}
        />

        {/* Send */}
        <button
          type="button"
          onClick={sendNow}
          disabled={!canSend || isListening}
          className="size-10 aspect-square rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={canSend && !isListening ? { background: "linear-gradient(135deg,#E91E8C,#7C3AED)", boxShadow: "0 4px 14px rgba(233,30,140,0.35)" } : { background: "rgba(26,16,37,0.08)" }}
          title={t("voice.send")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="block text-white"
            fill="currentColor"
            aria-hidden
          >
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {/* Hint — fixed single line, never changes height */}
      <p className="text-center text-[10px] text-muted/40 mt-1.5 pb-0.5 leading-none">
        {t("voice.enterSend")}
      </p>
    </div>
  );
}
