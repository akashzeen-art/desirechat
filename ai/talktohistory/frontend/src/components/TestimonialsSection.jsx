import { useEffect, useRef, useState } from "react";
import { TESTIMONIAL_VIDEOS } from "../data/testimonials";
import { useInView } from "../hooks/useInView";
import { useI18n } from "../i18n/LanguageContext";
import { haltPreviewVideo, stopAllPreviewVideos, trackPreviewVideo } from "../utils/previewMedia";

import { localizeTestimonial } from "../i18n/localeHelpers";

function TestimonialClip({ clip, activeId, setActiveId, videoFailText, playLabel }) {
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

    stopAllPreviewVideos();
    trackPreviewVideo(video);
    video.playsInline = true;
    video.defaultMuted = false;
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
    } catch {
      try {
        video.muted = true;
        await video.play();
        video.defaultMuted = false;
        video.muted = false;
        video.volume = 1;
      } catch {
        setLoading(false);
        setFailed(true);
        setPlaying(false);
      }
    }
  };

  const onPause = () => {
    haltPreviewVideo(videoRef.current);
    setPlaying(false);
    setLoading(false);
    if (activeId === clip.id) setActiveId("");
  };

  useEffect(() => {
    return () => haltPreviewVideo(videoRef.current);
  }, []);

  return (
    <article className="rounded-3xl overflow-hidden bg-white border border-dark/8 shadow-sm">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-dark/5"
        onContextMenu={(e) => e.preventDefault()}
      >
        {!playing && clip.poster && (
          <img
            src={clip.poster}
            alt={clip.name}
            loading="eager"
            decoding="sync"
            className="absolute inset-0 z-[1] w-full h-full object-cover object-center"
            draggable={false}
          />
        )}

        {!playing && !clip.poster && (
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary/15 to-secondary/15">
            <span className="text-3xl mb-2">💬</span>
            <p className="font-display font-bold text-dark text-sm">{clip.name}</p>
          </div>
        )}

        <video
          ref={videoRef}
          src={clip.src}
          className={`preview-video absolute inset-0 w-full h-full object-cover object-center bg-black ${
            playing ? "opacity-100 z-[2]" : "opacity-0 invisible z-0"
          }`}
          playsInline
          webkit-playsinline="true"
          controls={playing}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(e) => e.preventDefault()}
          preload="metadata"
          onPlaying={() => {
            if (videoRef.current) {
              videoRef.current.defaultMuted = false;
              videoRef.current.muted = false;
              videoRef.current.volume = 1;
            }
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
            aria-label={playLabel}
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
            <p className="text-white text-[11px] text-center font-medium">{videoFailText}</p>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-display font-bold text-dark text-sm">{clip.name}</p>
        <p className="text-[11px] text-muted mb-1.5">{clip.place}</p>
        <p className="text-xs text-dark/80 leading-relaxed">&ldquo;{clip.quote}&rdquo;</p>
      </div>
    </article>
  );
}

export default function TestimonialsSection() {
  const [sectionRef, sectionVisible] = useInView("320px");
  const [activeId, setActiveId] = useState("");
  const { t, lang } = useI18n();

  return (
    <section
      ref={sectionRef}
      className="relative px-4 py-10 sm:py-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, transparent 0%, rgba(233,30,140,0.06) 50%, transparent 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-3">{t("home.testimonials")}</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-dark mb-3">{t("home.lovedBy")}</h2>
          <p className="text-sm text-muted">{t("home.testimonialSub")}</p>
        </div>

        {sectionVisible ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {TESTIMONIAL_VIDEOS.map((clip) => {
              const loc = localizeTestimonial(clip, lang);
              return (
              <TestimonialClip
                key={clip.id}
                clip={loc}
                activeId={activeId}
                setActiveId={setActiveId}
                videoFailText={t("home.videoFail")}
                playLabel={t("home.playStory", { name: loc.name })}
              />
            );})}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-sm text-muted">{t("home.scrollTestimonials")}</div>
        )}
      </div>
    </section>
  );
}
