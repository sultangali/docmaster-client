/**
 * Утилиты для грамматических склонений имен в заявлениях
 * Поддерживает казахский и русский языки
 */

/**
 * Склонение отчества в казахском языке для исходительного падежа (кімнен?)
 * Используется для имени студента в заявлении
 * @param {string} patronymic - отчество
 * @returns {string} склоненное отчество в исходительном падеже
 */
export const declineKazakhPatronymicAblative = (patronymic) => {
  if (!patronymic) return '';
  
  const trimmed = patronymic.trim();
  
  // Правила склонения для исходительного падежа
  if (trimmed.endsWith('ұлы')) {
    return trimmed + 'нан'; // Кайсарұлы → Кайсарұлынан
  }
  if (trimmed.endsWith('қызы')) {
    return trimmed + 'нан'; // Айгерімқызы → Айгерімқызынан
  }
  if (trimmed.endsWith('ович')) {
    return trimmed + 'тан'; // Шахманович → Шахмановичтан
  }
  if (trimmed.endsWith('овна')) {
    return trimmed + 'дан'; // Ивановна → Ивановнадан
  }
  if (trimmed.endsWith('евич')) {
    return trimmed + 'тан'; // Сергеевич → Сергеевичтан
  }
  if (trimmed.endsWith('евна')) {
    return trimmed + 'дан'; // Сергеевна → Сергеевнадан
  }
  if (trimmed.endsWith('ич')) {
    return trimmed + 'тан'; // Игнатьевич → Игнатьевичтан
  }
  if (trimmed.endsWith('на')) {
    return trimmed + 'дан'; // Павловна → Павловнадан
  }
  
  // Если не подходит под стандартные правила, возвращаем как есть
  return trimmed;
};

/**
 * Склонение отчества в казахском языке для фразы "бекітуін сұраймын"
 * @param {string} patronymic - отчество
 * @returns {string} склоненное отчество
 */
export const declineKazakhPatronymic = (patronymic) => {
  if (!patronymic) return '';
  
  const trimmed = patronymic.trim();
  
  // Правила склонения для казахского языка
  if (trimmed.endsWith('ұлы')) {
    return trimmed + 'н'; // Кайсарұлы → Кайсарұлын
  }
  if (trimmed.endsWith('қызы')) {
    return trimmed + 'н'; // Айгерімқызы → Айгерімқызын
  }
  if (trimmed.endsWith('ович')) {
    return trimmed + 'ты'; // Шахманович → Шахмановичты
  }
  if (trimmed.endsWith('овна')) {
    return trimmed + 'ны'; // Ивановна → Ивановнаны
  }
  if (trimmed.endsWith('евич')) {
    return trimmed + 'ты'; // Сергеевич → Сергеевичты
  }
  if (trimmed.endsWith('евна')) {
    return trimmed + 'ны'; // Сергеевна → Сергеевнаны
  }
  if (trimmed.endsWith('ич')) {
    return trimmed + 'ты'; // Игнатьевич → Игнатьевичты
  }
  if (trimmed.endsWith('на')) {
    return trimmed + 'ны'; // Павловна → Павловнаны
  }
  
  // Если не подходит под стандартные правила, возвращаем как есть
  return trimmed;
};

/**
 * Склонение ФИО в русском языке в винительный падеж
 * @param {string} lastname - фамилия
 * @param {string} firstname - имя
 * @param {string} patronymic - отчество
 * @returns {string} склоненное ФИО
 */
export const declineRussianName = (lastname, firstname, patronymic) => {
  if (!lastname || !firstname) return '';
  
  let declinedLastname = lastname;
  let declinedFirstname = firstname;
  let declinedPatronymic = patronymic || '';
  
  // Склонение фамилий
  if (lastname.endsWith('ов') || lastname.endsWith('ев')) {
    declinedLastname = lastname + 'а'; // Иванов → Иванова
  } else if (lastname.endsWith('ский') || lastname.endsWith('цкий')) {
    declinedLastname = lastname.replace(/ий$/, 'ого'); // Невский → Невского
  } else if (lastname.endsWith('ин')) {
    declinedLastname = lastname + 'а'; // Пушкин → Пушкина
  } else if (lastname.endsWith('енко')) {
    // Украинские фамилии не склоняются
    declinedLastname = lastname;
  } else if (lastname.endsWith('а') && !lastname.endsWith('ова') && !lastname.endsWith('ева')) {
    declinedLastname = lastname.replace(/а$/, 'у'); // Петрова → Петрову
  }
  
  // Склонение женских имен
  if (firstname.endsWith('а')) {
    declinedFirstname = firstname.replace(/а$/, 'у'); // Анна → Анну
  } else if (firstname.endsWith('я')) {
    declinedFirstname = firstname.replace(/я$/, 'ю'); // Мария → Марию
  } else if (firstname.endsWith('ь')) {
    // Мужские имена на -ь обычно не изменяются в винительном падеже для одушевленных
    // Женские имена на -ь тоже часто не изменяются
    declinedFirstname = firstname;
  }
  
  // Склонение отчеств
  if (patronymic) {
    if (patronymic.endsWith('ович') || patronymic.endsWith('евич')) {
      declinedPatronymic = patronymic + 'а'; // Иванович → Ивановича
    } else if (patronymic.endsWith('овна') || patronymic.endsWith('евна')) {
      declinedPatronymic = patronymic.replace(/на$/, 'ну'); // Ивановна → Ивановну
    }
  }
  
  const parts = [declinedLastname, declinedFirstname];
  if (declinedPatronymic) {
    parts.push(declinedPatronymic);
  }
  
  return parts.join(' ');
};

/**
 * Получить правильно склоненное имя для заявления
 * @param {object} person - объект с данными человека {lastname, firstname, fathername}
 * @param {string} language - язык ('Қазақша' или 'Русский')
 * @returns {string} склоненное ФИО
 */
export const getDeclinedNameForApplication = (person, language = 'Русский') => {
  if (!person) return '';
  
  const { lastname = '', firstname = '', fathername = '' } = person;
  
  if (language === 'Қазақша') {
    // Для казахского языка склоняем только отчество
    const declinedPatronymic = declineKazakhPatronymic(fathername);
    const parts = [lastname, firstname];
    if (declinedPatronymic) {
      parts.push(declinedPatronymic);
    }
    return parts.join(' ');
  } else {
    // Для русского языка склоняем все ФИО
    return declineRussianName(lastname, firstname, fathername);
  }
};

/**
 * Получить правильно склоненное имя студента для казахского заявления (исходительный падеж)
 * @param {object} person - объект с данными человека {lastname, firstname, fathername}
 * @returns {string} склоненное ФИО студента в исходительном падеже
 */
export const getDeclinedStudentNameKazakh = (person) => {
  if (!person) return '';
  
  const { lastname = '', firstname = '', fathername = '' } = person;
  
  // Для имени студента склоняем только отчество в исходительном падеже
  const declinedPatronymic = declineKazakhPatronymicAblative(fathername);
  const parts = [lastname, firstname];
  if (declinedPatronymic) {
    parts.push(declinedPatronymic);
  }
  return parts.join(' ');
};

/**
 * Склонение русского имени в родительном падеже (от кого?)
 * @param {string} lastname - фамилия
 * @param {string} firstname - имя
 * @param {string} patronymic - отчество
 * @returns {string} склоненное ФИО в родительном падеже
 */
export const declineRussianNameGenitive = (lastname, firstname, patronymic) => {
  if (!lastname || !firstname) return '';
  
  let declinedLastname = lastname;
  let declinedFirstname = firstname;
  let declinedPatronymic = patronymic || '';
  
  // Склонение фамилий в родительном падеже
  if (lastname.endsWith('ов') || lastname.endsWith('ев')) {
    declinedLastname = lastname + 'а'; // Иванов → Иванова
  } else if (lastname.endsWith('ский') || lastname.endsWith('цкий')) {
    declinedLastname = lastname.replace(/ий$/, 'ого'); // Невский → Невского
  } else if (lastname.endsWith('ин')) {
    declinedLastname = lastname + 'а'; // Пушкин → Пушкина
  } else if (lastname.endsWith('енко')) {
    // Украинские фамилии не склоняются
    declinedLastname = lastname;
  } else if (lastname.endsWith('а') && !lastname.endsWith('ова') && !lastname.endsWith('ева') && !lastname.endsWith('ина')) {
    declinedLastname = lastname.replace(/а$/, 'ой'); // Петрова → Петровой
  } else if (lastname.endsWith('ова') || lastname.endsWith('ева') || lastname.endsWith('ина')) {
    declinedLastname = lastname.replace(/а$/, 'ой'); // Петрова → Петровой, Козлова → Козловой
  }
  
  // Склонение имен в родительном падеже
  // Мужские имена
  if (firstname === 'Султан') {
    declinedFirstname = 'Султана'; // Султан → Султана (особый случай)
  } else if (firstname === 'Иван') {
    declinedFirstname = 'Ивана'; // Иван → Ивана (особый случай)
  } else if (firstname.endsWith('н') && !firstname.endsWith('ан') && !firstname.endsWith('ен') && !firstname.endsWith('ин')) {
    declinedFirstname = firstname + 'а'; // Другие имена на -н
  } else if (firstname.endsWith('й')) {
    declinedFirstname = firstname.replace(/й$/, 'я'); // Андрей → Андрея
  } else if (firstname.endsWith('ь')) {
    declinedFirstname = firstname.replace(/ь$/, 'я'); // Игорь → Игоря
  } else if (firstname.endsWith('а') && !firstname.endsWith('ия') && !firstname.endsWith('ея') && !firstname.endsWith('на')) {
    // Мужские имена на -а (редкие случаи)
    declinedFirstname = firstname.replace(/а$/, 'ы'); // Никита → Никиты
  }
  // Женские имена
  else if (firstname.endsWith('а') && (firstname.endsWith('ия') || firstname.endsWith('ея') || firstname.endsWith('на'))) {
    declinedFirstname = firstname.replace(/а$/, 'ы'); // Анна → Анны
  } else if (firstname.endsWith('я')) {
    declinedFirstname = firstname.replace(/я$/, 'и'); // Мария → Марии
  }
  
  // Склонение отчеств в родительном падеже
  if (patronymic) {
    if (patronymic.endsWith('ович')) {
      declinedPatronymic = patronymic.replace(/ович$/, 'овича'); // Иванович → Ивановича
    } else if (patronymic.endsWith('евич')) {
      declinedPatronymic = patronymic.replace(/евич$/, 'евича'); // Алексеевич → Алексеевича
    } else if (patronymic.endsWith('ич')) {
      declinedPatronymic = patronymic.replace(/ич$/, 'ича'); // Ильич → Ильича
    } else if (patronymic.endsWith('овна')) {
      declinedPatronymic = patronymic.replace(/овна$/, 'овны'); // Ивановна → Ивановны
    } else if (patronymic.endsWith('евна')) {
      declinedPatronymic = patronymic.replace(/евна$/, 'евны'); // Алексеевна → Алексеевны
    } else if (patronymic.endsWith('на')) {
      declinedPatronymic = patronymic.replace(/на$/, 'ны'); // Ильинична → Ильиничны
    }
  }
  
  const parts = [declinedLastname, declinedFirstname];
  if (declinedPatronymic) {
    parts.push(declinedPatronymic);
  }
  return parts.join(' ');
};

/**
 * Получить склоненное имя студента для русского заявления (родительный падеж)
 * @param {object} person - объект с данными человека
 * @returns {string} склоненное ФИО в родительном падеже
 */
export const getDeclinedStudentNameRussian = (person) => {
  if (!person) return 'Магистранта';
  
  const { lastname, firstname, fathername } = person;
  if (!lastname || !firstname) return 'Магистранта';
  
  return declineRussianNameGenitive(lastname, firstname, fathername);
};

/**
 * Получить склоненное имя руководителя для русского заявления (родительный падеж)
 * @param {object} person - объект с данными руководителя
 * @returns {string} склоненное ФИО в родительном падеже
 */
export const getDeclinedSupervisorNameRussian = (person) => {
  if (!person) return 'Руководителя';
  
  const { lastname, firstname, fathername } = person;
  if (!lastname || !firstname) return 'Руководителя';
  
  return declineRussianNameGenitive(lastname, firstname, fathername);
};

/**
 * Утилиты для грамматики имен
 */
export const NameGrammarUtils = {
  declineKazakhPatronymic,
  declineKazakhPatronymicAblative,
  declineRussianName,
  declineRussianNameGenitive,
  getDeclinedNameForApplication,
  getDeclinedStudentNameKazakh,
  getDeclinedStudentNameRussian,
  getDeclinedSupervisorNameRussian
};

export default NameGrammarUtils;
