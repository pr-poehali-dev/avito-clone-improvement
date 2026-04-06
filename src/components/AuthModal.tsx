import { useState } from "react";
import Icon from "@/components/ui/icon";
import { login, register, setToken, User } from "@/lib/auth";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "" });

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let res;
      if (mode === "login") {
        res = await login(form.email, form.password);
      } else {
        res = await register(form.name, form.email, form.password, form.city);
      }
      setToken(res.token);
      onSuccess(res.user, res.token);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Gradient top */}
        <div className="h-2 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {mode === "login" ? "Рады видеть тебя снова!" : "Создай аккаунт за минуту"}
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors text-muted-foreground">
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Имя *</label>
                <div className="relative">
                  <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Ваше имя"
                    required
                    className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Email *</label>
              <div className="relative">
                <Icon name="Mail" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Пароль *</label>
              <div className="relative">
                <Icon name="Lock" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
                  required
                  className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Город</label>
                <div className="relative">
                  <Icon name="MapPin" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set("city", e.target.value)}
                    placeholder="Ваш город"
                    className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 animate-fade-in">
                <Icon name="AlertCircle" size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Загрузка...
                </>
              ) : (
                mode === "login" ? "Войти" : "Создать аккаунт"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Продолжая, вы соглашаетесь с{" "}
            <button className="text-violet-600 hover:underline">условиями использования</button>
          </p>
        </div>
      </div>
    </div>
  );
}
