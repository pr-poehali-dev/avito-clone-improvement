// Конфигурация полей формы объявления по категориям

export interface ExtraField {
  key: string;
  label: string;
  type: "select" | "number" | "text";
  options?: string[];
  placeholder?: string;
  unit?: string;
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
  showQuantity: true,
  showMileage: false,
  allowPriceFrom: false,
  allowFree: false,
  extraFields: [],
};

export const categoryConfig: Record<string, CategoryConfig> = {
  electronics: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "Apple, Samsung, Sony..." },
      { key: "memory", label: "Память / объём", type: "text", placeholder: "128 ГБ, 16 ГБ ОЗУ..." },
      { key: "color", label: "Цвет", type: "text", placeholder: "Чёрный, белый..." },
    ],
  },

  transport: {
    ...DEFAULT,
    showCondition: false,
    showQuantity: false,
    showMileage: true,
    extraFields: [
      { key: "brand", label: "Марка", type: "text", placeholder: "Toyota, BMW, Lada..." },
      { key: "model", label: "Модель", type: "text", placeholder: "Camry, X5, Granta..." },
      { key: "year", label: "Год выпуска", type: "number", placeholder: "2020" },
      {
        key: "body_type",
        label: "Тип кузова",
        type: "select",
        options: ["Седан", "Хэтчбек", "Универсал", "Внедорожник", "Кроссовер", "Минивэн", "Купе", "Кабриолет", "Пикап", "Фургон", "Другой"],
      },
      {
        key: "transmission",
        label: "Коробка передач",
        type: "select",
        options: ["Автомат", "Механика", "Робот", "Вариатор"],
      },
      {
        key: "drive",
        label: "Привод",
        type: "select",
        options: ["Передний", "Задний", "Полный"],
      },
      {
        key: "fuel",
        label: "Топливо",
        type: "select",
        options: ["Бензин", "Дизель", "Газ", "Гибрид", "Электро"],
      },
      {
        key: "engine_volume",
        label: "Объём двигателя, л",
        type: "text",
        placeholder: "2.0",
      },
      {
        key: "car_condition",
        label: "Состояние",
        type: "select",
        options: ["Отличное", "Хорошее", "Удовлетворительное", "Требует ремонта", "На запчасти"],
      },
      { key: "color", label: "Цвет", type: "text", placeholder: "Белый, чёрный, серебристый..." },
      {
        key: "owners",
        label: "Владельцев по ПТС",
        type: "select",
        options: ["1", "2", "3", "4 и более"],
      },
      {
        key: "vin",
        label: "VIN",
        type: "text",
        placeholder: "Идентификационный номер",
      },
    ],
  },

  realty: {
    ...DEFAULT,
    showCondition: false,
    showQuantity: false,
    allowPriceFrom: false,
    extraFields: [
      { key: "area", label: "Площадь, м²", type: "number", placeholder: "54" },
      { key: "rooms", label: "Количество комнат", type: "select", options: ["Студия", "1", "2", "3", "4", "5+"] },
      { key: "floor", label: "Этаж", type: "number", placeholder: "5" },
      { key: "floors_total", label: "Этажей в доме", type: "number", placeholder: "9" },
      {
        key: "building_type",
        label: "Тип дома",
        type: "select",
        options: ["Панельный", "Кирпичный", "Монолитный", "Деревянный", "Блочный"],
      },
      {
        key: "repair",
        label: "Ремонт",
        type: "select",
        options: ["Без ремонта", "Косметический", "Евроремонт", "Дизайнерский"],
      },
    ],
  },

  clothes: {
    ...DEFAULT,
    extraFields: [
      {
        key: "size",
        label: "Размер",
        type: "select",
        options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Другой"],
      },
      { key: "brand", label: "Бренд", type: "text", placeholder: "Nike, Zara, H&M..." },
      { key: "color", label: "Цвет", type: "text", placeholder: "Чёрный, синий..." },
      {
        key: "gender",
        label: "Для кого",
        type: "select",
        options: ["Женщинам", "Мужчинам", "Детям", "Унисекс"],
      },
    ],
  },

  home: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд / производитель", type: "text", placeholder: "IKEA, Bosch..." },
      { key: "material", label: "Материал", type: "text", placeholder: "Дерево, металл, ткань..." },
      { key: "dimensions", label: "Размеры (ДxШxВ), см", type: "text", placeholder: "200x90x75" },
      { key: "color", label: "Цвет", type: "text", placeholder: "Белый, дуб..." },
    ],
  },

  sport: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "Adidas, Trek, Fischer..." },
      { key: "size", label: "Размер", type: "text", placeholder: "L, 52, 180 см..." },
    ],
  },

  beauty: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "L'Oreal, Nivea..." },
      { key: "volume", label: "Объём / вес", type: "text", placeholder: "50 мл, 100 г..." },
    ],
  },

  kids: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "LEGO, Kinderkraft..." },
      { key: "age", label: "Возраст ребёнка", type: "select", options: ["0–1 год", "1–3 года", "3–7 лет", "7–12 лет", "12+ лет"] },
      { key: "size", label: "Размер", type: "text", placeholder: "80, 92, 104..." },
    ],
  },

  animals: {
    showCondition: false,   // нет Б/У для животных
    showQuantity: false,
    showMileage: false,
    allowPriceFrom: false,
    allowFree: true,        // можно отдать бесплатно
    extraFields: [
      { key: "breed", label: "Порода", type: "text", placeholder: "Лабрадор, Мейн-кун..." },
      { key: "age_animal", label: "Возраст", type: "text", placeholder: "2 месяца, 1 год..." },
      {
        key: "gender_animal",
        label: "Пол",
        type: "select",
        options: ["Мальчик", "Девочка", "Неизвестно"],
      },
      {
        key: "vaccinated",
        label: "Прививки",
        type: "select",
        options: ["Есть", "Нет", "Частично"],
      },
      {
        key: "pedigree",
        label: "Документы",
        type: "select",
        options: ["Есть", "Нет"],
      },
    ],
  },

  services: {
    showCondition: false,   // нет Б/У для услуг
    showQuantity: false,
    showMileage: false,
    allowPriceFrom: true,   // цена «от»
    allowFree: false,
    extraFields: [
      {
        key: "experience",
        label: "Опыт работы",
        type: "select",
        options: ["Менее 1 года", "1–3 года", "3–5 лет", "5–10 лет", "Более 10 лет"],
      },
      {
        key: "schedule",
        label: "График работы",
        type: "select",
        options: ["По будням", "По выходным", "Ежедневно", "Гибкий"],
      },
      {
        key: "remote",
        label: "Формат",
        type: "select",
        options: ["На месте", "Дистанционно", "Оба варианта"],
      },
    ],
  },

  hobby: {
    ...DEFAULT,
    extraFields: [
      { key: "brand", label: "Бренд", type: "text", placeholder: "Gibson, LEGO, Fender..." },
      { key: "year_made", label: "Год выпуска", type: "number", placeholder: "2015" },
    ],
  },

  food: {
    showCondition: false,   // нет Б/У для еды
    showQuantity: true,
    showMileage: false,
    allowPriceFrom: false,
    allowFree: false,
    extraFields: [
      { key: "weight", label: "Вес / объём", type: "text", placeholder: "1 кг, 500 г, 1 л..." },
      {
        key: "origin",
        label: "Происхождение",
        type: "select",
        options: ["Домашнее", "Фермерское", "Промышленное"],
      },
    ],
  },
};

export function getCategoryConfig(categoryId: string): CategoryConfig {
  return categoryConfig[categoryId] || DEFAULT;
}

// Получить человекочитаемое название поля extras по ключу
export function getExtraFieldLabel(categoryId: string, fieldKey: string): string {
  const cfg = getCategoryConfig(categoryId);
  const field = cfg.extraFields.find(f => f.key === fieldKey);
  return field?.label || fieldKey;
}