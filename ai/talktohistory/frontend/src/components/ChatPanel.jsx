import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import VoiceControls from "./VoiceControls";
import { useI18n } from "../i18n/LanguageContext";
import { translateShareStatus } from "../i18n/localeHelpers";
import { APP_LANGS, CHAT_LANGUAGES } from "../data/chatLanguage";

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
  myUserId = "",
  onShare,
  shareOpen = false,
  onCloseShare,
  inviteLink = "",
  shareStatus = "",
  copied = false,
  humans = [],
  chatLanguage = "en",
  onLanguageChange,
}) {
  const { t, lang } = useI18n();
  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const menuRef = useRef(null);
  const [nickOpen, setNickOpen] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (last?.role === "user" && (!last.senderId || last.senderId === myUserId)) {
      stickToBottomRef.current = true;
    }
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping, myUserId]);

  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = gap < 80;
  };

  useEffect(() => {
    setNickDraft(userProfile.nickname || userProfile.name || "");
  }, [userProfile.nickname, userProfile.name]);

  const saveNick = () => {
    onSaveNickname?.(nickDraft.trim());
    setNickOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [menuOpen]);

  const pickMenu = (fn) => {
    setMenuOpen(false);
    fn?.();
  };

  const statusText = isListening
    ? t("chat.listening")
    : isSpeaking
    ? t("chat.speaking")
    : isTyping
    ? t("chat.typing")
    : t("chat.online");

  const statusColor = isListening
    ? "bg-red-400"
    : isSpeaking
    ? "bg-emerald-400"
    : isTyping
    ? "bg-amber-400"
    : "bg-emerald-400";

  const photo = character?.avatar || character?.image;

  return (
    <div className={`flex flex-col h-full min-h-0 w-full ${split ? "border-l border-primary/10" : "max-w-3xl mx-auto border-x border-primary/8"}`}
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 border-b border-primary/8 flex-shrink-0 z-10"
        style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", paddingTop: "max(0.75rem, env(safe-area-inset-top))", paddingBottom: "0.75rem" }}>

        {/* Back */}
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-primary hover:bg-primary/8 transition-all flex-shrink-0"
          title={t("chat.back")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 bg-gradient-to-br from-primary to-secondary">
            {photo ? (
              <img src={photo} alt={character.name} className="w-full h-full object-cover object-top" draggable={false} />
            ) : (
              <span className="flex h-full items-center justify-center text-sm">{character.emoji}</span>
            )}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor}`} />
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-dark text-sm leading-tight truncate">{character.name}</p>
          <p className="text-muted text-[11px] truncate">
            {statusText}
            {!isListening && !isSpeaking && !isTyping && displayName && t("chat.chattingWith", { name: displayName })}
          </p>
        </div>

        {/* Right actions — fixed set of icon buttons, never grows */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Stop speaking — icon only, same size as other buttons, no layout shift */}
          <button
            onClick={onStopSpeaking}
            title={t("chat.stopSpeaking")}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
              isSpeaking
                ? "bg-red-50 border border-red-200 text-red-500 hover:bg-red-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onShare}
            className={`w-8 h-8 flex items-center justify-center rounded-xl hover:bg-primary/8 transition-all ${
              copied ? "text-primary" : "text-muted hover:text-primary"
            }`}
            title={copied ? t("chat.linkCopied") : t("chat.inviteFriend")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <button
            onClick={onToggleFavorite}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-primary/8 text-base transition-all"
            title={isFavorite ? t("chat.unfavorite") : t("chat.favorite")}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          {APP_LANGS.length > 1 && (
            <div className="flex items-center rounded-xl border border-dark/10 overflow-hidden text-[10px] font-bold">
              {APP_LANGS.map((code) => (
            <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange?.(code)}
                  className={`px-2 py-1.5 transition-colors ${
                    chatLanguage === code
                      ? "bg-primary text-white"
                      : "bg-white text-muted hover:bg-primary/8 hover:text-primary"
                  }`}
                  title={CHAT_LANGUAGES[code]?.label || code}
                >
                  {code.toUpperCase()}
            </button>
              ))}
            </div>
          )}

          <Link
            to="/profile"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-xl hover:bg-primary/8 text-muted hover:text-primary transition-all"
            title={t("chat.yourProfile")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <button
            onClick={onClear}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-dark/5 text-muted hover:text-dark transition-all"
            title={t("chat.newChat")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {shareOpen && (
        <div className="px-3 py-2.5 border-b border-primary/10 bg-white/80 flex-shrink-0">
          <p className="text-xs font-semibold text-dark mb-1">{t("chat.inviteTitle")}</p>
          <p className="text-[11px] text-muted mb-2">
            {translateShareStatus(shareStatus, lang) || t("chat.inviteSub")}
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 min-w-0 text-[11px] px-2.5 py-1.5 rounded-lg border border-dark/10 bg-white text-dark"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={onShare}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white"
            >
              {copied ? t("chat.copied") : t("chat.copy")}
            </button>
            <button
              type="button"
              onClick={onCloseShare}
              className="text-xs px-2 py-1.5 rounded-lg text-muted hover:text-dark"
            >
              {t("chat.hide")}
            </button>
          </div>
          {humans.length > 0 && (
            <p className="text-[11px] text-muted mt-2">
              {t("chat.people")} {humans.map((h) => `${h.name || t("chat.guest")}${h.id === myUserId ? t("chat.you") : ""}`).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* ── Nickname bar ── */}
      {nickOpen && (
        <div className="px-4 py-2.5 border-b border-primary/8 bg-primary/4 flex flex-wrap items-center gap-2 flex-shrink-0 animate-slide-up">
          <span className="text-xs text-muted font-medium">{t("chat.yourNickname")}</span>
          <input
            type="text"
            value={nickDraft}
            onChange={(e) => setNickDraft(e.target.value.slice(0, 24))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveNick(); } }}
            placeholder={t("chat.nickPlaceholder")}
            className="flex-1 min-w-[8rem] text-sm px-3 py-1.5 rounded-xl border border-primary/20 bg-white text-dark outline-none focus:border-primary/50"
          />
          <button type="button" onClick={saveNick} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-white">{t("chat.save")}</button>
          {userProfile.nickname && (
            <button type="button" onClick={() => { onSaveNickname?.(""); setNickDraft(userProfile.name || ""); setNickOpen(false); }} className="text-xs text-muted hover:text-dark px-2">{t("chat.clear")}</button>
          )}
        </div>
      )}

      {/* Compact extras — games dropdown + nickname & ideas beside it */}
      <div
        ref={menuRef}
        className="relative px-3 py-2 border-b border-pink-100 flex-shrink-0"
        style={{ background: "rgba(255,240,247,0.7)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex-1 min-w-0 flex items-center justify-between gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
              menuOpen || todMode || snakesActive || diceActive
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white text-dark border-dark/10"
            }`}
          >
            <span className="truncate">{t("chat.wantGames")}</span>
            <span className={`text-[10px] flex-shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}>▼</span>
          </button>
        <button
          type="button"
            onClick={() => { setMenuOpen(false); setNickOpen((v) => !v); }}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
              nickOpen ? "bg-primary/10 text-primary border-primary/30" : "bg-white text-dark border-dark/10"
            }`}
          >
            {t("chat.nickname")}
          </button>
          <button
            type="button"
            onClick={() => { setMenuOpen(false); onOpenIdeas?.(); }}
            disabled={isTyping || messages.length < 1}
            className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-white disabled:opacity-40"
          >
            {t("chat.ideas")}
        </button>
        </div>

        {menuOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 z-30 rounded-2xl border border-dark/8 bg-white shadow-xl overflow-hidden animate-slide-up">
            <MenuRow icon="🎭" label={t("nav.truthOrDare")} active={todMode} onClick={() => pickMenu(onToggleTod)} />
            <MenuRow icon="🐍" label={t("nav.snakes")} active={snakesActive} disabled={isTyping} onClick={() => pickMenu(onOpenSnakes)} />
            <MenuRow icon="🎲" label={t("nav.dice")} active={diceActive} disabled={isTyping} onClick={() => pickMenu(onOpenDice)} />
          </div>
        )}

        {todMode && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={onTruth}
              disabled={isTyping}
              className="flex-1 min-w-[7rem] text-xs font-semibold px-3 py-2 rounded-xl border border-primary/20 bg-white text-primary disabled:opacity-40"
            >
              {t("chat.truth")}
            </button>
            <button
              type="button"
              onClick={onDare}
              disabled={isTyping}
              className="flex-1 min-w-[7rem] text-xs font-semibold px-3 py-2 rounded-xl border border-primary/20 bg-white text-primary disabled:opacity-40"
            >
              {t("chat.dare")}
            </button>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y px-4 py-5 space-y-4 scrollbar-thin"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
      >
        {resumed && (
          <div className="text-center py-2">
            <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold px-4 py-1.5 rounded-full">
              {displayName ? t("chat.welcomeBack", { name: displayName }) : t("chat.continuing")}
            </span>
            <p className="text-dark/40 text-[11px] mt-1">{t("chat.tapFresh")}</p>
          </div>
        )}
        {!resumed && messages.length <= 1 && (
          <div className="text-center py-2">
            <span className="inline-block bg-primary/8 text-primary text-xs font-semibold px-4 py-1.5 rounded-full">
              {displayName ? t("chat.sayHiNamed", { name: displayName }) : t("chat.sayHi")}
            </span>
            <p className="text-dark/40 text-[11px] mt-1">{t("chat.tryExtras")}</p>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "system" ? (
            <ChatMessage key={msg.id} message={{ ...msg, role: /^You\b/.test(msg.content || "") ? "user" : "assistant" }} character={character} myUserId={myUserId} />
          ) : (
            <ChatMessage key={msg.id} message={msg} character={character} myUserId={myUserId} />
          )
        )}

        {isTyping && <TypingIndicator character={character} />}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl p-3 animate-fade-in">
            <span className="text-red-400 text-base flex-shrink-0">⚠️</span>
            <p className="text-red-500 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0">
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
          lang={lang}
      />
      </div>
    </div>
  );
}

function MenuRow({ icon, label, onClick, active, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 text-left text-sm px-3.5 py-2.5 disabled:opacity-40 ${
        active ? "bg-primary/10 text-primary font-semibold" : "text-dark hover:bg-primary/5"
      }`}
    >
      <span className="w-6 text-center">{icon}</span>
      {label}
    </button>
  );
}
