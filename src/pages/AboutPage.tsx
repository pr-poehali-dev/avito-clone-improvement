import Icon from "@/components/ui/icon";

const features = [
  { icon: "Zap", title: "Мгновенная публикация", desc: "Разместите объявление за 2 минуты — заполните форму, добавьте фото и готово", color: "from-amber-500 to-orange-500" },
  { icon: "Shield", title: "Безопасные сделки", desc: "Верификация пользователей, отзывы и рейтинги для вашей защиты", color: "from-emerald-500 to-teal-500" },
  { icon: "Search", title: "Умный поиск", desc: "Фильтры по цене, категории, городу и расстоянию до продавца", color: "from-violet-500 to-purple-600" },
  { icon: "MessageCircle", title: "Встроенный чат", desc: "Общайтесь прямо на сайте — никаких сторонних мессенджеров", color: "from-cyan-500 to-blue-500" },
  { icon: "Bell", title: "Уведомления", desc: "Получайте сообщения о новых объявлениях по вашим запросам", color: "from-pink-500 to-rose-500" },
  { icon: "TrendingUp", title: "Продвижение", desc: "Поднимите объявление в топ для максимального охвата", color: "from-lime-500 to-green-500" },
];

const team = [
  { name: "Роман Сидоров", role: "CEO & Co-founder", avatar: "РС", color: "from-violet-500 to-purple-600" },
  { name: "Анна Козлова", role: "CTO & Co-founder", avatar: "АК", color: "from-cyan-500 to-blue-600" },
  { name: "Игорь Белов", role: "Head of Design", avatar: "ИБ", color: "from-pink-500 to-rose-600" },
  { name: "Юлия Новикова", role: "Head of Marketing", avatar: "ЮН", color: "from-emerald-500 to-teal-600" },
];

export default function AboutPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-5">
          <Icon name="Sparkles" size={14} />
          Основана в 2024
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
          Мы создаём лучшую<br />
          <span className="gradient-text">доску объявлений</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          ОбъявоМаркет — это платформа нового поколения, где удобство, безопасность 
          и скорость стоят на первом месте. Уже более 890 тысяч пользователей 
          доверяют нам каждый день.
        </p>
      </section>

      {/* Mission */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-cyan-600 p-8 sm:p-12 text-white">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-center">
          🎯
        </div>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold mb-4">Наша миссия</h2>
          <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
            Сделать процесс покупки и продажи настолько простым и безопасным, 
            чтобы каждый человек в России мог с лёгкостью избавиться от ненужного 
            или найти то, что давно искал — в своём городе или по всей стране.
          </p>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="font-display text-3xl font-bold text-center mb-8">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className={`glass-card hover-scale rounded-2xl p-6 animate-fade-in delay-${(i + 1) * 100}`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md mb-4`}>
                <Icon name={f.icon} size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/50 rounded-3xl p-8 sm:p-12">
        <h2 className="font-display text-3xl font-bold text-center mb-8">Цифры говорят сами</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "2.4М", label: "Активных объявлений" },
            { value: "890K", label: "Пользователей" },
            { value: "1 200+", label: "Городов России" },
            { value: "4.8★", label: "Средний рейтинг" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-display text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-muted-foreground text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="font-display text-3xl font-bold text-center mb-8">Наша команда</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <div key={member.name} className={`glass-card hover-scale rounded-2xl p-5 text-center animate-fade-in delay-${(i + 1) * 100}`}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-3 shadow-md`}>
                <span className="text-white font-bold font-display">{member.avatar}</span>
              </div>
              <div className="font-semibold text-sm">{member.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="glass-card rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Есть вопросы?</h2>
        <p className="text-muted-foreground mb-6">Мы всегда рады помочь — напишите нам</p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: "Mail", label: "support@obyavomarket.ru" },
            { icon: "Phone", label: "+7 (800) 555-35-35" },
            { icon: "MessageCircle", label: "Telegram @obyavomarket" },
          ].map(contact => (
            <div key={contact.label} className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 rounded-xl text-sm font-medium">
              <Icon name={contact.icon} size={15} className="text-violet-600" />
              {contact.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
