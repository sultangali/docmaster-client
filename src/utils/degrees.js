

export const DEGREES = {
  'phd_assoc_prof': {
    rus: {
      d1: 'ассоциированный профессор',
      d2: 'ассоц.проф.'
    },
    kaz: {
      d1: 'қауымдастырылған профессор',
      d2: 'қауымд.проф.'
    }
  },
  'candidate_prof': {
    rus: {
      d1: 'кандидат педагогических наук, профессор',
      d2: 'к.п.н., проф.'
    },
    kaz: {
      d1: 'педагогика ғылымдарының кандидаты, профессор',
      d2: 'п.ғ.к., проф.'
    }
  },
  'assoc_prof': {
    rus: {
      d1: 'ассоциированный профессор',
      d2: 'ассоц.проф.'
    },
    kaz: {
      d1: 'қауымдастырылған профессор',
      d2: 'қауымд.проф.'
    }
  },
  'phd': {
    rus: {
      d1: 'PhD',
      d2: 'PhD'
    },
    kaz: {
      d1: 'PhD',
      d2: 'PhD'
    }
  },
  'candidate': {
    rus: {
      d1: 'кандидат педагогических наук',
      d2: 'к.п.н.'
    },
    kaz: {
      d1: 'педагогика ғылымдарының кандидаты',
      d2: 'п.ғ.к.'
    }
  },
  'professor': {
    rus: {
      d1: 'профессор',
      d2: 'проф.'
    },
    kaz: {
      d1: 'профессор',
      d2: 'проф.'
    }
  },
  'doctor': {
    rus: {
      d1: 'доктор педагогических наук',
      d2: 'д.п.н.'
    },
    kaz: {
      d1: 'педагогика ғылымдарының докторы',
      d2: 'п.ғ.д.'
    }
  }
};

/**
 * Получить локализованное название степени
 * @param {string} code - код степени
 * @param {string} language - язык ('Русский' или 'Қазақша')
 * @param {string} template - шаблон отображения ('d1' или 'd2')
 * @returns {string} локализованное название
 */
export const getLocalizedDegreeName = (code, language = 'Русский', template = 'd1') => {
  if (!code || !DEGREES[code]) return code || '';
  
  const languageKey = language === 'Қазақша' ? 'kaz' : 'rus';
  return DEGREES[code][languageKey][template] || code;
};

/**
 * Получить опции для Select компонента
 * @param {string} language - язык отображения
 * @param {string} template - шаблон отображения
 * @returns {Array} массив опций для Select
 */
export const getDegreeSelectOptions = (language = 'Русский', template = 'd1') => {
  return Object.keys(DEGREES).map(code => ({
    value: code,
    label: getLocalizedDegreeName(code, language, template)
  }));
};

/**
 * Форматировать массив степеней в строку
 * @param {Array} degrees - массив кодов степеней
 * @param {string} language - язык отображения
 * @param {string} template - шаблон отображения
 * @returns {string} отформатированная строка степеней
 */
export const formatDegreesArray = (degrees, language = 'Русский', template = 'd2') => {
  if (!degrees || !Array.isArray(degrees) || degrees.length === 0) {
    return '';
  }
  
  return degrees
    .map(code => getLocalizedDegreeName(code, language, template))
    .join(', ');
};

/**
 * Склонение степеней в родительном падеже для русского языка
 * @param {string} degreeText - текст степени в именительном падеже
 * @returns {string} степень в родительном падеже
 */
export const declineDegreeGenitive = (degreeText) => {
  if (!degreeText) return '';
  
  // Правила склонения степеней в родительном падеже
  // ВАЖНО: более специфичные правила должны идти первыми!
  const declensionRules = [
    // Ученые степени с профессорскими званиями (самые специфичные)
    { from: /кандидат педагогических наук, профессор$/, to: 'кандидата педагогических наук, профессора' },
    { from: /кандидат технических наук, профессор$/, to: 'кандидата технических наук, профессора' },
    { from: /кандидат физико-математических наук, профессор$/, to: 'кандидата физико-математических наук, профессора' },
    { from: /доктор педагогических наук, профессор$/, to: 'доктора педагогических наук, профессора' },
    { from: /доктор технических наук, профессор$/, to: 'доктора технических наук, профессора' },
    { from: /доктор физико-математических наук, профессор$/, to: 'доктора физико-математических наук, профессора' },
    
    // Ученые степени с доцентскими званиями
    { from: /кандидат педагогических наук, доцент$/, to: 'кандидата педагогических наук, доцента' },
    { from: /кандидат технических наук, доцент$/, to: 'кандидата технических наук, доцента' },
    { from: /кандидат физико-математических наук, доцент$/, to: 'кандидата физико-математических наук, доцента' },
    
    // Просто ученые степени
    { from: /кандидат педагогических наук$/, to: 'кандидата педагогических наук' },
    { from: /кандидат технических наук$/, to: 'кандидата технических наук' },
    { from: /кандидат физико-математических наук$/, to: 'кандидата физико-математических наук' },
    { from: /доктор педагогических наук$/, to: 'доктора педагогических наук' },
    { from: /доктор технических наук$/, to: 'доктора технических наук' },
    { from: /доктор физико-математических наук$/, to: 'доктора физико-математических наук' },
    
    // Профессора и доценты (менее специфичные)
    { from: /ассоциированный профессор$/, to: 'ассоциированного профессора' },
    { from: /профессор$/, to: 'профессора' },
    { from: /ассоциированный доцент$/, to: 'ассоциированного доцента' },
    { from: /доцент$/, to: 'доцента' },
    
    // Преподаватели
    { from: /старший преподаватель$/, to: 'старшего преподавателя' },
    { from: /преподаватель$/, to: 'преподавателя' },
    
    // PhD остается без изменений
    { from: /^PhD$/, to: 'PhD' }
  ];
  
  // Применяем правила склонения
  for (const rule of declensionRules) {
    if (rule.from.test(degreeText)) {
      return degreeText.replace(rule.from, rule.to);
    }
  }
  
  // Если не нашли подходящее правило, возвращаем как есть
  return degreeText;
};

/**
 * Получить степень руководителя в родительном падеже для заявления
 * @param {Array} degrees - массив кодов степеней
 * @param {string} language - язык отображения
 * @param {string} template - шаблон отображения
 * @returns {string} степень в родительном падеже
 */
export const formatDegreesArrayGenitive = (degrees, language = 'Русский', template = 'd1') => {
  if (!degrees || !Array.isArray(degrees) || degrees.length === 0) {
    return '';
  }
  
  const degreeText = formatDegreesArray(degrees, language, template);
  
  if (language === 'Русский') {
    return declineDegreeGenitive(degreeText);
  }
  
  // Для других языков возвращаем как есть
  return degreeText;
};

/**
 * Утилиты для степеней
 */
export const DegreesUtils = {
  getLocalizedName: getLocalizedDegreeName,
  getSelectOptions: getDegreeSelectOptions,
  formatArray: formatDegreesArray,
  formatArrayGenitive: formatDegreesArrayGenitive,
  declineGenitive: declineDegreeGenitive
};

export default DegreesUtils;
