/**
 * Тестирование утилит для грамматики имен
 * Демонстрация склонения имен в разных падежах
 */

import { 
  declineKazakhPatronymic,
  declineKazakhPatronymicAblative,
  declineRussianName,
  declineRussianNameGenitive,
  getDeclinedNameForApplication,
  getDeclinedStudentNameKazakh,
  getDeclinedStudentNameRussian
} from './nameGrammar';

// Тестовые примеры для казахского языка
const kazakhTests = [
  { patronymic: 'Кайсарұлы', expected: 'Кайсарұлын' },
  { patronymic: 'Шахмаранович', expected: 'Шахмарановичты' },
  { patronymic: 'Айгүлқызы', expected: 'Айгүлқызын' },
  { patronymic: 'Ивановна', expected: 'Ивановнаны' },
  { patronymic: 'Алексеевич', expected: 'Алексеевичты' },
  { patronymic: 'Петровна', expected: 'Петровнаны' }
];

// Тестовые примеры для казахского языка (исходительный падеж)
const kazakhAblativeTests = [
  { patronymic: 'Кайсарұлы', expected: 'Кайсарұлынан' },
  { patronymic: 'Шахмаранович', expected: 'Шахмарановичтан' },
  { patronymic: 'Айгүлқызы', expected: 'Айгүлқызынан' },
  { patronymic: 'Ивановна', expected: 'Ивановнадан' },
  { patronymic: 'Алексеевич', expected: 'Алексеевичтан' },
  { patronymic: 'Петровна', expected: 'Петровнадан' }
];

// Тестовые примеры для русского языка (винительный падеж)
const russianTests = [
  { lastname: 'Иванов', firstname: 'Иван', patronymic: 'Иванович', expected: 'Иванова Ивана Ивановича' },
  { lastname: 'Петрова', firstname: 'Анна', patronymic: 'Алексеевна', expected: 'Петрову Анну Алексеевну' },
  { lastname: 'Сидоров', firstname: 'Петр', patronymic: 'Сергеевич', expected: 'Сидорова Петра Сергеевича' },
  { lastname: 'Козлова', firstname: 'Мария', patronymic: 'Владимировна', expected: 'Козлову Марию Владимировну' }
];

// Тестовые примеры для русского языка (родительный падеж)
const russianGenitiveTests = [
  { lastname: 'Иванов', firstname: 'Иван', patronymic: 'Иванович', expected: 'Иванова Ивана Ивановича' },
  { lastname: 'Петрова', firstname: 'Анна', patronymic: 'Алексеевна', expected: 'Петровой Анны Алексеевны' },
  { lastname: 'Сидоров', firstname: 'Петр', patronymic: 'Сергеевич', expected: 'Сидорова Петра Сергеевича' },
  { lastname: 'Козлова', firstname: 'Мария', patronymic: 'Владимировна', expected: 'Козловой Марии Владимировны' },
  { lastname: 'Сайлаубаев', firstname: 'Султан', patronymic: 'Шакмаранович', expected: 'Сайлаубаева Султана Шакмарановича' },
  { lastname: 'Нургалиев', firstname: 'Андрей', patronymic: 'Кириллович', expected: 'Нургалиева Андрея Кирилловича' },
  { lastname: 'Петров', firstname: 'Игорь', patronymic: 'Владимирович', expected: 'Петрова Игоря Владимировича' }
];

console.log('=== Тестирование склонения казахских отчеств (винительный падеж) ===');
kazakhTests.forEach((test, index) => {
  const result = declineKazakhPatronymic(test.patronymic);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.patronymic} → ${result} (ожидалось: ${test.expected})`);
});

console.log('\n=== Тестирование склонения казахских отчеств (исходительный падеж) ===');
kazakhAblativeTests.forEach((test, index) => {
  const result = declineKazakhPatronymicAblative(test.patronymic);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.patronymic} → ${result} (ожидалось: ${test.expected})`);
});

console.log('\n=== Тестирование склонения русских имен (винительный падеж) ===');
russianTests.forEach((test, index) => {
  const result = declineRussianName(test.lastname, test.firstname, test.patronymic);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.lastname} ${test.firstname} ${test.patronymic} → ${result}`);
  console.log(`   Ожидалось: ${test.expected}`);
});

console.log('\n=== Тестирование склонения русских имен (родительный падеж) ===');
russianGenitiveTests.forEach((test, index) => {
  const result = declineRussianNameGenitive(test.lastname, test.firstname, test.patronymic);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${test.lastname} ${test.firstname} ${test.patronymic} → ${result}`);
  console.log(`   Ожидалось: ${test.expected}`);
});

console.log('\n=== Тестирование полных функций для заявлений ===');

// Тест для казахского студента
const kazakhStudent = {
  lastname: 'Нұрғалиев',
  firstname: 'Сұлтан',
  fathername: 'Кайсарұлы'
};

const kazakhStudentResult = getDeclinedStudentNameKazakh(kazakhStudent);
console.log(`Казахский студент: ${kazakhStudent.lastname} ${kazakhStudent.firstname} ${kazakhStudent.fathername}`);
console.log(`Результат (исходительный падеж): ${kazakhStudentResult}`);

// Тест для русского студента (из заявления)
const russianStudent = {
  lastname: 'Сайлаубаев',
  firstname: 'Султан',
  fathername: 'Шакмаранович'
};

const russianStudentResult = getDeclinedStudentNameRussian(russianStudent);
console.log(`\nРусский студент (из заявления): ${russianStudent.lastname} ${russianStudent.firstname} ${russianStudent.fathername}`);
console.log(`Результат (родительный падеж): ${russianStudentResult}`);
console.log(`Ожидалось: Сайлаубаева Султана Шакмарановича`);

// Дополнительные тесты для мужских имен
const additionalTests = [
  { lastname: 'Иванов', firstname: 'Иван', fathername: 'Иванович' },
  { lastname: 'Петров', firstname: 'Андрей', fathername: 'Сергеевич' },
  { lastname: 'Сидоров', firstname: 'Игорь', fathername: 'Владимирович' }
];

console.log('\n=== Дополнительные тесты мужских имен ===');
additionalTests.forEach((student, index) => {
  const result = getDeclinedStudentNameRussian(student);
  console.log(`${index + 1}. ${student.lastname} ${student.firstname} ${student.fathername} → ${result}`);
});

// Тест для руководителя (винительный падеж)
const supervisor = {
  lastname: 'Петров',
  firstname: 'Петр',
  fathername: 'Петрович'
};

const supervisorResult = getDeclinedNameForApplication(supervisor, 'Русский');
console.log(`\nРуководитель: ${supervisor.lastname} ${supervisor.firstname} ${supervisor.fathername}`);
console.log(`Результат (винительный падеж): ${supervisorResult}`);

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
  window.testNameGrammar = {
    declineKazakhPatronymic,
    declineKazakhPatronymicAblative,
    declineRussianName,
    declineRussianNameGenitive,
    getDeclinedNameForApplication,
    getDeclinedStudentNameKazakh,
    getDeclinedStudentNameRussian,
    kazakhTests,
    kazakhAblativeTests,
    russianTests,
    russianGenitiveTests,
    
    // Полезные тестовые функции
    testAllDeclensions: () => {
      console.log('=== Полное тестирование всех склонений ===');
      
      // Казахские отчества
      kazakhTests.forEach((test, i) => {
        const result = declineKazakhPatronymic(test.patronymic);
        console.log(`Казах (вин): ${test.patronymic} → ${result}`);
      });
      
      kazakhAblativeTests.forEach((test, i) => {
        const result = declineKazakhPatronymicAblative(test.patronymic);
        console.log(`Казах (исх): ${test.patronymic} → ${result}`);
      });
      
      // Русские имена
      russianTests.forEach((test, i) => {
        const result = declineRussianName(test.lastname, test.firstname, test.patronymic);
        console.log(`Русский (вин): ${test.lastname} ${test.firstname} ${test.patronymic} → ${result}`);
      });
      
      russianGenitiveTests.forEach((test, i) => {
        const result = declineRussianNameGenitive(test.lastname, test.firstname, test.patronymic);
        console.log(`Русский (род): ${test.lastname} ${test.firstname} ${test.patronymic} → ${result}`);
      });
    },
    
    testSpecificName: (lastname, firstname, patronymic, language = 'Русский', caseType = 'genitive') => {
      console.log(`Тестирование: ${lastname} ${firstname} ${patronymic} (${language}, ${caseType})`);
      
      if (language === 'Қазақша') {
        if (caseType === 'ablative') {
          const result = declineKazakhPatronymicAblative(patronymic);
          console.log(`Результат (исходительный): ${result}`);
          return result;
        } else {
          const result = declineKazakhPatronymic(patronymic);
          console.log(`Результат (винительный): ${result}`);
          return result;
        }
      } else {
        if (caseType === 'genitive') {
          const result = declineRussianNameGenitive(lastname, firstname, patronymic);
          console.log(`Результат (родительный): ${result}`);
          return result;
        } else {
          const result = declineRussianName(lastname, firstname, patronymic);
          console.log(`Результат (винительный): ${result}`);
          return result;
        }
      }
    }
  };
  
  console.log('\n🚀 Для тестирования в браузере используйте:');
  console.log('window.testNameGrammar.testAllDeclensions()');
  console.log('window.testNameGrammar.testSpecificName("Иванов", "Иван", "Иванович", "Русский", "genitive")');
}