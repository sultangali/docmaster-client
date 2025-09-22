/**
 * Утилиты для форматирования образовательных программ в заявлениях
 * Разделяет длинные названия ОП на две строки для лучшего отображения
 */

/**
 * Разделить название ОП на две строки
 * Ищет подходящее место для переноса (обычно перед "и технологии" или аналогичными фразами)
 * @param {string} opText - полное название ОП
 * @returns {object} объект с первой и второй строкой
 */
export const splitOPText = (opText) => {
  if (!opText) return { firstLine: '', secondLine: '' };
  
  // Паттерны для поиска места переноса (ищем ПЕРЕД этими фразами)
  const splitPatterns = [
    { pattern: / и технологии/, splitBefore: true },
    { pattern: / және технологиялар/, splitBefore: true },
    { pattern: / и технологии»/, splitBefore: true },
    { pattern: / және технологиялар»/, splitBefore: true },
    { pattern: / и /, splitBefore: true },
    { pattern: / және /, splitBefore: true },
    { pattern: / - /, splitBefore: false },
    { pattern: / – /, splitBefore: false },
    { pattern: / — /, splitBefore: false }
  ];
  
  // Ищем подходящее место для переноса
  for (const { pattern, splitBefore } of splitPatterns) {
    const match = opText.match(pattern);
    if (match) {
      let splitIndex;
      if (splitBefore) {
        // Разделяем ПЕРЕД найденной фразой
        splitIndex = match.index;
      } else {
        // Разделяем ПОСЛЕ найденной фразы (для тире)
        splitIndex = match.index + match[0].length;
      }
      
      return {
        firstLine: opText.substring(0, splitIndex).trim(),
        secondLine: opText.substring(splitIndex).trim()
      };
    }
  }
  
  // Если не нашли подходящее место, делим пополам
  const midPoint = Math.floor(opText.length / 2);
  const spaceIndex = opText.lastIndexOf(' ', midPoint);
  const splitIndex = spaceIndex > 0 ? spaceIndex : midPoint;
  
  return {
    firstLine: opText.substring(0, splitIndex).trim(),
    secondLine: opText.substring(splitIndex).trim()
  };
};

/**
 * Форматировать ОП для отображения в заявлении
 * @param {string} opText - полное название ОП
 * @param {string} language - язык ('Қазақша' или 'Русский')
 * @returns {object} объект с отформатированными строками
 */
export const formatOPForApplication = (opText, language = 'Русский') => {
  const { firstLine, secondLine } = splitOPText(opText);
  
  return {
    firstLine,
    secondLine,
    hasSecondLine: secondLine.length > 0,
    fullText: opText
  };
};

/**
 * Создать JSX элемент для отображения ОП в заявлении
 * @param {string} opText - полное название ОП
 * @param {string} language - язык
 * @returns {JSX.Element} отформатированный элемент
 */
export const createOPDisplayElement = (opText, language = 'Русский') => {
  const formatted = formatOPForApplication(opText, language);
  
  if (!formatted.hasSecondLine) {
    // Если не нужно разделять, возвращаем как есть
    return <span>{opText}</span>;
  }
  
  // Возвращаем с переносом строки
  return (
    <span>
      {formatted.firstLine}
      <br />
      {formatted.secondLine}
    </span>
  );
};

/**
 * Утилиты для форматирования ОП
 */
export const OPFormatter = {
  splitOPText,
  formatOPForApplication,
  createOPDisplayElement
};

export default OPFormatter;
