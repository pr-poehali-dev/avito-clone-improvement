import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Александр Иванов",
    email: "a.ivanov@mail.ru",
    phone: "+7 (999) 123-45-67",
    city: "Москва",
    about: "Продаю качественные товары. Реальным покупателям скидки!",
  });

  const stats = [
    { label: "Объявлений", value: "3", icon: "FileText" },
    { label: "Продано", value: "12", icon: "CheckCircle" },
    { label: "Отзывов", value: "8", icon: "Star" },
    { label: "Рейтинг", value: "4.9", icon: "TrendingUp" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Профиль</h1>
        <p className="text-muted-foreground mt-1">Управляй аккаунтом</p>
      </div>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-bold text-2xl">АИ</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-violet-200 rounded-full flex items-center justify-center hover:bg-violet-50 transition-colors">
              <Icon name="Camera" size={12} className="text-violet-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold">{profile.name}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                <Icon name="Shield" size={10} />
                Верифицирован
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-1">{profile.city}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Calendar" size={11} />
              На ОбъявоМаркет с апреля 2024
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 border border-violet-200 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-50 transition-colors"
          >
            <Icon name={editing ? "X" : "Edit3"} size={14} />
            {editing ? "Отмена" : "Изменить"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {stats.map(stat => (
            <div key={stat.label} className="bg-muted/50 rounded-xl p-3 text-center">
              <div className="font-display font-bold text-lg gradient-text">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Редактировать профиль</h3>
          <div className="space-y-4">
            {[
              { key: "name", label: "Имя", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Телефон", type: "tel" },
              { key: "city", label: "Город", type: "text" },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{field.label}</label>
                <input
                  type={field.type}
                  value={profile[field.key as keyof typeof profile]}
                  onChange={e => setProfile({...profile, [field.key]: e.target.value})}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">О себе</label>
              <textarea
                rows={3}
                value={profile.about}
                onChange={e => setProfile({...profile, about: e.target.value})}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white resize-none"
              />
            </div>
            <button
              onClick={() => setEditing(false)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {[
          { icon: "Bell", label: "Уведомления", desc: "Настройки push-уведомлений" },
          { icon: "Shield", label: "Безопасность", desc: "Пароль и двухфакторная аутентификация" },
          { icon: "CreditCard", label: "Способы оплаты", desc: "Карты и счета" },
          { icon: "HelpCircle", label: "Помощь и поддержка", desc: "Ответы на частые вопросы" },
        ].map((item, i) => (
          <button
            key={item.label}
            className={`flex items-center gap-4 w-full px-5 py-4 text-left hover:bg-muted/40 transition-colors ${
              i > 0 ? "border-t border-border/50" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Icon name={item.icon} size={18} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="flex items-center gap-2 w-full px-5 py-3 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-semibold">
        <Icon name="LogOut" size={16} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
