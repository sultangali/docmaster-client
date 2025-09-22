/**
 * Примеры использования утилит для работы с датами
 * Демонстрация локализации дат для заявлений
 */

import { 
  getCurrentDateForApplication, 
  getMonthName, 
  getCurrentDay, 
  getCurrentYear,
  KAZAKH_MONTHS,
  RUSSIAN_MONTHS 
} from './dateUtils';

// Примеры текущей даты на разных языках
console.log('=== Примеры автоматической даты ===');
console.log('Казахский язык:', getCurrentDateForApplication('Қазақша'));
console.log('Русский язык:', getCurrentDateForApplication('Русский'));

// Примеры всех месяцев
console.log('\n=== Все месяцы на казахском языке ===');
for (let i = 0; i < 12; i++) {
  console.log(`${i + 1}. ${KAZAKH_MONTHS[i]}`);
}

console.log('\n=== Все месяцы на русском языке ===');
for (let i = 0; i < 12; i++) {
  console.log(`${i + 1}. ${RUSSIAN_MONTHS[i]}`);
}

// Примеры конкретных месяцев
console.log('\n=== Примеры конкретных месяцев ===');
console.log('Сентябрь на казахском:', getMonthName('Қазақша', 8));
console.log('Сентябрь на русском:', getMonthName('Русский', 8));
console.log('Декабрь на казахском:', getMonthName('Қазақша', 11));
console.log('Декабрь на русском:', getMonthName('Русский', 11));

// Текущие компоненты даты
console.log('\n=== Компоненты текущей даты ===');
console.log('Текущий день:', getCurrentDay());
console.log('Текущий год:', getCurrentYear());
console.log('Текущий месяц (казахский):', getMonthName('Қазақша'));
console.log('Текущий месяц (русский):', getMonthName('Русский'));

// Примеры для разных дат
console.log('\n=== Примеры для разных дат года ===');
const testDates = [
  { month: 0, name: 'Январь' },
  { month: 2, name: 'Март' },
  { month: 5, name: 'Июнь' },
  { month: 8, name: 'Сентябрь' },
  { month: 11, name: 'Декабрь' }
];

testDates.forEach(({ month, name }) => {
  console.log(`${name}: ${getMonthName('Қазақша', month)} / ${getMonthName('Русский', month)}`);
});

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
  window.testDateUtils = {
    getCurrentDateForApplication,
    getMonthName,
    getCurrentDay,
    getCurrentYear,
    KAZAKH_MONTHS,
    RUSSIAN_MONTHS,
    
    // Полезные тестовые функции
    testAllMonths: () => {
      console.log('Казахские месяцы:', Object.values(KAZAKH_MONTHS));
      console.log('Русские месяцы:', Object.values(RUSSIAN_MONTHS));
    },
    
    testCurrentDate: () => {
      console.log('Сегодня на казахском:', getCurrentDateForApplication('Қазақша'));
      console.log('Сегодня на русском:', getCurrentDateForApplication('Русский'));
    }
  };
  
  console.log('\n🚀 Для тестирования в браузере используйте:');
  console.log('window.testDateUtils.testCurrentDate()');
  console.log('window.testDateUtils.testAllMonths()');
}
