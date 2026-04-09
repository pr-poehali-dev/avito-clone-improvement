import Icon from "@/components/ui/icon";
import MediaUploader, { MediaItem } from "@/components/MediaUploader";
import { categories, subcategories } from "@/data/mockData";
import CitySelect from "@/components/CitySelect";

interface FormData {
  title: string;
  price: string;
  description: string;
  category: string;
  subcategory: string;
  city: string;
  condition: string;
  quantity: string;
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

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white";
const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

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
  const availableSubcats = formData.category ? (subcategories[formData.category] || []) : [];

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-violet-200">
      <h2 className="font-display text-xl font-bold mb-5 gradient-text">Создать объявление</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Media */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Фото и видео</label>
          <MediaUploader value={media} onChange={onMediaChange} />
        </div>

        {/* Заголовок */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Заголовок *</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => onFieldChange("title", e.target.value)}
            placeholder="Например: iPhone 15 Pro 256GB"
            className={inputCls}
          />
        </div>

        {/* Категория */}
        <div>
          <label className={labelCls}>Категория *</label>
          <select
            value={formData.category}
            onChange={e => { onFieldChange("category", e.target.value); onFieldChange("subcategory", ""); }}
            className={inputCls}
          >
            <option value="">Выберите категорию</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Подкатегория — появляется после выбора категории */}
        <div>
          <label className={labelCls}>Подкатегория</label>
          <select
            value={formData.subcategory}
            onChange={e => onFieldChange("subcategory", e.target.value)}
            disabled={!availableSubcats.length}
            className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">{availableSubcats.length ? "Выберите подкатегорию" : "Сначала выберите категорию"}</option>
            {availableSubcats.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Цена */}
        <div>
          <label className={labelCls}>Цена, ₽</label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={e => onFieldChange("price", e.target.value)}
            placeholder="0"
            className={inputCls}
          />
        </div>

        {/* Город */}
        <div>
          <label className={labelCls}>Город</label>
          <CitySelect value={formData.city} onChange={v => onFieldChange("city", v)} placeholder="Выберите город" />
        </div>

        {/* Состояние товара */}
        <div>
          <label className={labelCls}>Состояние</label>
          <div className="flex gap-2">
            {[
              { value: "new", label: "Новое", icon: "Sparkles" },
              { value: "used", label: "Б/У", icon: "RefreshCw" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFieldChange("condition", opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  formData.condition === opt.value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-border bg-white text-muted-foreground hover:border-violet-300"
                }`}
              >
                <Icon name={opt.icon} size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Количество */}
        <div>
          <label className={labelCls}>Количество</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onFieldChange("quantity", String(Math.max(1, parseInt(formData.quantity || "1") - 1)))}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted/50 transition-colors text-lg font-bold"
            >−</button>
            <input
              type="number"
              min="1"
              max="9999"
              value={formData.quantity}
              onChange={e => onFieldChange("quantity", e.target.value)}
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm text-center outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
            />
            <button
              type="button"
              onClick={() => onFieldChange("quantity", String(parseInt(formData.quantity || "1") + 1))}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted/50 transition-colors text-lg font-bold"
            >+</button>
          </div>
          {parseInt(formData.quantity) > 1 && (
            <p className="text-xs text-muted-foreground mt-1">Несколько штук в наличии</p>
          )}
        </div>

        {/* Описание */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Описание</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => onFieldChange("description", e.target.value)}
            placeholder="Расскажите подробнее: состояние, комплектация, причина продажи..."
            className={`${inputCls} resize-none`}
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
