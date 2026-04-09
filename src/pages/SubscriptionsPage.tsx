import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { categories } from "@/data/mockData";
import { subscribe, unsubscribe, getMySubscriptions, Subscription } from "@/lib/adsApi";

interface SubscriptionsPageProps {
  onNavigate: (page: string) => void;
}

export default function SubscriptionsPage({ onNavigate }: SubscriptionsPageProps) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"categories" | "keywords">("categories");

  const load = () => {
    setLoading(true);
    getMySubscriptions()
      .then(r => setSubs(r.subscriptions))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const subscribedCats = new Set(subs.filter(s => s.type === "category").map(s => s.value));
  const keywordSubs = subs.filter(s => s.type === "keyword");

  const handleToggleCategory = async (catId: string) => {
    const existing = subs.find(s => s.type === "category" && s.value === catId);
    if (existing) {
      await unsubscribe(existing.id);
    } else {
      await subscribe("category", catId);
    }
    load();
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    const kw = keyword.trim();
    if (!kw) return;
    setAdding(true);
    await subscribe("keyword", kw);
    setKeyword("");
    setAdding(false);
    load();
  };

  const handleRemoveKeyword = async (id: number) => {
    await unsubscribe(id);
    load();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Icon name="ChevronLeft" size={16} />
          Назад
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold">Подписки</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Получай уведомления о новых объявлениях</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-violet-50 border border-violet-200 rounded-2xl text-sm text-violet-700">
        <Icon name="Bell" size={16} className="shrink-0 mt-0.5" />
        <p>Когда появится новое объявление в выбранной категории или по ключевому слову — ты получишь уведомление в колоколе.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["categories", "LayoutGrid", "Категории"], ["keywords", "Search", "Ключевые слова"]] as const).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === id ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon name={icon} size={14} />
            {label}
            {id === "categories" && subscribedCats.size > 0 && (
              <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs">{subscribedCats.size}</span>
            )}
            {id === "keywords" && keywordSubs.length > 0 && (
              <span className="bg-white/30 px-1.5 py-0.5 rounded-full text-xs">{keywordSubs.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tab === "categories" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map(cat => {
            const active = subscribedCats.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleToggleCategory(cat.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  active
                    ? "border-violet-500 bg-violet-50"
                    : "border-border bg-white hover:border-violet-300 hover:bg-violet-50/30"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0`}>
                  <Icon name={cat.icon} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold leading-tight ${active ? "text-violet-700" : "text-foreground"}`}>
                    {cat.name}
                  </div>
                </div>
                {active && <Icon name="CheckCircle" size={16} className="text-violet-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Форма добавления */}
          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Например: iPhone 15, велосипед Trek..."
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
            />
            <button
              type="submit"
              disabled={adding || !keyword.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {adding ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icon name="Plus" size={15} />}
              Добавить
            </button>
          </form>

          {keywordSubs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Нет ключевых слов</p>
              <p className="text-xs mt-1">Добавь слово или фразу выше — и получай уведомления</p>
            </div>
          ) : (
            <div className="space-y-2">
              {keywordSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between px-4 py-3 bg-white border border-border rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Icon name="Hash" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{sub.value}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveKeyword(sub.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors text-muted-foreground hover:text-rose-500"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
