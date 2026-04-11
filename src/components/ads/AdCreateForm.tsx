import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import MediaUploader, { MediaItem } from "@/components/MediaUploader";
import { categories, subcategories } from "@/data/mockData";
import { getCategoryConfig } from "@/data/categoryConfig";
import CitySelect from "@/components/CitySelect";
import { getTemplates, saveTemplate, deleteTemplate } from "@/lib/adsApi";

interface FormData {
  title: string;
  price: string;
  description: string;
  category: string;
  subcategory: string;
  city: string;
  condition: string;
  quantity: string;
  bargain: string;
  exchange: string;
  price_type: string;   // 'fixed' | 'from' | 'free'
  mileage: string;
  extras: Record<string, string>;
}

interface Template { id: number; name: string; data: Record<string, string>; created_at: string; }

interface AdCreateFormProps {
  formData: FormData;
  media: MediaItem[];
  saving: boolean;
  error: string;
  onFieldChange: (key: string, value: string) => void;
  onExtrasChange: (key: string, value: string) => void;
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
  onExtrasChange,
  onMediaChange,
  onSubmit,
  onCancel,
}: AdCreateFormProps) {
  const cfg = getCategoryConfig(formData.category);
  const availableSubcats = formData.category ? (subcategories[formData.category] || []) : [];
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savingTpl, setSavingTpl] = useState(false);
  const [tplName, setTplName] = useState("");
  const [showSaveTpl, setShowSaveTpl] = useState(false);

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.templates)).catch(() => {});
  }, []);

  const handleApplyTemplate = (tpl: Template) => {
    Object.entries(tpl.data).forEach(([k, v]) => onFieldChange(k, v));
    setShowTemplates(false);
  };

  const handleSaveTemplate = async () => {
    if (!tplName.trim()) return;
    setSavingTpl(true);
    try {
      const data: Record<string, string> = {
        title: formData.title, description: formData.description, price: formData.price,
        category: formData.category, subcategory: formData.subcategory, city: formData.city,
        condition: formData.condition, quantity: formData.quantity,
        bargain: formData.bargain, exchange: formData.exchange,
      };
      await saveTemplate(tplName.trim(), data);
      const r = await getTemplates();
      setTemplates(r.templates);
      setShowSaveTpl(false);
      setTplName("");
    } catch (e) { console.error(e); }
    setSavingTpl(false);
  };

  const handleDeleteTemplate = async (id: number) => {
    await deleteTemplate(id).catch(() => {});
    setTemplates(t => t.filter(x => x.id !== id));
  };

  const priceType = formData.price_type || "fixed";
  const isFree = priceType === "free";

  return (
    <form onSubmit={onSubmit} className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-violet-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold gradient-text">Создать объявление</h2>
        {templates.length > 0 && (
          <div className="relative">
            <button type="button" onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-violet-200 text-violet-700 rounded-xl text-xs font-semibold hover:bg-violet-50 transition-colors">
              <Icon name="BookOpen" size={13} />
              Шаблоны ({templates.length})
            </button>
            {showTemplates && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-border rounded-xl shadow-xl z-20 py-1 animate-fade-in">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center gap-1 px-3 py-2 hover:bg-muted/40 group">
                    <button type="button" onClick={() => handleApplyTemplate(t)}
                      className="flex-1 text-left text-sm font-medium truncate">{t.name}</button>
                    <button type="button" onClick={() => handleDeleteTemplate(t.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all">
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
            onChange={e => {
              onFieldChange("category", e.target.value);
              onFieldChange("subcategory", "");
              onFieldChange("condition", "used");
              onFieldChange("price_type", "fixed");
            }}
            className={inputCls}
          >
            <option value="">Выберите категорию</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Подкатегория */}
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
          <label className={labelCls}>
            {priceType === "from" ? "Цена от, ₽" : "Цена, ₽"}
          </label>

          {/* Тип цены */}
          <div className="flex gap-1.5 mb-2">
            {[
              { value: "fixed", label: "Фиксированная" },
              ...(cfg.allowPriceFrom ? [{ value: "from", label: "Цена от" }] : []),
              ...(cfg.allowFree ? [{ value: "free", label: "Бесплатно" }] : []),
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFieldChange("price_type", opt.value)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  priceType === opt.value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-border text-muted-foreground hover:border-violet-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {!isFree && (
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={e => onFieldChange("price", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          )}
          {isFree && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
              <Icon name="Gift" size={15} />
              Отдам бесплатно
            </div>
          )}

          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.bargain === "true"}
                onChange={e => onFieldChange("bargain", String(e.target.checked))}
                className="w-4 h-4 rounded accent-violet-600"
              />
              <span className="text-sm text-muted-foreground">Торг уместен</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.exchange === "true"}
                onChange={e => onFieldChange("exchange", String(e.target.checked))}
                className="w-4 h-4 rounded accent-violet-600"
              />
              <span className="text-sm text-muted-foreground">Возможен обмен</span>
            </label>
          </div>
        </div>

        {/* Город */}
        <div>
          <label className={labelCls}>Город</label>
          <CitySelect value={formData.city} onChange={v => onFieldChange("city", v)} placeholder="Выберите город" />
        </div>

        {/* Состояние товара — только для категорий где это имеет смысл */}
        {cfg.showCondition && (
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
        )}

        {/* Пробег — только для транспорта */}
        {cfg.showMileage && (
          <div>
            <label className={labelCls}>Пробег, км</label>
            <input
              type="number"
              min="0"
              value={formData.mileage}
              onChange={e => onFieldChange("mileage", e.target.value)}
              placeholder="150000"
              className={inputCls}
            />
          </div>
        )}

        {/* Количество — только там где нужно */}
        {cfg.showQuantity && (
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
        )}

        {/* Доп. поля по категории */}
        {cfg.extraFields.map(field => (
          <div key={field.key}>
            <label className={labelCls}>{field.label}</label>
            {field.type === "select" ? (
              <select
                value={formData.extras?.[field.key] || ""}
                onChange={e => onExtrasChange(field.key, e.target.value)}
                className={inputCls}
              >
                <option value="">Не указано</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={formData.extras?.[field.key] || ""}
                onChange={e => onExtrasChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputCls}
              />
            )}
          </div>
        ))}

        {/* Описание */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Описание</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => onFieldChange("description", e.target.value)}
            placeholder={
              formData.category === "services"
                ? "Опишите услугу, опыт, что входит в стоимость..."
                : formData.category === "transport"
                ? "Опишите состояние, историю обслуживания, комплектацию..."
                : formData.category === "animals"
                ? "Расскажите о животном, характере, условиях содержания..."
                : "Расскажите подробнее: состояние, комплектация, причина продажи..."
            }
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

      {/* Сохранить как шаблон */}
      {showSaveTpl ? (
        <div className="mt-4 flex gap-2 items-center p-3 bg-violet-50 border border-violet-200 rounded-xl animate-fade-in">
          <input
            type="text"
            value={tplName}
            onChange={e => setTplName(e.target.value)}
            placeholder="Название шаблона..."
            className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-violet-400 bg-white"
          />
          <button type="button" onClick={handleSaveTemplate} disabled={savingTpl}
            className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 disabled:opacity-60">
            {savingTpl ? "..." : "Сохранить"}
          </button>
          <button type="button" onClick={() => setShowSaveTpl(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowSaveTpl(true)}
          className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 transition-colors">
          <Icon name="BookmarkPlus" size={13} />
          Сохранить как шаблон
        </button>
      )}

      <div className="flex gap-3 mt-4">
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
