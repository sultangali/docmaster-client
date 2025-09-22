/**
 * Тестирование утилит для форматирования ОП
 * Демонстрация разделения длинных названий на две строки
 */

import { 
  splitOPText, 
  formatOPForApplication, 
  createOPDisplayElement 
} from './opFormatter.jsx';

// Тестовые примеры ОП
const testOPs = [
  '«7M06101» - Информационные системы и технологии',
  '«7M01503» - Педагогика и психология',
  '«7M06104» - Математическое и компьютерное моделирование',
  '«8D01103» - Информатика и вычислительная техника',
  '«7M06101» - Ақпараттық жүйелер және технологиялар',
  '«7M01503» - Педагогика және психология',
  '«7M06104» - Математикалық және компьютерлік модельдеу',
  '«8D01103» - Информатика және есептеуіш техника'
];

console.log('=== Тестирование разделения ОП на две строки ===');

testOPs.forEach((opText, index) => {
  console.log(`\n${index + 1}. Исходный текст: "${opText}"`);
  
  const result = splitOPText(opText);
  console.log(`   Первая строка: "${result.firstLine}"`);
  console.log(`   Вторая строка: "${result.secondLine}"`);
  console.log(`   Нужен перенос: ${result.secondLine.length > 0 ? 'Да' : 'Нет'}`);
});

console.log('\n=== Тестирование форматирования для заявлений ===');

testOPs.forEach((opText, index) => {
  console.log(`\n${index + 1}. ОП: "${opText}"`);
  
  const formatted = formatOPForApplication(opText, 'Русский');
  console.log(`   Результат форматирования:`);
  console.log(`   - Первая строка: "${formatted.firstLine}"`);
  console.log(`   - Вторая строка: "${formatted.secondLine}"`);
  console.log(`   - Есть вторая строка: ${formatted.hasSecondLine}`);
  console.log(`   - Полный текст: "${formatted.fullText}"`);
});

console.log('\n=== Примеры для разных языков ===');

const russianOP = '«7M06101» - Информационные системы и технологии';
const kazakhOP = '«7M06101» - Ақпараттық жүйелер және технологиялар';

console.log('\nРусский язык:');
const russianFormatted = formatOPForApplication(russianOP, 'Русский');
console.log(`Первая строка: "${russianFormatted.firstLine}"`);
console.log(`Вторая строка: "${russianFormatted.secondLine}"`);

console.log('\nКазахский язык:');
const kazakhFormatted = formatOPForApplication(kazakhOP, 'Қазақша');
console.log(`Первая строка: "${kazakhFormatted.firstLine}"`);
console.log(`Вторая строка: "${kazakhFormatted.secondLine}"`);

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
  window.testOPFormatter = {
    splitOPText,
    formatOPForApplication,
    createOPDisplayElement,
    testOPs,
    
    // Полезные тестовые функции
    testAllOPs: () => {
      testOPs.forEach((op, i) => {
        console.log(`${i + 1}. ${op}`);
        const result = formatOPForApplication(op, 'Русский');
        console.log(`   → "${result.firstLine}"`);
        if (result.hasSecondLine) {
          console.log(`     "${result.secondLine}"`);
        }
        console.log('');
      });
    },
    
    testSpecificOP: (opText, language = 'Русский') => {
      console.log(`Тестирование: "${opText}" (${language})`);
      const result = formatOPForApplication(opText, language);
      console.log(`Результат:`);
      console.log(`"${result.firstLine}"`);
      if (result.hasSecondLine) {
        console.log(`"${result.secondLine}"`);
      }
      return result;
    }
  };
  
  console.log('\n🚀 Для тестирования в браузере используйте:');
  console.log('window.testOPFormatter.testAllOPs()');
  console.log('window.testOPFormatter.testSpecificOP("ваш текст ОП")');
}
