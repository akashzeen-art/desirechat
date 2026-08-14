import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listRooms, deleteRoom, getRoomTheme } from "../data/chatRooms";
import { getCharacterById } from "../data/characters";
import { isProfileReady } from "../data/userProfile";
import BrandLogo from "../components/BrandLogo";
import { unlockAudioPlayback } from "../services/api";
import { useI18n } from "../i18n/LanguageContext";

export default function ChatRoomLobbyPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [rooms, setRooms] = useState(() => listRooms());

  useEffect(() => {
    if (!isProfileReady()) {
      navigate("/profile?setup=1&next=/rooms", { replace: true });
    }
  }, [navigate]);

  const refresh = () => setRooms(listRooms());

  const goCreate = () => {
    if (!isProfileReady()) {
      navigate("/profile?setup=1&next=/rooms/new");
      return;
    }
    navigate("/rooms/new");
  };

  const cards = useMemo(
    () =>
      rooms.map((room) => {
        const theme = getRoomTheme(room.themeId);
        const members = (room.memberIds || [])
          .map((id) => getCharacterById(id))
          .filter(Boolean);
        return { room, theme, members };
      }),
    [rooms]
  );

  const handleDelete = (e, roomId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(t("rooms.deleteConfirm"))) return;
    deleteRoom(roomId);
    refresh();
  };

  return (
    <div className="min-h-screen hero-bg pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <BrandLogo className="text-2xl sm:text-3xl" />
          </div>
          <p className="text-secondary text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            {t("rooms.tag")}
          </p>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">
            {t("rooms.title")}
          </h1>
          <p className="text-muted max-w-md mx-auto text-sm sm:text-base">
            {t("rooms.sub")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            type="button"
            onClick={goCreate}
            className="btn-glow text-white font-semibold px-8 py-3.5 rounded-2xl text-sm"
          >
            {t("rooms.create")}
          </button>
          <Link
            to="/"
            className="btn-outline font-semibold px-8 py-3.5 rounded-2xl text-sm text-center"
          >
            {t("rooms.backHome")}
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="text-center rounded-3xl border border-dashed border-primary/25 bg-white/60 px-6 py-14">
            <p className="font-display text-lg font-bold text-dark mb-2">{t("rooms.empty")}</p>
            <p className="text-muted text-sm mb-6">
              {t("rooms.emptySubLong")}
            </p>
            <button
              type="button"
              onClick={goCreate}
              className="btn-glow text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
            >
              {t("rooms.openFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map(({ room, theme, members }) => (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  unlockAudioPlayback();
                  navigate(`/rooms/${room.id}`);
                }}
                className={`text-left rounded-3xl p-5 border border-dark/8 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${theme.bgClass}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                      {theme.name}
                    </p>
                    <h2 className="font-display text-xl font-bold text-dark">{room.name}</h2>
                    <p className="text-muted text-xs mt-0.5">{theme.tagline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, room.id)}
                    className="text-muted hover:text-primary text-xs px-2 py-1 rounded-lg hover:bg-white/70"
                    title={t("rooms.deleteTitle")}
                  >
                    {t("rooms.delete")}
                  </button>
                </div>

                <div className="flex -space-x-2 mb-3">
                  {members.slice(0, 6).map((m) => (
                    <div
                      key={m.id}
                      className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-surface"
                      title={m.name}
                    >
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-full h-full object-cover object-top" draggable={false} />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs">{m.emoji}</span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-dark/70 text-xs">
                  {members.map((m) => m.name).join(" · ") || t("rooms.noMembers")}
                  {room.messages?.length ? ` · ${room.messages.length} ${t("rooms.messages")}` : ` · ${t("rooms.newRoom")}`}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
