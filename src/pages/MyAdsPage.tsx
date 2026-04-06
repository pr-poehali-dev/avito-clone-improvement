import { useState } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import { ads, categories, formatPrice } from "@/data/mockData";

interface MyAdsPageProps {
  adImages: Record<number, string>;
}

export default function MyAdsPage({ adImages }: MyAdsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [formData, setFormData] = useState({
    title: "", price: "", description: "", category: "", city: "",
  });

  const myAds = ads.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Мои объявления</h1>
          <p className="text-muted-foreground mt-1">Управляй своими публикациями</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
        >
          <Icon name={showForm ? "X" : "Plus"} size={16} />
          {showForm ? "Закрыть" : "Новое объявление"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-violet-200">
          <h2 className="font-display text-xl font-bold mb-5 gradient-text">Создать объявление</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Заголовок *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Например: iPhone 15 Pro 256GB"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Цена, ₽ *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Категория *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              >
                <option value="">Выберите категорию</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Город *</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                placeholder="Ваш город"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Описание</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Расскажите подробнее о товаре..."
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white resize-none"
              />
            </div>
            {/* Photo upload */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Фотографии</label>
              <div className="border-2 border-dashed border-violet-200 rounded-xl p-6 text-center hover:border-violet-400 transition-colors cursor-pointer bg-violet-50/50">
                <Icon name="ImagePlus" size={32} className="mx-auto mb-2 text-violet-400" />
                <p className="text-sm text-muted-foreground">Перетащите фото или нажмите для загрузки</p>
                <p className="text-xs text-muted-foreground mt-1">До 10 фотографий, JPG/PNG</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
              Опубликовать объявление
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Активных", value: "3", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Просмотров", value: "2 347", color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Откликов", value: "12", color: "text-cyan-600", bg: "bg-cyan-50" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
            <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["active", "inactive"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "active" ? "Активные (3)" : "Архив (0)"}
          </button>
        ))}
      </div>

      {/* My ads list */}
      {tab === "active" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myAds.map((ad, i) => (
            <div key={ad.id} className={`relative animate-fade-in delay-${(i + 1) * 100}`}>
              <AdCard ad={ad} imageUrl={adImages[ad.id]} />
              <div className="absolute bottom-16 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 py-2 bg-white border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/60 transition-colors">
                  Редактировать
                </button>
                <button className="py-2 px-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
                  Снять
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="Archive" size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Архив пуст</p>
          <p className="text-sm">Снятые объявления появятся здесь</p>
        </div>
      )}
    </div>
  );
}
