import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

export const RUSSIAN_CITIES = [
  "Все города",
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Краснодар",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Ижевск",
  "Барнаул",
  "Ульяновск",
  "Иркутск",
  "Хабаровск",
  "Ярославль",
  "Владивосток",
  "Махачкала",
  "Томск",
  "Оренбург",
  "Кемерово",
  "Новокузнецк",
  "Рязань",
  "Астрахань",
  "Набережные Челны",
  "Пенза",
  "Липецк",
  "Тула",
  "Киров",
  "Чебоксары",
  "Калининград",
  "Брянск",
  "Курск",
  "Иваново",
  "Магнитогорск",
  "Тверь",
  "Ставрополь",
  "Белгород",
  "Сочи",
  "Нижний Тагил",
  "Архангельск",
  "Владимир",
  "Севастополь",
  "Симферополь",
  "Сургут",
  "Улан-Удэ",
  "Смоленск",
  "Вологда",
  "Чита",
  "Саранск",
  "Калуга",
  "Орёл",
  "Якутск",
  "Череповец",
  "Владикавказ",
  "Мурманск",
  "Грозный",
  "Тамбов",
  "Нальчик",
  "Стерлитамак",
  "Нижневартовск",
  "Петрозаводск",
  "Кострома",
  "Новороссийск",
  "Йошкар-Ола",
  "Таганрог",
  "Комсомольск-на-Амуре",
  "Сыктывкар",
  "Балашиха",
  "Химки",
  "Подольск",
  "Нижнекамск",
  "Шахты",
  "Дзержинск",
  "Орск",
  "Братск",
  "Армавир",
  "Благовещенск",
  "Волжский",
  "Красногорск",
  "Люберцы",
  "Мытищи",
  "Щёлково",
  "Одинцово",
  "Королёв",
  "Электросталь",
  "Серпухов",
  "Коломна",
  "Пушкино",
  "Ногинск",
  "Жуковский",
  "Реутов",
  "Долгопрудный",
  "Домодедово",
  "Фрязино",
  "Ивантеевка",
  "Лобня",
  "Дубна",
  "Раменское",
  "Железнодорожный",
  "Видное",
  "Дмитров",
  "Клин",
  "Солнечногорск",
  "Воскресенск",
  "Обнинск",
  "Рыбинск",
  "Великий Новгород",
  "Псков",
  "Петропавловск-Камчатский",
  "Южно-Сахалинск",
  "Магадан",
  "Анадырь",
  "Нарьян-Мар",
  "Салехард",
  "Ханты-Мансийск",
  "Ухта",
  "Воркута",
  "Норильск",
  "Находка",
  "Уссурийск",
  "Арсеньев",
  "Биробиджан",
  "Зея",
  "Тында",
  "Белогорск",
  "Свободный",
  "Хасавюрт",
  "Дербент",
  "Каспийск",
  "Кизляр",
  "Буйнакск",
  "Черкесск",
  "Карачаевск",
  "Майкоп",
  "Элиста",
  "Назрань",
  "Магас",
  "Сунжа",
  "Гудермес",
  "Аргун",
  "Беслан",
  "Моздок",
  "Прохладный",
  "Пятигорск",
  "Кисловодск",
  "Ессентуки",
  "Минеральные Воды",
  "Невинномысск",
  "Михайловск",
  "Лермонтов",
  "Георгиевск",
  "Будённовск",
];

interface CitySelectProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function CitySelect({ value, onChange, placeholder = "Выберите город", compact = false }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? RUSSIAN_CITIES.filter(c =>
        c !== "Все города" &&
        c.toLowerCase().includes(search.toLowerCase())
      )
    : RUSSIAN_CITIES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setSearch("");
  };

  const display = value || placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 ${compact ? "max-w-28" : "w-full border border-border rounded-xl px-4 py-2.5 bg-white"} text-sm font-medium text-foreground outline-none`}
      >
        {!compact && <Icon name="MapPin" size={15} className="text-violet-500 shrink-0" />}
        <span className={`truncate ${!value ? "text-muted-foreground" : ""}`}>{display}</span>
        <Icon name="ChevronDown" size={13} className="text-muted-foreground shrink-0 ml-auto" />
      </button>

      {open && (
        <div className="absolute z-[100] top-full mt-1 left-0 w-64 bg-white rounded-2xl shadow-xl border border-border/60 overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-border/40">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl">
              <Icon name="Search" size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск города..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">Город не найден</div>
            ) : (
              filtered.map((city, idx) => (
                <button
                  key={`${city}-${idx}`}
                  type="button"
                  onClick={() => select(city)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-violet-50 transition-colors ${
                    value === city ? "text-violet-600 font-semibold bg-violet-50/60" : "text-foreground"
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}