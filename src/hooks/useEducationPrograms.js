import { useMemo } from 'react';
import { EducationUtils } from '../utils/educationPrograms';

// Хук для работы с образовательными программами
export const useEducationPrograms = (userRole = null, userLanguage = 'Русский') => {
  
  const programOptions = useMemo(() => {
    if (!userRole) return [];
    return EducationUtils.getSelectOptions(userRole, userLanguage, 't1');
  }, [userRole, userLanguage]);

  const getDisplayName = useMemo(() => {
    return (code, template = 't2') => {
      if (!code) return '';
      return EducationUtils.getLocalizedName(code, userLanguage, template, userRole);
    };
  }, [userLanguage, userRole]);

  const getShortName = useMemo(() => {
    return (code) => {
      if (!code) return '';
      const program = EducationUtils.getProgramByCode(code, userRole);
      if (!program) return code;
      
      const lang = userLanguage === 'Қазақша' ? 'kaz' : 'rus';
      return program[lang].short || program[lang].t2 || code;
    };
  }, [userLanguage, userRole]);

  const isValidProgram = useMemo(() => {
    return (code) => {
      if (!userRole || !code) return false;
      return EducationUtils.isValidProgramForRole(code, userRole);
    };
  }, [userRole]);

  return {
    programOptions,
    getDisplayName,
    getShortName,
    isValidProgram,
    utils: EducationUtils
  };
};

export default useEducationPrograms;
