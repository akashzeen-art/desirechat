import { CharacterAvatar } from "./ChatMessage";

export default function TypingIndicator({ character }) {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <CharacterAvatar character={character} />
      <div className="chat-bubble-ai rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
