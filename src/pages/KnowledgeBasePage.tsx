import { useState } from "react";
import Icon from "@/components/ui/icon";

interface KnowledgeBasePageProps {
  onNavigate: (page: string) => void;
}

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSection {
  icon: string;
  title: string;
  color: string;
  items: FaqItem[];
}

const sections: FaqSection[] = [
  {
    icon: "UserCircle",
    title: "Аккаунт и вход",
    color: "from-violet-500 to-violet-600",
    items: [
      {
        q: "Как зарегистрироваться?",
        a: "Нажмите кнопку «Войти» в правом верхнем углу, затем выберите «Зарегистрироваться». Введите имя, email и придумайте пароль. После регистрации вы сразу сможете подавать объявления.",
      },
      {
        q: "Я забыл пароль — что делать?",
        a: "На странице входа нажмите «Забыл пароль», введите email, указанный при регистрации. На почту придёт ссылка для сброса пароля.",
      },
      {
        q: "Как изменить имя, телефон или город?",
        a: "Перейдите в раздел «Профиль» (иконка пользователя). Нажмите «Редактировать», внесите изменения и сохраните. Данные обновятся сразу.",
      },
      {
        q: "Как удалить аккаунт?",
        a: "Напишите нам в чат поддержки с просьбой удалить аккаунт. Укажите email. Мы удалим все ваши данные в течение 24 часов.",
      },
    ],
  },
  {
    icon: "FileText",
    title: "Объявления",
    color: "from-cyan-500 to-cyan-600",
    items: [
      {
        q: "Как подать объявление?",
        a: "Нажмите кнопку «Подать объявление» (большая кнопка в навигации). Заполните название, описание, цену и категорию. Добавьте фото. Отправьте на модерацию — обычно это занимает до 30 минут.",
      },
      {
        q: "Почему моё объявление не опубликовано?",
        a: "Все объявления проходят модерацию. Если объявление отклонено, вы получите уведомление с причиной. Наиболее частые причины: нарушение правил, некорректное описание, запрещённый товар.",
      },
      {
        q: "Как редактировать или снять объявление?",
        a: "Перейдите в раздел «Мои объявления». Найдите нужное и нажмите кнопку редактирования или «Снять с публикации».",
      },
      {
        q: "Сколько объявлений можно подать бесплатно?",
        a: "Стандартные объявления размещаются бесплатно без ограничений. Платные опции (поднятие, выделение) доступны для увеличения просмотров.",
      },
      {
        q: "Как пометить товар как «Продан»?",
        a: "В разделе «Мои объявления» нажмите на нужное объявление и выберите «Отметить как проданное». Объявление переместится в архив.",
      },
    ],
  },
  {
    icon: "MessageCircle",
    title: "Сообщения и сделки",
    color: "from-emerald-500 to-emerald-600",
    items: [
      {
        q: "Как написать продавцу?",
        a: "Откройте объявление и нажмите кнопку «Написать сообщение». Переписка хранится в разделе «Сообщения».",
      },
      {
        q: "Продавец не отвечает — что делать?",
        a: "Попробуйте написать ещё раз или позвонить по номеру, если он указан. Если продавец не отвечает долгое время — объявление могло устареть.",
      },
      {
        q: "Как безопасно провести сделку?",
        a: "Встречайтесь в людных местах, проверяйте товар перед оплатой. Не переводите деньги заранее незнакомым людям. При сомнениях — откажитесь от сделки.",
      },
      {
        q: "Можно ли торговаться?",
        a: "Да! Если в объявлении стоит метка «Торг», продавец готов к торгу. Вы можете предложить свою цену через кнопку «Предложить цену» на странице объявления.",
      },
    ],
  },
  {
    icon: "Shield",
    title: "Безопасность",
    color: "from-rose-500 to-rose-600",
    items: [
      {
        q: "Как пожаловаться на объявление или пользователя?",
        a: "На странице объявления нажмите кнопку «Пожаловаться» (флажок). Укажите причину. Мы рассмотрим жалобу в течение 24 часов.",
      },
      {
        q: "Что делать, если меня обманули?",
        a: "Немедленно напишите в поддержку через чат. Сохраните переписку и скриншоты. Мы заблокируем мошенника и поможем разобраться в ситуации.",
      },
      {
        q: "Как распознать мошенника?",
        a: "Признаки: просят предоплату на карту, предлагают слишком низкую цену, отказываются встречаться лично, просят перейти в другой мессенджер. Будьте осторожны!",
      },
    ],
  },
  {
    icon: "CreditCard",
    title: "Платежи и тарифы",
    color: "from-amber-500 to-amber-600",
    items: [
      {
        q: "Платформа платная?",
        a: "Базовый функционал — размещение объявлений, переписка, избранное — полностью бесплатный. Платные услуги: продвижение объявлений в топ.",
      },
      {
        q: "Как поднять объявление в топ?",
        a: "На странице вашего объявления нажмите «Продвинуть». Выберите пакет и оплатите. Объявление поднимется в поиске.",
      },
    ],
  },
];

export default function KnowledgeBasePage({ onNavigate }: KnowledgeBasePageProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const query = search.toLowerCase().trim();
  const filtered = sections
    .map(s => ({
      ...s,
      items: s.items.filter(
        item => !query || item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query)
      ),
    }))
    .filter(s => s.items.length > 0 && (!activeSection || s.title === activeSection));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mb-4"
        >
          <Icon name="ChevronLeft" size={16} />
          На главную
        </button>
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 items-center justify-center shadow-lg">
          <Icon name="BookOpen" size={28} className="text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold">База знаний</h1>
        <p className="text-muted-foreground">Ответы на самые частые вопросы о платформе OMO</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveSection(null); }}
          placeholder="Поиск по вопросам..."
          className="w-full pl-10 pr-4 py-3 border border-border rounded-2xl bg-white dark:bg-card outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={14} />
          </button>
        )}
      </div>

      {/* Category filters */}
      {!search && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !activeSection ? "bg-violet-600 text-white" : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            Все разделы
          </button>
          {sections.map(s => (
            <button
              key={s.title}
              onClick={() => setActiveSection(activeSection === s.title ? null : s.title)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === s.title ? "bg-violet-600 text-white" : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon name={s.icon} size={11} />
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* FAQ sections */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-muted-foreground">Ничего не найдено по запросу «{search}»</p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm text-violet-600 hover:underline"
          >
            Сбросить поиск
          </button>
        </div>
      ) : (
        filtered.map(section => (
          <div key={section.title} className="glass-card rounded-2xl overflow-hidden">
            <div className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${section.color}`}>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon name={section.icon} size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-white">{section.title}</h2>
              <span className="ml-auto text-white/70 text-xs">{section.items.length} вопросов</span>
            </div>
            <div className="divide-y divide-border/50">
              {section.items.map((item, idx) => {
                const key = `${section.title}-${idx}`;
                const isOpen = openItems[key];
                return (
                  <button
                    key={key}
                    onClick={() => toggleItem(key)}
                    className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-sm font-semibold leading-snug ${isOpen ? "text-violet-600" : "text-foreground"}`}>
                        {item.q}
                      </span>
                      <Icon
                        name={isOpen ? "ChevronUp" : "ChevronDown"}
                        size={16}
                        className={`shrink-0 mt-0.5 transition-transform ${isOpen ? "text-violet-600" : "text-muted-foreground"}`}
                      />
                    </div>
                    {isOpen && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                        {item.a}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* CTA */}
      <div className="glass-card rounded-2xl p-6 text-center space-y-3">
        <div className="text-2xl">💬</div>
        <h3 className="font-bold text-lg">Не нашли ответ?</h3>
        <p className="text-sm text-muted-foreground">Напишите нам — разберёмся вместе</p>
        <button
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Icon name="MessageCircle" size={15} />
          Написать в поддержку
        </button>
      </div>
    </div>
  );
}
