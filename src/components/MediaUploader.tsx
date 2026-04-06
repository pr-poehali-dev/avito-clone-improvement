import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { uploadPhoto } from "@/lib/uploadApi";

export interface MediaItem {
  url: string;
  type: "photo" | "video";
  localUrl?: string;
  uploading?: boolean;
}

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_PHOTOS = 10;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function MediaUploader({ value, onChange }: MediaUploaderProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const photos = value.filter(m => m.type === "photo");
  const video = value.find(m => m.type === "video");

  const uploadFile = async (file: File, type: "photo" | "video") => {
    const localUrl = URL.createObjectURL(file);
    const placeholder: MediaItem = { url: "", type, localUrl, uploading: true };
    const next = [...value, placeholder];
    onChange(next);

    try {
      const cdnUrl = await uploadPhoto(file);
      onChange(next.map(m => m === placeholder ? { url: cdnUrl, type, localUrl: cdnUrl } : m));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      onChange(value.filter(m => m !== placeholder));
    }
  };

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files) return;
    setError("");
    const available = MAX_PHOTOS - photos.length;
    const toUpload = Array.from(files).slice(0, available);

    for (const file of toUpload) {
      if (!PHOTO_TYPES.includes(file.type)) { setError("Можно загружать только JPG, PNG, WebP"); return; }
      if (file.size > MAX_SIZE) { setError("Максимальный размер файла — 10 МБ"); return; }
      await uploadFile(file, "photo");
    }
  };

  const handleVideoFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    const file = files[0];
    if (!VIDEO_TYPES.includes(file.type)) { setError("Поддерживаются форматы MP4, WebM, MOV"); return; }
    if (file.size > MAX_SIZE) { setError("Максимальный размер видео — 10 МБ"); return; }
    await uploadFile(file, "video");
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveLeft = (idx: number) => {
    if (idx === 0) return;
    const arr = [...value];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <input ref={photoRef} type="file" accept={PHOTO_TYPES.join(",")} multiple className="hidden" onChange={e => handlePhotoFiles(e.target.files)} />
      <input ref={videoRef} type="file" accept={VIDEO_TYPES.join(",")} className="hidden" onChange={e => handleVideoFile(e.target.files)} />

      {/* Grid of uploaded media */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((m, i) => {
            const src = m.localUrl || m.url;
            return (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted">
                {m.type === "video" ? (
                  <video src={src} className="w-full h-full object-cover" />
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
                {m.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Icon name="Play" size={20} className="text-white" />
                  </div>
                )}
                {m.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {/* First badge */}
                {i === 0 && !m.uploading && (
                  <span className="absolute top-1 left-1 bg-violet-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-md">
                    Главное
                  </span>
                )}
                {/* Hover controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveLeft(i)}
                      title="Сделать главным"
                      className="w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Icon name="ArrowLeft" size={13} className="text-foreground" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors"
                  >
                    <Icon name="X" size={13} className="text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload buttons */}
      <div className="flex gap-3 flex-wrap">
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-violet-200 hover:border-violet-400 text-violet-600 rounded-xl text-sm font-semibold transition-all hover:bg-violet-50"
          >
            <Icon name="ImagePlus" size={16} />
            Добавить фото ({photos.length}/{MAX_PHOTOS})
          </button>
        )}
        {!video && (
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-cyan-200 hover:border-cyan-400 text-cyan-600 rounded-xl text-sm font-semibold transition-all hover:bg-cyan-50"
          >
            <Icon name="Video" size={16} />
            Добавить видео
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        До {MAX_PHOTOS} фото (JPG, PNG, WebP) и 1 видео (MP4, WebM) · до 10 МБ каждый файл
      </p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <Icon name="AlertCircle" size={14} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
