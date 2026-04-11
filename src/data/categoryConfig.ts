// Конфигурация полей формы объявления по категориям

export interface ExtraField {
  key: string;
  label: string;
  type: "select" | "number" | "text";
  options?: string[];
  placeholder?: string;
  unit?: string;
  // показывать только для определённых подкатегорий
  onlySubcats?: string[];
}

export interface CategoryConfig {
  showCondition: boolean;       // показывать Б/У / Новое
  showQuantity: boolean;        // показывать количество
  showMileage: boolean;         // пробег (авто)
  allowPriceFrom: boolean;      // цена «от» (услуги)
  allowFree: boolean;           // бесплатно
  extraFields: ExtraField[];    // доп. поля
}

const DEFAULT: CategoryConfig = {
  showCondition: true,
  showQuantity: false,
  showMileage: false,
  allowPriceFrom: false,
  allowFree: false,
  extraFields: [],
};

export const categoryConfig: Record<string, CategoryConfig> = {

  // ── Электроника ─────────────────────────────────────────────────────────────
  electronics: {
    ...DEFAULT,
    showCondition: true,    // Б/У / Новое — да
    extraFields: [
      { key: "brand",   label: "Бренд",          type: "text",   placeholder: "Apple, Samsung, Sony..." },
      { key: "model",   label: "Модель",          type: "text",   placeholder: "iPhone 15 Pro, Galaxy S24..." },
      { key: "memory",  label: "Память / объём",  type: "text",   placeholder: "128 ГБ, 16 ГБ ОЗУ..." },
      { key: "color",   label: "Цвет",            type: "text",   placeholder: "Чёрный, белый..." },
    ],
  },

  // ── Транспорт ────────────────────────────────────────────────────────────────
  transport: {
    ...DEFAULT,
    showCondition: false,   // заменяем на car_condition
    showQuantity: false,
    showMileage: true,
    extraFields: [
      { key: "brand",    label: "Марка",        type: "text",   placeholder: "Toyota, BMW, Lada...",
        onlySubcats: ["Легковые автомобили", "Грузовики", "Спецтехника", "Автобусы и микроавтобусы"] },
      { key: "model",    label: "Модель",       type: "text",   placeholder: "Camry, X5, Granta..." },
      { key: "year",     label: "Год выпуска",  type: "number", placeholder: "2020" },
      {
        key: "body_type", label: "Тип кузова", type: "select",
        options: ["Седан", "Хэтчбек", "Универсал", "Внедорожник / SUV", "Кроссовер", "Минивэн", "Купе", "Кабриолет", "Пикап", "Фургон", "Лифтбек", "Другой"],
        onlySubcats: ["Легковые автомобили"],
      },
      {
        key: "transmission", label: "Коробка передач", type: "select",
        options: ["Автомат", "Механика", "Робот", "Вариатор"],
      },
      {
        key: "drive", label: "Привод", type: "select",
        options: ["Передний", "Задний", "Полный"],
        onlySubcats: ["Легковые автомобили", "Грузовики", "Спецтехника"],
      },
      {
        key: "fuel", label: "Топливо", type: "select",
        options: ["Бензин", "Дизель", "Газ (LPG)", "Газ (CNG)", "Гибрид", "Электро", "Другое"],
      },
      {
        key: "engine_volume", label: "Объём двигателя, л", type: "text", placeholder: "2.0",
        onlySubcats: ["Легковые автомобили", "Мотоциклы", "Грузовики"],
      },
      {
        key: "engine_power", label: "Мощность, л.с.", type: "number", placeholder: "150",
      },
      {
        key: "car_condition", label: "Состояние", type: "select",
        options: ["Отличное — как новый", "Хорошее — небольшие дефекты", "Удовлетворительное", "Требует ремонта", "На запчасти"],
      },
      {
        key: "pts", label: "ПТС", type: "select",
        options: ["Оригинал", "Дубликат"],
        onlySubcats: ["Легковые автомобили", "Грузовики", "Мотоциклы"],
      },
      {
        key: "owners", label: "Владельцев по ПТС", type: "select",
        options: ["1", "2", "3", "4 и более"],
        onlySubcats: ["Легковые автомобили", "Грузовики", "Мотоциклы"],
      },
      {
        key: "customs", label: "Растаможен", type: "select",
        options: ["Да", "Нет"],
        onlySubcats: ["Легковые автомобили"],
      },
      { key: "color", label: "Цвет", type: "text", placeholder: "Белый, чёрный, серебристый..." },
      {
        key: "vin", label: "VIN / номер рамы", type: "text", placeholder: "Идентификационный номер",
        onlySubcats: ["Легковые автомобили", "Мотоциклы"],
      },
    ],
  },

  // ── Недвижимость ─────────────────────────────────────────────────────────────
  realty: {
    ...DEFAULT,
    showCondition: false,   // нет понятия Б/У для жилья
    showQuantity: false,
    allowPriceFrom: false,
    extraFields: [
      { key: "area",           label: "Площадь, м²",         type: "number",  placeholder: "54" },
      { key: "rooms",          label: "Комнат",               type: "select",  options: ["Студия", "1", "2", "3", "4", "5+"] },
      { key: "floor",          label: "Этаж",                 type: "number",  placeholder: "5" },
      { key: "floors_total",   label: "Этажей в доме",        type: "number",  placeholder: "9" },
      {
        key: "building_type",  label: "Тип дома", type: "select",
        options: ["Панельный", "Кирпичный", "Монолитный", "Деревянный", "Блочный"],
      },
      {
        key: "repair",         label: "Ремонт", type: "select",
        options: ["Без ремонта", "Требует ремонта", "Косметический", "Евроремонт", "Дизайнерский", "Чёрновая отделка"],
      },
      {
        key: "deal_type",      label: "Тип сделки", type: "select",
        options: ["Прямая продажа", "Ипотека", "Субсидия", "Аренда долгосрочная", "Аренда посуточная"],
      },
      {
        key: "balcony",        label: "Балкон / лоджия", type: "select",
        options: ["Есть", "Нет"],
      },
    ],
  },

  // ── Одежда и обувь ───────────────────────────────────────────────────────────
  clothes: {
    ...DEFAULT,
    showCondition: true,    // Б/У / Новое — да, одежда бывает с рук
    extraFields: [
      {
        key: "size", label: "Размер", type: "select",
        options: ["XS (42)", "S (44)", "M (46)", "L (48)", "XL (50)", "XXL (52)", "XXXL (54)", "4XL (56)", "5XL (58)", "Другой"],
      },
      { key: "brand", label: "Бренд",  type: "text",   placeholder: "Nike, Zara, H&M, Gucci..." },
      { key: "color", label: "Цвет",   type: "text",   placeholder: "Чёрный, синий, бежевый..." },
      {
        key: "gender", label: "Для кого", type: "select",
        options: ["Женщинам", "Мужчинам", "Девочкам", "Мальчикам", "Унисекс"],
      },
      {
        key: "season", label: "Сезон", type: "select",
        options: ["Весна / осень", "Лето", "Зима", "Всесезонное"],
      },
    ],
  },

  // ── Дом и сад ────────────────────────────────────────────────────────────────
  home: {
    ...DEFAULT,
    showCondition: true,    // мебель и техника бывает б/у
    extraFields: [
      { key: "brand",      label: "Бренд / производитель",  type: "text",   placeholder: "IKEA, Bosch, Samsung..." },
      { key: "material",   label: "Материал",               type: "text",   placeholder: "Дерево, металл, ткань..." },
      { key: "dimensions", label: "Размеры (ДxШxВ), см",    type: "text",   placeholder: "200x90x75" },
      { key: "color",      label: "Цвет",                   type: "text",   placeholder: "Белый, дуб, венге..." },
    ],
  },

  // ── Спорт и отдых ────────────────────────────────────────────────────────────
  sport: {
    ...DEFAULT,
    showCondition: true,    // б/у велосипеды, тренажёры — да
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "Adidas, Trek, Fischer, Head..." },
      { key: "size",  label: "Размер", type: "text", placeholder: "L, 52, 180 см, M..." },
    ],
  },

  // ── Красота и здоровье ───────────────────────────────────────────────────────
  // Смешанная категория: товары (косметика, лекарства) — Б/У неуместно,
  // услуги (массаж, маникюр) — тоже нет Б/У. Оставляем showCondition: false.
  beauty: {
    ...DEFAULT,
    showCondition: false,   // косметика и услуги — нет Б/У
    showQuantity: false,
    allowPriceFrom: true,   // услуги красоты могут иметь "цену от"
    extraFields: [
      { key: "brand",   label: "Бренд",          type: "text", placeholder: "L'Oreal, Nivea, Chanel..." },
      { key: "volume",  label: "Объём / вес",    type: "text", placeholder: "50 мл, 100 г..." },
      {
        key: "experience", label: "Опыт (для услуг)", type: "select",
        options: ["До 1 года", "1–3 года", "3–5 лет", "5–10 лет", "Более 10 лет"],
      },
      {
        key: "visit_type", label: "Приём (для услуг)", type: "select",
        options: ["На дому у мастера", "Выезд на дом", "Оба варианта"],
      },
    ],
  },

  // ── Детские товары ───────────────────────────────────────────────────────────
  kids: {
    ...DEFAULT,
    showCondition: true,    // детские вещи часто продают б/у
    extraFields: [
      { key: "brand", label: "Бренд",              type: "text",   placeholder: "LEGO, Kinderkraft, Cybex..." },
      {
        key: "age",   label: "Возраст ребёнка",    type: "select",
        options: ["0–6 месяцев", "6–12 месяцев", "1–3 года", "3–7 лет", "7–12 лет", "12+ лет"],
      },
      { key: "size",  label: "Размер",             type: "text",   placeholder: "80, 92, 104, 116..." },
      {
        key: "gender_kids", label: "Для кого",     type: "select",
        options: ["Для мальчика", "Для девочки", "Унисекс"],
      },
    ],
  },

  // ── Животные ─────────────────────────────────────────────────────────────────
  animals: {
    showCondition: false,   // нет Б/У для живых существ
    showQuantity: false,
    showMileage: false,
    allowPriceFrom: false,
    allowFree: true,        // отдам бесплатно — да
    extraFields: [
      {
        key: "ad_type", label: "Тип объявления", type: "select",
        options: ["Продаю", "Отдаю даром", "Ищу / возьму"],
      },
      { key: "breed",  label: "Порода",          type: "text",   placeholder: "Лабрадор, Мейн-кун, Корнеш-рекс..." },
      { key: "age_animal", label: "Возраст",     type: "text",   placeholder: "2 месяца, 1 год, 3 года..." },
      {
        key: "gender_animal", label: "Пол",      type: "select",
        options: ["Мальчик", "Девочка", "Неизвестно"],
      },
      {
        key: "vaccinated", label: "Прививки",    type: "select",
        options: ["Есть (по возрасту)", "Нет", "Частично"],
      },
      {
        key: "sterilized", label: "Стерилизован / кастрирован", type: "select",
        options: ["Да", "Нет"],
      },
      {
        key: "pedigree", label: "Документы / родословная", type: "select",
        options: ["Есть", "Нет"],
      },
      {
        key: "animal_condition", label: "Состояние здоровья", type: "select",
        options: ["Здоровый", "На лечении", "Особые потребности"],
      },
    ],
  },

  // ── Услуги ───────────────────────────────────────────────────────────────────
  services: {
    showCondition: false,   // услуга — не вещь, нет Б/У
    showQuantity: false,
    showMileage: false,
    allowPriceFrom: true,   // "от 500 ₽/час" — да
    allowFree: false,
    extraFields: [
      {
        key: "experience", label: "Опыт работы", type: "select",
        options: ["Без опыта", "До 1 года", "1–3 года", "3–5 лет", "5–10 лет", "Более 10 лет"],
      },
      {
        key: "schedule", label: "График", type: "select",
        options: ["По будням", "По выходным", "Ежедневно", "По договорённости"],
      },
      {
        key: "remote", label: "Формат работы", type: "select",
        options: ["На месте у клиента", "У себя (в мастерской)", "Дистанционно", "Любой формат"],
      },
      {
        key: "price_unit", label: "Единица цены", type: "select",
        options: ["За час", "За день", "За объект", "За м²", "Договорная"],
      },
      {
        key: "payment", label: "Способ оплаты", type: "select",
        options: ["Наличные", "Перевод на карту", "Любой способ"],
      },
    ],
  },

  // ── Хобби и досуг ────────────────────────────────────────────────────────────
  hobby: {
    ...DEFAULT,
    showCondition: true,    // книги, инструменты — б/у нормально
    extraFields: [
      { key: "brand",      label: "Бренд / издательство", type: "text",   placeholder: "Gibson, LEGO, Fender, АСТ..." },
      { key: "year_made",  label: "Год выпуска / издания", type: "number", placeholder: "2015" },
      { key: "author",     label: "Автор (для книг)",      type: "text",   placeholder: "Толстой, King, Пелевин..." },
    ],
  },

  // ── Продукты питания ─────────────────────────────────────────────────────────
  food: {
    showCondition: false,   // еда не бывает Б/У
    showQuantity: true,     // количество — важно
    showMileage: false,
    allowPriceFrom: false,
    allowFree: false,
    extraFields: [
      { key: "weight",  label: "Вес / объём",    type: "text",   placeholder: "1 кг, 500 г, 1 л..." },
      {
        key: "origin",  label: "Происхождение",  type: "select",
        options: ["Домашнее / личное хозяйство", "Фермерское", "Промышленное"],
      },
      {
        key: "freshness", label: "Срок годности", type: "select",
        options: ["Свежее (сегодня)", "До 3 дней", "До недели", "До месяца", "Длительного хранения"],
      },
    ],
  },
};

export function getCategoryConfig(categoryId: string): CategoryConfig {
  return categoryConfig[categoryId] || {
    ...DEFAULT,
    extraFields: [],
  };
}

// Получить человекочитаемое название поля extras по ключу
export function getExtraFieldLabel(categoryId: string, fieldKey: string): string {
  const cfg = getCategoryConfig(categoryId);
  const field = cfg.extraFields.find(f => f.key === fieldKey);
  return field?.label || fieldKey;
}
