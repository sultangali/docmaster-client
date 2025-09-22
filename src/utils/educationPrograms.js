// Централизованный справочник образовательных программ с многоязычностью

export const EDUCATION_PROGRAMS = {
  // Магистратура
  magistrants: {
    '7M01503': {
      code: '7M01503',
      kaz: {
        t1: "«7M01503 - Информатика»",
        t2: "«7M01503» - Информатика",
        short: "Информатика"
      },
      rus: {
        t1: "«7M01503 - Информатика»", 
        t2: "«7M01503» - Информатика",
        short: "Информатика"
      }
    },
    '7M06101': {
      code: '7M06101',
      kaz: {
        t1: "«7M06101 - Ақпараттық жүйелер және технологиялар»",
        t2: "«7M06101» - Ақпараттық жүйелер және технологиялар", 
        short: "Ақпараттық жүйелер және технологиялар"
      },
      rus: {
        t1: "«7M06101 - Информационные системы и технологии»",
        t2: "«7M06101» - Информационные системы и технологии",
        short: "Информационные системы и технологии"
      }
    },
    '7M06104': {
      code: '7M06104', 
      kaz: {
        t1: "«7M06104 - Ақпараттық жүйелер және технологиялар»",
        t2: "«7M06104» - Ақпараттық жүйелер және технологиялар",
        short: "Ақпараттық жүйелер және технологиялар"
      },
      rus: {
        t1: "«7M06104 - Информационные системы и технологии»",
        t2: "«7M06104» - Информационные системы и технологии", 
        short: "Информационные системы и технологии"
      }
    }
  },
  
  // Докторантура
  doctorants: {
    '8D01103': {
      code: '8D01103',
      kaz: {
        t1: "«8D01103 - Сандық педагогика»",
        t2: "«8D01103» - Сандық педагогика",
        short: "Сандық педагогика"
      },
      rus: {
        t1: "«8D01103 - Цифровая педагогика»", 
        t2: "«8D01103» - Цифровая педагогика",
        short: "Цифровая педагогика"
      }
    },

  }
};

// Утилиты для работы с ОП
export const EducationUtils = {
  // Получить все ОП для роли
  getProgramsByRole: (role) => {
    return EDUCATION_PROGRAMS[role] || {};
  },

  // Получить ОП по коду
  getProgramByCode: (code, role = null) => {
    if (role && EDUCATION_PROGRAMS[role]) {
      return EDUCATION_PROGRAMS[role][code];
    }
    
    // Поиск по всем ролям
    for (const roleKey in EDUCATION_PROGRAMS) {
      if (EDUCATION_PROGRAMS[roleKey][code]) {
        return EDUCATION_PROGRAMS[roleKey][code];
      }
    }
    return null;
  },

  // Получить локализованное название
  getLocalizedName: (code, language = 'Русский', template = 't1', role = null) => {
    const program = EducationUtils.getProgramByCode(code, role);
    if (!program) return code;
    
    const lang = language === 'Қазақша' ? 'kaz' : 'rus';
    return program[lang][template] || program[lang].t1 || code;
  },

  // Получить варианты для Select компонента
  getSelectOptions: (role, language = 'Русский', template = 't1') => {
    const programs = EducationUtils.getProgramsByRole(role);
    return Object.keys(programs).map(code => ({
      value: code,
      label: EducationUtils.getLocalizedName(code, language, template, role),
      program: programs[code]
    }));
  },

  // Получить все поддерживаемые ОП для валидации
  getAllSupportedCodes: () => {
    const codes = [];
    Object.values(EDUCATION_PROGRAMS).forEach(rolePrograms => {
      codes.push(...Object.keys(rolePrograms));
    });
    return [...new Set(codes)]; // убираем дубликаты
  },

  // Проверить валидность ОП для роли
  isValidProgramForRole: (code, role) => {
    return !!EDUCATION_PROGRAMS[role]?.[code];
  }
};

export default EducationUtils;
