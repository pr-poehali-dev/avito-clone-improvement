import Icon from "@/components/ui/icon";
import MediaUploader, { MediaItem } from "@/components/MediaUploader";
import { categories } from "@/data/mockData";
import CitySelect from "@/components/CitySelect";

interface FormData {
  title: string;
  price: string;
  description: string;
  category: string;
  city: string;
}

interface AdCreateFormProps {
  formData: FormData;
  media: MediaItem[];
  saving: boolean;
  error: string;
  onFieldChange: (key: string, value: string) => void;
  onMediaChange: (media: MediaItem[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function AdCreateForm({
  formData,
  media,
  saving,
  error,
  onFieldChange,
  onMediaChange,
  onSubmit,
  onCancel,
}: AdCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-violet-200">
      <h2 className="font-display text-xl font-bold mb-5 gradient-text">Создать объявление</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Media — занимает всю ширину */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
            Фото и видео
          </label>
          <MediaUploader value={media} onChange={onMediaChange} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Заголовок *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => onFieldChange("title", e.target.value)}
            placeholder="Например: iPhone 15 Pro 256GB"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Цена, ₽</label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={e => onFieldChange("price", e.target.value)}
            placeholder="0"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Категория *</label>
          <select
            value={formData.category}
            onChange={e => onFieldChange("category", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
          >
            <option value="">Выберите категорию</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Город</label>
          <CitySelect value={formData.city} onChange={v => onFieldChange("city", v)} placeholder="Выберите город" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Описание</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => onFieldChange("description", e.target.value)}
            placeholder="Расскажите подробнее: состояние, комплектация, причина продажи..."
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          <Icon name="AlertCircle" size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Публикую...</>
          ) : (
            <><Icon name="Send" size={16} />Опубликовать объявление</>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
