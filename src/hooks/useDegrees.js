import { useMemo } from 'react';
import { DegreesUtils } from '../utils/degrees';

/**
 * Хук для работы со степенями руководителей
 * @param {string} language - язык отображения ('Русский' или 'Қазақша') 
 * @param {string} template - шаблон отображения ('d1' или 'd2')
 * @returns {Object} объект с функциями для работы со степенями
 */
export const useDegrees = (language = 'Русский', template = 'd1') => {
  const degreeOptions = useMemo(() => {
    return DegreesUtils.getSelectOptions(language, template);
  }, [language, template]);

  const getDisplayName = useMemo(() => {
    return (code, displayTemplate = template) => {
      return DegreesUtils.getLocalizedName(code, language, displayTemplate);
    };
  }, [language, template]);

  const getShortName = useMemo(() => {
    return (code) => {
      return DegreesUtils.getLocalizedName(code, language, 'd2');
    };
  }, [language]);

  const formatArray = useMemo(() => {
    return (degrees, displayTemplate = 'd2') => {
      return DegreesUtils.formatArray(degrees, language, displayTemplate);
    };
  }, [language]);

  return {
    degreeOptions,
    getDisplayName,
    getShortName,
    formatArray
  };
};
