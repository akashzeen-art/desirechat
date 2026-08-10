import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import SuggestionPopup from "../components/SuggestionPopup";
import SnakesLaddersGame from "../components/SnakesLaddersGame";
import DiceGame from "../components/DiceGame";
import { getCharacterById, wantsPhotoShare, nextPhotoShare } from "../data/characters";
import { getMood } from "../data/moods";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { randomTruth, randomDare } from "../data/truthOrDare";
import { loadChat, saveChat, clearChat } from "../data/chatHistory";
import {
  getUserProfile,
  setUserProfile,
  getDisplayName,
  extractProfileHints,
  buildIntroGreeting,
} from "../data/userProfile";
import {
  sendChatMessage,
  fetchConversationSuggestions,
  createSpeechRecognition,
  stopSpeaking,
  speakText,
} from "../services/api";
import { playSendSound, playReceiveSound, playTypingSound } from "../utils/sounds";

export default function ChatPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const character = getCharacterById(characterId);
  const mood = getMood();

  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/pick");
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fav, setFav] = useState(() => (character ? isFavorite(character.id) : false));
  const [todMode, setTodMode] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupSuggestions, setPopupSuggestions] = useState([]);
  const [resumed, setResumed] = useState(false);
  const [snakesOpen, setSnakesOpen] = useState(false);
  const [diceOpen, setDiceOpen] = useState(false);
  const [userProfile, setUserProfileState] = useState(() => getUserProfile());

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const hasGreetedRef = useRef(false);
  const chunkTimersRef = useRef([]);
  const typingSoundRef = useRef(null);
  const photosSharedRef = useRef(0);
  const photoTeaseRef = useRef(false);
  const readyToSaveRef = useRef(false);

  const voiceOpts = {
    gender: character?.gender || "male",
    region: character?.region || "european",
  };

  useEffect(() => {
    if (!character) { navigate("/pick"); return; }

    readyToSaveRef.current = false;
    hasGreetedRef.current = false;
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);
    setFav(isFavorite(character.id));
    setTodMode(false);
    setPopupOpen(false);

    const saved = loadChat(character.id);
    if (saved?.messages?.length) {
      photosSharedRef.current = saved.photosShared || 0;
      photoTeaseRef.current = false;
      setMessages(saved.messages);
      setResumed(true);
      hasGreetedRef.current = true;
      setIsTyping(false);
      readyToSaveRef.current = true;
      setTimeout(() => inputRef.current?.focus(), 100);
      return () => {
        stopSpeaking();
        setIsSpeaking(false);
        chunkTimersRef.current.forEach(clearTimeout);
        chunkTimersRef.current = [];
        recognitionRef.current?.abort();
      };
    }

    setResumed(false);
    photosSharedRef.current = 0;
    photoTeaseRef.current = false;
    setMessages([]);
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    const greetingTimer = setTimeout(() => {
      if (hasGreetedRef.current) return;
      hasGreetedRef.current = true;
      clearInterval(typingSoundRef.current);

      const greetingText = buildIntroGreeting(character.name, getUserProfile());

      setIsTyping(false);
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: greetingText,
        timestamp: new Date().toISOString(),
      }]);
      readyToSaveRef.current = true;
      playReceiveSound();
      speakInChunks(greetingText, voiceOpts);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1200);

    return () => {
      clearTimeout(greetingTimer);
      clearInterval(typingSoundRef.current);
      stopSpeaking();
      setIsSpeaking(false);
      chunkTimersRef.current.forEach(clearTimeout);
      chunkTimersRef.current = [];
      recognitionRef.current?.abort();
    };
  }, [characterId]);

  useEffect(() => {
    if (!character || !readyToSaveRef.current || !messages.length) return;
    saveChat(character.id, messages, photosSharedRef.current);
  }, [messages, character]);

  const loadPopupSuggestions = async (history) => {
    setPopupLoading(true);
    setPopupOpen(true);
    try {
      const list = await fetchConversationSuggestions(character.name, history, mood);
      setPopupSuggestions(list);
    } catch {
      setPopupSuggestions([
        "Tell me more",
        "That was cute — keep going",
        "Your turn to ask me something",
      ]);
    } finally {
      setPopupLoading(false);
    }
  };

  const appendAssistantReply = async (userText, nextHistory, { imageNote = false } = {}) => {
    if (character?.shareImages?.length && wantsPhotoShare(userText) && !imageNote) {
      await new Promise((r) => setTimeout(r, 700));

      // First ask → flirt/tease only. Ask again → send the pic.
      const mode = photoTeaseRef.current ? "send" : "tease";
      const share = nextPhotoShare(character, photosSharedRef.current, mode);

      if (share.done) {
        photoTeaseRef.current = false;
      } else if (share.tease) {
        photoTeaseRef.current = true;
      } else {
        photoTeaseRef.current = false;
        photosSharedRef.current += 1;
      }

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: share.content,
        image: share.image || undefined,
        timestamp: new Date().toISOString(),
      };
      setMessages([...nextHistory, aiMsg]);
      playReceiveSound();
      speakInChunks(share.speak || share.content, voiceOpts);
      return;
    }

    const history = nextHistory
      .slice(-10)
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role,
        content: m.image && !m.content
          ? "[User shared a photo]"
          : m.image
          ? `${m.content}\n[User also shared a photo]`
          : m.content,
      }));

    const prompt = imageNote
      ? userText || "I just shared a photo with you. React to it in a flirty, warm way — keep it short."
      : userText;

    const data = await sendChatMessage(prompt, characterId, history.slice(0, -1), {
      mood,
      truthOrDare: todMode,
      userProfile: getUserProfile(),
    });
    const aiMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: data.reply,
      timestamp: new Date().toISOString(),
    };
    setMessages([...nextHistory, aiMsg]);
    playReceiveSound();
    speakInChunks(data.reply, voiceOpts);
  };

  const applyProfileHints = (text) => {
    const hints = extractProfileHints(text);
    if (!hints.name && !hints.nickname && !hints.place) return;
    const next = setUserProfile(hints);
    setUserProfileState(next);
  };

  const handleNicknameSave = (nickname) => {
    const next = setUserProfile({ nickname: String(nickname || "").trim() });
    setUserProfileState(next);
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setError(null);
    setPopupOpen(false);
    setResumed(false);
    playSendSound();
    applyProfileHints(msg);

    const userMsg = { id: Date.now(), role: "user", content: msg, timestamp: new Date().toISOString() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    try {
      await appendAssistantReply(msg, nextHistory);
    } catch (err) {
      setError(err.message || "Couldn't get a reply. Check your OpenAI key in frontend/.env");
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendImage = async (imageDataUrl, caption = "") => {
    if (!imageDataUrl || isTyping) return;
    setError(null);
    setPopupOpen(false);
    setResumed(false);
    playSendSound();

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: caption.trim(),
      image: imageDataUrl,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    try {
      const note = caption.trim()
        ? `I shared a photo and said: "${caption.trim()}". React warmly.`
        : "I just shared a photo with you. React to it in a flirty, warm way — keep it short.";
      await appendAssistantReply(note, nextHistory, { imageNote: true });
    } catch (err) {
      setError(err.message || "Couldn't get a reply. Check your OpenAI key in frontend/.env");
    } finally {
      clearInterval(typingSoundRef.current);
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setError("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(transcript), 300);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleClear = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setPopupOpen(false);
    setResumed(false);
    photosSharedRef.current = 0;
    photoTeaseRef.current = false;
    clearChat(character.id);
    const greetingText = buildIntroGreeting(character.name, getUserProfile());
    const greeting = {
      id: Date.now(),
      role: "assistant",
      content: greetingText,
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
    setError(null);
    speakInChunks(greetingText, voiceOpts);
  };

  const speakInChunks = (fullText, opts) => {
    if (!fullText?.trim()) return;
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(true);
    // One utterance for the whole reply — avoids long pauses after . !
    speakText(
      fullText,
      () => setIsSpeaking(false),
      opts || voiceOpts
    );
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];
    setIsSpeaking(false);
  };

  const toggleFav = () => {
    const next = toggleFavorite(character.id);
    setFav(next.includes(character.id));
  };

  const startTruthOrDare = (type) => {
    setTodMode(true);
    const prompt =
      type === "truth"
        ? `Truth or Dare — I pick Truth. Ask me: "${randomTruth()}"`
        : `Truth or Dare — I pick Dare. My dare is: "${randomDare()}" — react and keep the game going!`;
    handleSend(prompt);
  };

  const openIdeas = () => {
    if (messages.length < 1) return;
    loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content || "[photo]" })));
  };

  const addSystemLine = (content, { speak = false } = {}) => {
    const msg = {
      id: Date.now() + Math.random(),
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    if (speak) speakInChunks(content.replace(/[🪜🐍🎉]/g, "").trim(), voiceOpts);
  };

  const openSnakes = () => {
    setDiceOpen(false);
    setSnakesOpen(true);
  };

  const openDice = () => {
    setSnakesOpen(false);
    setDiceOpen(true);
  };

  const gameOpen = snakesOpen || diceOpen;

  if (!character) return null;

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden hero-bg pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div
        className={`flex-1 min-h-0 w-full mx-auto flex ${
          gameOpen
            ? "max-w-6xl flex-col lg:flex-row"
            : "max-w-3xl flex-col"
        }`}
      >
        {snakesOpen && (
          <div className="w-full lg:w-[46%] xl:w-[42%] h-[42%] lg:h-full min-h-0 flex-shrink-0 border-b lg:border-b-0 border-primary/10">
            <SnakesLaddersGame
              open={snakesOpen}
              character={character}
              onClose={() => setSnakesOpen(false)}
              disabled={isTyping}
              onAnnounce={(line, { speak } = {}) => addSystemLine(line, { speak })}
            />
          </div>
        )}

        {diceOpen && (
          <div className="w-full lg:w-[46%] xl:w-[42%] h-[42%] lg:h-full min-h-0 flex-shrink-0 border-b lg:border-b-0 border-primary/10">
            <DiceGame
              open={diceOpen}
              character={character}
              onClose={() => setDiceOpen(false)}
              disabled={isTyping}
              onAnnounce={(line, { speak } = {}) => addSystemLine(line, { speak })}
            />
          </div>
        )}

        <div className={`min-h-0 min-w-0 flex-1 ${gameOpen ? "h-[58%] lg:h-full" : "h-full"}`}>
          <ChatPanel
            character={character}
            messages={messages}
            isTyping={isTyping}
            isSpeaking={isSpeaking}
            isListening={isListening}
            error={error}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            onSendImage={handleSendImage}
            onMicClick={handleVoiceInput}
            onStopSpeaking={handleStopSpeaking}
            onClear={handleClear}
            onBack={handleBack}
            inputRef={inputRef}
            isFavorite={fav}
            onToggleFavorite={toggleFav}
            mood={mood}
            todMode={todMode}
            onToggleTod={() => setTodMode((v) => !v)}
            onTruth={() => startTruthOrDare("truth")}
            onDare={() => startTruthOrDare("dare")}
            onOpenIdeas={openIdeas}
            resumed={resumed}
            onOpenSnakes={openSnakes}
            onOpenDice={openDice}
            split={gameOpen}
            snakesActive={snakesOpen}
            diceActive={diceOpen}
            userProfile={userProfile}
            displayName={getDisplayName(userProfile)}
            onSaveNickname={handleNicknameSave}
          />
        </div>
      </div>

      <SuggestionPopup
        open={popupOpen}
        suggestions={popupSuggestions}
        loading={popupLoading}
        onPick={(q) => {
          setPopupOpen(false);
          handleSend(q);
        }}
        onClose={() => setPopupOpen(false)}
        onShuffle={() =>
          loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content || "[photo]" })))
        }
      />
    </div>
  );
}
