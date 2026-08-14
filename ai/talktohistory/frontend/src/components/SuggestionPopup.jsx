import { useEffect } from "react";
import { playPopSound } from "../utils/sounds";
import { useI18n } from "../i18n/LanguageContext";

export default function SuggestionPopup({
  open,
  suggestions,
  loading,
  onPick,
  onClose,
  onShuffle,
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (open && suggestions?.length) playPopSound();
  }, [open, suggestions]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-dark/30 backdrop-blur-[2px]"
        aria-label={t("suggestions.close")}
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl border border-primary/15 shadow-2xl shadow-primary/20 p-5 animate-slide-up">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-display font-bold text-dark text-lg">{t("suggestions.title")}</p>
            <p className="text-muted text-xs mt-0.5">{t("suggestions.sub")}</p>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-dark text-sm px-2 py-1">✕</button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted text-sm">
            <div className="mx-auto mb-3 w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            {t("suggestions.cooking")}
          </div>
        ) : (
          <div className="space-y-2">
            {(suggestions || []).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onPick(q)}
                className="w-full text-left px-4 py-3 rounded-2xl bg-surface hover:bg-primary/10 border border-primary/10 hover:border-primary/30 text-sm text-dark transition-all"
              >
                {q}
              </button>
            ))}
            {!suggestions?.length && (
              <p className="text-muted text-sm text-center py-4">{t("suggestions.none")}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onShuffle} disabled={loading} className="flex-1 btn-outline font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
            {t("suggestions.newIdeas")}
          </button>
          <button type="button" onClick={onClose} className="flex-1 btn-glow text-white font-semibold py-2.5 rounded-xl text-sm">
            {t("suggestions.later")}
          </button>
        </div>
      </div>
    </div>
  );
}
