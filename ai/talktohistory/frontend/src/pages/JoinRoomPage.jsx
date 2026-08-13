import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { getRoom, upsertSharedRoom } from "../data/chatRooms";
import { findChatByShareId, saveChat, saveChatShare } from "../data/chatHistory";
import { getActiveUserId } from "../data/accounts";
import { isProfileReady, getDisplayName, getUserProfile } from "../data/userProfile";
import { getCharacterById } from "../data/characters";
import { createRoomSync, getMyHuman } from "../services/roomSync";

export default function JoinRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Preparing invite…");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/rooms", { replace: true });
      return undefined;
    }

    if (!isProfileReady()) {
      navigate(`/profile?setup=1&next=/join/${encodeURIComponent(roomId)}`, { replace: true });
      return undefined;
    }

    const me = getActiveUserId();

    const existingRoom = getRoom(roomId);
    if (existingRoom && existingRoom.hostId && existingRoom.hostId === me) {
      navigate(`/rooms/${roomId}`, { replace: true });
      return undefined;
    }

    const existingChat = findChatByShareId(roomId);
    if (existingChat?.hostId && existingChat.hostId === me && existingChat.characterId) {
      navigate(`/chat/${existingChat.characterId}`, { replace: true });
      return undefined;
    }

    let sync;
    let opened = false;

    sync = createRoomSync({
      roomId,
      role: "guest",
      getSnapshot: () => ({
        room: getRoom(roomId),
        messages: getRoom(roomId)?.messages || [],
        humans: getRoom(roomId)?.humans || [],
      }),
      onStatus: (s, detail) => {
        if (s === "error") setError(detail || "Could not join");
        else setStatus(detail || s);
      },
      onSnapshot: ({ room, messages, humans }) => {
        if (!room?.id && !room?.characterId) return;
        try {
          const person = getMyHuman();
          const nextHumans = [...(humans || [])];
          if (!nextHumans.some((h) => h.id === person.id)) nextHumans.push(person);

          if (room.kind === "chat" && room.characterId) {
            if (!getCharacterById(room.characterId)) {
              setError("This companion isn't available on this device.");
              return;
            }
            saveChat(room.characterId, messages || [], 0);
            saveChatShare(room.characterId, {
              shareId: room.id || roomId,
              hostId: room.hostId || "",
              humans: nextHumans,
              shared: true,
            });
            if (!opened) {
              opened = true;
              setReady(true);
              setStatus("You're in — opening chat…");
              sync?.destroy();
              navigate(
                `/chat/${room.characterId}?guest=1&sid=${encodeURIComponent(room.id || roomId)}`,
                { replace: true }
              );
            }
            return;
          }

          if (!room?.id) return;
          upsertSharedRoom({
            ...room,
            messages: messages || room.messages || [],
            humans: nextHumans,
            shared: true,
          });
          if (!opened) {
            opened = true;
            setReady(true);
            setStatus("You're in — opening chat…");
            sync?.destroy();
            navigate(`/rooms/${room.id}?guest=1`, { replace: true });
          }
        } catch (err) {
          setError(err.message || "Could not open this chat");
        }
      },
    });

    return () => {
      sync?.destroy();
    };
  }, [roomId, navigate]);

  const profile = getUserProfile();
  const name = getDisplayName(profile);

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <BrandLogo className="text-3xl sm:text-4xl" />
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-dark mb-2">Join chat</h1>
        <p className="text-muted text-sm mb-6">
          {name ? `Hey ${name} — ` : ""}
          your friend invited you to join their DesireChat.
        </p>

        <div className="rounded-2xl bg-white/80 border border-primary/15 px-5 py-6 shadow-sm">
          {!error ? (
            <>
              <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-sm text-dark font-semibold">{status}</p>
              <p className="text-xs text-muted mt-2">
                Ask your friend to keep their chat open while you join.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-red-500 font-semibold mb-3">{error}</p>
              <p className="text-xs text-muted mb-4">
                Make sure your friend has tapped Share and left the chat open.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-glow text-white font-bold px-6 py-2.5 rounded-2xl text-sm"
              >
                Try again
              </button>
            </>
          )}
        </div>

        {ready && <p className="text-xs text-muted mt-4">Connected…</p>}

        <Link to="/" className="inline-block mt-6 text-sm text-primary font-semibold hover:underline">
          Back home
        </Link>
      </div>
    </div>
  );
}
