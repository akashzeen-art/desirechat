import { useMemo, useRef, useState } from "react";
import {
  TESTIMONIAL_VIDEOS,
  getVideoRating,
  getOverallRating,
  listReviews,
  getMyReview,
  saveReview,
  rateVideo,
} from "../data/testimonials";
import { getDisplayName, getUserProfile } from "../data/userProfile";
import { useInView } from "../hooks/useInView";

function Stars({ value = 0, onPick, size = "text-base" }) {
  const rounded = Math.round(value);
  return (
    <div className={`flex items-center gap-0.5 ${size}`} role={onPick ? "radiogroup" : "img"} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(n)}
          className={`leading-none ${onPick ? "hover:scale-110 transition-transform" : "pointer-events-none"}`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          {n <= rounded ? "⭐" : "☆"}
        </button>
      ))}
    </div>
  );
}

function TestimonialClip({ clip, activeId, setActiveId, onRateClip }) {
  const rating = getVideoRating(clip.id);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const isActive = activeId === clip.id;

  const onPlayClick = async (e) => {
    e.stopPropagation();
    setFailed(false);
    setLoading(true);
    setActiveId(clip.id);

    const video = videoRef.current;
    if (!video) {
      setLoading(false);
      return;
    }

    video.playsInline = true;
    try {
      video.muted = false;
      await video.play();
    } catch {
      try {
        video.muted = true;
        await video.play();
        video.muted = false;
      } catch {
        setLoading(false);
        setFailed(true);
        setPlaying(false);
      }
    }
  };

  const onPause = () => {
    setPlaying(false);
    setLoading(false);
    if (activeId === clip.id) setActiveId("");
  };

  return (
    <article className="rounded-3xl overflow-hidden bg-white border border-dark/8 shadow-sm">
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 via-white to-secondary/20">
        {/* Thumbnail — visible until video is playing */}
        {!playing && clip.poster && (
          <img
            src={clip.poster}
            alt={clip.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}

        {!playing && !clip.poster && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary/15 to-secondary/15">
            <span className="text-3xl mb-2">💬</span>
            <p className="font-display font-bold text-dark text-sm">{clip.name}</p>
          </div>
        )}

        <video
          ref={videoRef}
          src={clip.src}
          poster={clip.poster || undefined}
          className={`absolute inset-0 w-full h-full object-cover bg-transparent ${
            playing ? "opacity-100 z-[2]" : "opacity-0 pointer-events-none z-0"
          }`}
          playsInline
          webkit-playsinline="true"
          controls={playing}
          preload="none"
          onPlaying={() => {
            setPlaying(true);
            setLoading(false);
            setFailed(false);
          }}
          onPause={onPause}
          onEnded={onPause}
          onError={() => {
            setLoading(false);
            setPlaying(false);
            setFailed(true);
          }}
        />

        {!playing && (
          <button
            type="button"
            onClick={onPlayClick}
            className="absolute inset-0 z-[3] flex items-center justify-center"
            aria-label={`Play ${clip.name}'s story`}
          >
            <span className="w-12 h-12 rounded-full bg-white/95 text-primary flex items-center justify-center text-lg shadow-lg ring-2 ring-white/80 hover:scale-110 active:scale-95 transition-transform">
              {loading && isActive ? (
                <span className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              ) : (
                "▶"
              )}
            </span>
          </button>
        )}

        {failed && (
          <div className="absolute inset-0 z-[4] flex items-end justify-center p-3 bg-dark/40">
            <p className="text-white text-[11px] text-center font-medium">Video couldn&apos;t play — try Chrome update or another browser</p>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-display font-bold text-dark text-sm">{clip.name}</p>
        <p className="text-[11px] text-muted mb-1.5">{clip.place}</p>
        <p className="text-xs text-dark/80 leading-relaxed mb-2">&ldquo;{clip.quote}&rdquo;</p>
        <div className="flex items-center justify-between gap-2">
          <Stars value={rating.avg} size="text-sm" />
          <span className="text-[10px] text-muted">{rating.avg.toFixed(1)} · {rating.count}</span>
        </div>
        <p className="text-[10px] text-muted mt-2 mb-1">Your rating</p>
        <Stars value={rating.mine || 0} onPick={(n) => onRateClip(clip.id, n)} size="text-base" />
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const [sectionRef, sectionVisible] = useInView("320px");
  const [tick, setTick] = useState(0);
  const overall = useMemo(() => getOverallRating(), [tick]);
  const reviews = useMemo(() => listReviews().slice(0, 6), [tick]);
  const mine = useMemo(() => getMyReview(), [tick]);
  const profile = getUserProfile();
  const [stars, setStars] = useState(mine?.stars || 5);
  const [name, setName] = useState(mine?.name || getDisplayName(profile) || "");
  const [text, setText] = useState(mine?.text || "");
  const [saved, setSaved] = useState(false);
  const [activeId, setActiveId] = useState("");

  const submit = (e) => {
    e.preventDefault();
    saveReview({ stars, text, name });
    setSaved(true);
    setTick((n) => n + 1);
    setTimeout(() => setSaved(false), 2200);
  };

  const onRateClip = (id, n) => {
    rateVideo(id, n);
    setTick((t) => t + 1);
  };

  return (
    <section
      ref={sectionRef}
      className="relative px-4 py-10 sm:py-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(233,30,140,0.06) 50%, transparent 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">Testimonials</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">Loved by people like you</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted">
            <Stars value={overall.avg} />
            <span className="font-semibold text-dark">{overall.avg.toFixed(1)}</span>
            <span>· {overall.count} ratings</span>
          </div>
        </div>

        {sectionVisible ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10">
              {TESTIMONIAL_VIDEOS.map((clip) => (
                <TestimonialClip
                  key={clip.id}
                  clip={clip}
                  activeId={activeId}
                  setActiveId={setActiveId}
                  onRateClip={onRateClip}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <form onSubmit={submit} className="rounded-3xl bg-white border border-dark/8 shadow-sm p-5 sm:p-6">
                <h3 className="font-display font-bold text-dark text-lg mb-1">Add your rating</h3>
                <p className="text-xs text-muted mb-4">Tell others how Yallo! felt for you.</p>
                <label className="block text-xs font-semibold text-muted mb-1">Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 32))}
                  placeholder="Your name"
                  className="w-full mb-3 text-sm px-3 py-2.5 rounded-xl border border-dark/10 bg-white text-dark outline-none focus:border-primary/50"
                />
                <label className="block text-xs font-semibold text-muted mb-1">Stars</label>
                <div className="mb-3">
                  <Stars value={stars} onPick={setStars} size="text-2xl" />
                </div>
                <label className="block text-xs font-semibold text-muted mb-1">A few words</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 180))}
                  rows={3}
                  placeholder="What did you like?"
                  className="w-full mb-4 text-sm px-3 py-2.5 rounded-xl border border-dark/10 bg-white text-dark outline-none focus:border-primary/50 resize-none"
                />
                <button type="submit" className="btn-glow text-white font-bold px-6 py-2.5 rounded-2xl text-sm">
                  {mine ? "Update rating" : "Submit rating"}
                </button>
                {saved && <span className="ml-3 text-xs font-semibold text-primary">Saved 💕</span>}
              </form>

              <div className="rounded-3xl bg-white border border-dark/8 shadow-sm p-5 sm:p-6">
                <h3 className="font-display font-bold text-dark text-lg mb-4">Recent ratings</h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted">Be the first to leave a rating.</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="rounded-2xl border border-dark/6 px-3.5 py-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-dark text-sm truncate">{r.name}</p>
                          <Stars value={r.stars} size="text-sm" />
                        </div>
                        {r.text && <p className="text-xs text-muted leading-relaxed">{r.text}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted">Scroll to load testimonials…</div>
        )}
      </div>
    </section>
  );
}
