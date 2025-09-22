// Примеры использования разных шаблонов отображения ОП

import { EducationUtils } from './educationPrograms';

// Пример 1: В форме создания пользователя (используем t1 - полный формат)
export const getFormOptions = (role, language) => {
  // t1 дает полное название с кавычками для ясности выбора
  return EducationUtils.getSelectOptions(role, language, 't1');
  
  // Результат для магистрантов на русском:
  // [
  //   { value: '7M01503', label: '«7M01503 - Информатика»' },
  //   { value: '7M06101', label: '«7M06101 - Информационные системы и технологии»' }
  // ]
};

// Пример 2: В таблице пользователей (используем t2 - сокращенный формат)
export const renderOPInTable = (opCode, userLanguage) => {
  // t2 дает сокращенный читаемый формат без лишних кавычек
  return EducationUtils.getLocalizedName(opCode, userLanguage, 't2');
  
  // Результат для '7M01503' на русском: '«7M01503» - Информатика'
  // Результат для '7M06101' на казахском: '«7M06101» - Ақпараттық жүйелер және технологиялар'
};

// Пример 3: В компактных элементах (используем short - только название)
export const renderOPBadge = (opCode, userLanguage) => {
  const program = EducationUtils.getProgramByCode(opCode);
  if (!program) return opCode;
  
  const lang = userLanguage === 'Қазақша' ? 'kaz' : 'rus';
  return program[lang].short;
  
  // Результат для '7M01503' на русском: 'Информатика'
  // Результат для '7M06101' на казахском: 'Ақпараттық жүйелер және технологиялар'
};

// Пример 4: В поиске (используем t1 для точности)
export const searchOPByName = (searchTerm, role, language) => {
  const programs = EducationUtils.getProgramsByRole(role);
  const results = [];
  
  Object.keys(programs).forEach(code => {
    const fullName = EducationUtils.getLocalizedName(code, language, 't1', role);
    if (fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push({ code, name: fullName });
    }
  });
  
  return results;
};

// Пример 5: Контекстное использование в профиле
export const getOPForProfile = (opCode, userLanguage, context = 'display') => {
  switch (context) {
    case 'form':
      // В форме редактирования профиля - полный формат
      return EducationUtils.getLocalizedName(opCode, userLanguage, 't1');
    
    case 'display':
      // В отображении профиля - сокращенный формат  
      return EducationUtils.getLocalizedName(opCode, userLanguage, 't2');
    
    case 'compact':
      // В мобильной версии или компактном виде
      const program = EducationUtils.getProgramByCode(opCode);
      if (!program) return opCode;
      const lang = userLanguage === 'Қазақша' ? 'kaz' : 'rus';
      return program[lang].short;
    
    default:
      return EducationUtils.getLocalizedName(opCode, userLanguage, 't2');
  }
};

// Пример использования в React компонентах:

/*
// В UserManagement форме:
const options = getFormOptions(selectedRole, selectedLanguage);
<Select>
  {options.map(option => (
    <Option key={option.value} value={option.value}>
      {option.label} // Полное название t1
    </Option>
  ))}
</Select>

// В таблице пользователей:
{
  title: 'ОП',
  dataIndex: 'OP', 
  render: (opCode, record) => renderOPInTable(opCode, record.language) // t2
}

// В Badge/Tag:
<Tag>{renderOPBadge(user.OP, user.language)}</Tag> // short

// В профиле (разные контексты):
<div>
  <h3>{getOPForProfile(user.OP, user.language, 'display')}</h3> // t2 для заголовка
  <Tag>{getOPForProfile(user.OP, user.language, 'compact')}</Tag> // short для тега
</div>
*/
