import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import SuggestionPopup from "../components/SuggestionPopup";
import { getCharacterById } from "../data/characters";
import { getMood } from "../data/moods";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { randomTruth, randomDare } from "../data/truthOrDare";
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

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const hasGreetedRef = useRef(false);
  const chunkTimersRef = useRef([]);
  const typingSoundRef = useRef(null);

  useEffect(() => {
    if (!character) { navigate("/pick"); return; }

    hasGreetedRef.current = false;
    setMessages([]);
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);
    setFav(isFavorite(character.id));
    setTodMode(false);
    setPopupOpen(false);

    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    const greetingTimer = setTimeout(() => {
      if (hasGreetedRef.current) return;
      hasGreetedRef.current = true;
      clearInterval(typingSoundRef.current);

      const greetingText = character.greeting || `Hello! I am ${character.name}. How can I help you?`;

      setIsTyping(false);
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: greetingText,
        timestamp: new Date().toISOString(),
      }]);
      playReceiveSound();
      speakInChunks(greetingText, character.gender || "male");
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

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setError(null);
    setPopupOpen(false);
    playSendSound();

    const userMsg = { id: Date.now(), role: "user", content: msg, timestamp: new Date().toISOString() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsTyping(true);
    typingSoundRef.current = setInterval(playTypingSound, 180);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChatMessage(msg, characterId, history, {
        mood,
        truthOrDare: todMode,
      });
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      const withAi = [...nextHistory, aiMsg];
      setMessages(withAi);
      playReceiveSound();
      speakInChunks(data.reply, character.gender || "male");
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
    setMessages([{
      id: Date.now(),
      role: "assistant",
      content: character.greeting || `Hello! I am ${character.name}.`,
      timestamp: new Date().toISOString(),
    }]);
    setError(null);
  };

  const speakInChunks = (fullText, gender) => {
    stopSpeaking();
    chunkTimersRef.current.forEach(clearTimeout);
    chunkTimersRef.current = [];

    const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
    const WORDS_PER_6S = 14;
    const PAUSE_MS = 800;

    const chunks = [];
    let current = "";
    for (const s of sentences) {
      const combined = current ? current + " " + s.trim() : s.trim();
      const wordCount = combined.split(/\s+/).length;
      if (wordCount > WORDS_PER_6S && current) {
        chunks.push(current);
        current = s.trim();
      } else {
        current = combined;
      }
    }
    if (current) chunks.push(current);

    let delay = 0;
    chunks.forEach((chunk, i) => {
      const t = setTimeout(() => {
        setIsSpeaking(true);
        speakText(chunk, () => {
          setIsSpeaking(false);
          if (i === chunks.length - 1) chunkTimersRef.current = [];
        }, gender);
      }, delay);
      chunkTimersRef.current.push(t);
      const words = chunk.split(/\s+/).length;
      delay += Math.max(3000, (words / 140) * 60000) + PAUSE_MS;
    });
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
    loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content })));
  };

  if (!character) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden hero-bg">
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
      />

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
          loadPopupSuggestions(messages.map((m) => ({ role: m.role, content: m.content })))
        }
      />
    </div>
  );
}
