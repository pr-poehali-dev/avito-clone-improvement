import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { uploadPhoto } from "@/lib/uploadApi";

interface PhotoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(value);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Максимальный размер — 5 МБ");
      return;
    }

    setError("");
    setUploading(true);

    // Показываем превью сразу
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const cdnUrl = await uploadPhoto(file);
      setPreview(cdnUrl);
      onChange(cdnUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setPreview(value);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-violet-200 group">
          <img
            src={preview}
            alt="Фото объявления"
            className="w-full h-52 object-cover"
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-foreground rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <Icon name="RefreshCw" size={14} />
              Заменить
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors"
            >
              <Icon name="Trash2" size={14} />
              Удалить
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span className="text-sm font-medium">Загружаю...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onDragEnter={e => e.preventDefault()}
          className="w-full border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-2xl p-8 flex flex-col items-center gap-3 transition-all bg-violet-50/40 hover:bg-violet-50 group cursor-pointer"
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <span className="text-sm text-violet-600 font-medium">Загружаю фото...</span>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
                <Icon name="ImagePlus" size={26} className="text-violet-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-foreground">Нажмите или перетащите фото</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · до 5 МБ</p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <Icon name="AlertCircle" size={14} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
