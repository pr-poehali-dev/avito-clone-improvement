import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface MediaItem {
  url: string;
  type: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  title?: string;
}

export default function MediaGallery({ media, title }: MediaGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Фото идут первыми, видео — в конце
  const photos = media.filter(m => m.type === "photo");
  const videos = media.filter(m => m.type === "video");
  const ordered = [...photos, ...videos];

  const prev = useCallback(() => setActive(a => (a - 1 + ordered.length) % ordered.length), [ordered.length]);
  const next = useCallback(() => setActive(a => (a + 1) % ordered.length), [ordered.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  if (ordered.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
        <span className="text-7xl opacity-30">📷</span>
      </div>
    );
  }

  const current = ordered[active];

  return (
    <>
      {/* Main viewer */}
      <div className="space-y-3">
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] group">
          {current.type === "video" ? (
            <video
              src={current.url}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={current.url}
              alt={title}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
          )}

          {/* Prev/Next arrows */}
          {ordered.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}

          {/* Counter + fullscreen */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-all">
            <span className="bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {active + 1} / {ordered.length}
            </span>
            {current.type !== "video" && (
              <button
                onClick={() => setLightbox(true)}
                className="bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Icon name="Expand" size={13} />
                На весь экран
              </button>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {ordered.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {ordered.map((m, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                  active === i ? "border-violet-500 scale-105" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {m.type === "video" ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Icon name="Play" size={16} className="text-white" />
                  </div>
                ) : (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
          >
            <Icon name="X" size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            {active + 1} / {ordered.length}
          </div>

          {/* Prev */}
          {ordered.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Icon name="ChevronLeft" size={24} />
            </button>
          )}

          {/* Image */}
          <img
            src={ordered[active].url}
            alt={title}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {ordered.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Icon name="ChevronRight" size={24} />
            </button>
          )}

          {/* Thumbnails row */}
          {ordered.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={e => e.stopPropagation()}
            >
              {ordered.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    active === i ? "border-white scale-110" : "border-white/30 opacity-60 hover:opacity-90"
                  }`}
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Icon name="Play" size={14} className="text-white" />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
