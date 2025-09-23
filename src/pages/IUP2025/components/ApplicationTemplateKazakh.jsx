import React from 'react';
import { Card, Typography } from 'antd';
import { formatDegreesArray } from '../../../utils/degrees';
import { getDeclinedNameForApplication, getDeclinedStudentNameKazakh } from '../../../utils/nameGrammar';
import { getCurrentDateForApplication } from '../../../utils/dateUtils';
import { useEducationPrograms } from '../../../hooks/useEducationPrograms';
import { formatOPForApplication } from '../../../utils/opFormatter.jsx';
const { Text } = Typography;

const ApplicationTemplateKazakh = ({ studentData, supervisorData, dissertationTopic }) => {
  // Получаем степень научного руководителя
  const supervisorDegree = supervisorData?.degree
    ? formatDegreesArray(supervisorData.degree, 'Қазақша', 'd1')
    : 'ғылыми дәрежесі';
  const { getDisplayName: getDisplayRus, getShortName: getShortRus } = useEducationPrograms('magistrants', 'Русский');
  const { getDisplayName: getDisplayKaz, getShortName: getShortKaz } = useEducationPrograms('magistrants', 'Қазақша');

  const getDisplayWithLanguage = (language, OP) => {
    switch (language) {
      case 'Қазақша':
        return getDisplayKaz(OP, 't1');
      case 'Русский':
        return getDisplayRus(OP, 't1');
      default:
        return getDisplayKaz(OP, 't1');
    }
  }

  // Получаем ОП студента
  const studentOP = studentData?.OP || '7M______';
  
  // Получаем отформатированную ОП для заявления
  const opDisplayText = getDisplayWithLanguage('Қазақша', studentOP);
  const formattedOP = formatOPForApplication(opDisplayText, 'Қазақша');
  
  // Получаем правильно склоненное имя руководителя
  const supervisorDeclinedName = getDeclinedNameForApplication(supervisorData, 'Қазақша');

  // Получаем правильно склоненное имя студента в исходительном падеже
  const studentDeclinedName = getDeclinedStudentNameKazakh(studentData) || 'Магистрант ТАЖ';

  // Получаем темы диссертации
  const kazakhTopic = dissertationTopic?.kazakh || 'Диссертация тақырыбы қазақ тілінде';
  const russianTopic = dissertationTopic?.russian || 'Тема диссертации на русском языке';
  const englishTopic = dissertationTopic?.english || 'Dissertation topic in English';

  return (
    <Card
      className="application-template"
      style={{
        width: 800,
        minWidth: 800,
        height: 1024,
        margin: '0 auto',
        background: '#fff',
        border: '2px solid #d9d9d9',
        fontFamily: 'Times New Roman, serif',
        flexShrink: 0
      }}
    >
      <div style={{
        padding: '40px',
        lineHeight: '1.8',
        fontSize: '18px',
        color: '#000'
      }}>
        {/* Заголовок */}
        <div style={{ textAlign: 'right', marginBottom: 40 }}>
          <div>Академик Е.А. Бөкетов атындағы</div>
          <div>Қарағанды университеті</div>
          <div>Басқарма Төрағасы – Ректоры</div>
          <div>з.ғ.д., профессор Н.О. Дулатбековке</div>
          <div>Математика және ақпараттық</div>
          <div>технологиялар факультеті</div>
           <div style={{
             display: 'inline-block',
             padding: '2px 4px'
           }}>
             {formattedOP.firstLine}
             {formattedOP.hasSecondLine && (
               <>
                 <br />
                 {formattedOP.secondLine}
               </>
             )}
           </div>
          <div> білім беру бағдарламасы</div>
          <div style={{
            display: 'inline-block',
            padding: '2px 4px'
          }}>
            1-ші оқу жылы магистранты
          </div>
          <br />
          <div style={{
            display: 'inline-block',
            padding: '2px 4px'
          }}>
            {studentDeclinedName}
          </div>
        </div>

        {/* Заявление */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          Өтініш
        </div>

        <div style={{ textIndent: '50px', textAlign: 'justify' }}>
          Сізден ғылыми кеңесте «<span >{kazakhTopic}</span>», «<span >{russianTopic}</span>», «<span >{englishTopic}</span>» магистерлік диссертация тақырыбын және ғылыми жетекші ретінде
          қолданбалы математика және информатика кафедрасының <span >{supervisorDegree}ы </span> <span >{supervisorDeclinedName} </span>
          бекітуіңізді сұраймын.
        </div>

        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between' }}>
          <div>Магистранттың қолы</div>
          <div>{getCurrentDateForApplication('Қазақша')}</div>
        </div>
      </div>
    </Card>
  );
};

export default ApplicationTemplateKazakh;