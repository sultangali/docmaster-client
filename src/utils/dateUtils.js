/**
 * Утилиты для работы с датами в заявлениях
 * Поддерживает локализацию на казахский и русский языки
 */

/**
 * Названия месяцев на казахском языке
 */
const KAZAKH_MONTHS = {
  0: 'қаңтар',     // январь
  1: 'ақпан',      // февраль  
  2: 'наурыз',     // март
  3: 'сәуір',      // апрель
  4: 'мамыр',      // май
  5: 'маусым',     // июнь
  6: 'шілде',      // июль
  7: 'тамыз',      // август
  8: 'қыркүйек',   // сентябрь
  9: 'қазан',      // октябрь
  10: 'қараша',    // ноябрь
  11: 'желтоқсан'  // декабрь
};

/**
 * Названия месяцев на русском языке (в родительном падеже)
 */
const RUSSIAN_MONTHS = {
  0: 'января',
  1: 'февраля',
  2: 'марта',
  3: 'апреля',
  4: 'мая',
  5: 'июня',
  6: 'июля',
  7: 'августа',
  8: 'сентября',
  9: 'октября',
  10: 'ноября',
  11: 'декабря'
};

/**
 * Получить текущую дату в формате для заявления
 * @param {string} language - язык ('Қазақша' или 'Русский')
 * @returns {string} отформатированная дата
 */
export const getCurrentDateForApplication = (language = 'Русский') => {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  
  if (language === 'Қазақша') {
    const kazakhMonth = KAZAKH_MONTHS[month];
    return `«${day}» ${kazakhMonth} ${year} ж.`;
  } else {
    const russianMonth = RUSSIAN_MONTHS[month];
    return `«${day}» ${russianMonth} ${year} г.`;
  }
};

/**
 * Получить только название месяца на нужном языке
 * @param {string} language - язык ('Қазақша' или 'Русский')
 * @param {number} monthIndex - индекс месяца (0-11), по умолчанию текущий
 * @returns {string} название месяца
 */
export const getMonthName = (language = 'Русский', monthIndex = null) => {
  const month = monthIndex !== null ? monthIndex : new Date().getMonth();
  
  if (language === 'Қазақша') {
    return KAZAKH_MONTHS[month];
  } else {
    return RUSSIAN_MONTHS[month];
  }
};

/**
 * Получить текущий день месяца
 * @returns {number} день месяца
 */
export const getCurrentDay = () => {
  return new Date().getDate();
};

/**
 * Получить текущий год
 * @returns {number} год
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

/**
 * Утилиты для работы с датами
 */
export const DateUtils = {
  getCurrentDateForApplication,
  getMonthName,
  getCurrentDay,
  getCurrentYear,
  KAZAKH_MONTHS,
  RUSSIAN_MONTHS
};

export default DateUtils;
