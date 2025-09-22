import React from 'react';
import { Card, Typography } from 'antd';
import { formatDegreesArray, formatDegreesArrayGenitive } from '../../../utils/degrees';
import { getDeclinedNameForApplication, getDeclinedStudentNameRussian, getDeclinedSupervisorNameRussian } from '../../../utils/nameGrammar';
import { getCurrentDateForApplication } from '../../../utils/dateUtils';
import { useEducationPrograms } from '../../../hooks/useEducationPrograms';
import { formatOPForApplication } from '../../../utils/opFormatter.jsx';
const { Text } = Typography;

const ApplicationTemplateRussian = ({ studentData, supervisorData, dissertationTopic }) => {
  // Получаем степень научного руководителя
  const supervisorDegree = supervisorData?.degree 
    ? formatDegreesArray(supervisorData.degree, 'Русский', 'd1')
    : 'ученая степень';
  
  // Получаем степень научного руководителя в родительном падеже
  const supervisorDegreeGenitive = supervisorData?.degree 
    ? formatDegreesArrayGenitive(supervisorData.degree, 'Русский', 'd1')
    : 'ученой степени';
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
  const opDisplayText = getDisplayWithLanguage('Русский', studentOP);
  const formattedOP = formatOPForApplication(opDisplayText, 'Русский');
  
  // Получаем правильно склоненное имя руководителя в родительном падеже
  const supervisorDeclinedName = getDeclinedSupervisorNameRussian(supervisorData);
  
  // Получаем ФИО студента
  const studentName = studentData?.fullName || 'ФИО магистранта';
  
  // Получаем правильно склоненное имя студента в родительном падеже
  const studentDeclinedName = getDeclinedStudentNameRussian(studentData) || 'Магистранта';
  
  // Получаем темы диссертации
  const kazakhTopic = dissertationTopic?.kazakh || 'Тема диссертации на казахском языке';
  const russianTopic = dissertationTopic?.russian || 'Тема диссертации на русском языке';
  const englishTopic = dissertationTopic?.english || 'Dissertation topic in English';

  return (
    <Card 
      className="application-template"
      style={{ 
        maxWidth: 800, 
        height: 1024,
        margin: '0 auto',
        background: '#fff',
        border: '2px solid #d9d9d9',
        fontFamily: 'Times New Roman, serif'
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
          <div>Председателю Правления – Ректору</div>
          <div>Карагандинского университета</div>
          <div>имени академика Е.А.Букетова</div>
          <div>д.ю.н., профессору Дулатбекову Н.О.</div>
          <div>магистранта 1 курса факультета</div>
          <div>Математики и информационной
          технологий</div>
          <div>ОП <span>
            {formattedOP.firstLine}
            {formattedOP.hasSecondLine && (
              <>
                <br />
                {formattedOP.secondLine}
              </>
            )}
          </span></div>
          <div >
            {studentDeclinedName}
          </div>
        </div>

        {/* Заявление */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          Заявление
        </div>

        <div style={{ textIndent: '50px', textAlign: 'justify' }}>
          Прошу рассмотреть на заседании Ученого совета вопрос о назначении 
          научным руководителем <span >{supervisorDegreeGenitive}</span> кафедры прикладной математики и 
          информатики <span >{supervisorDeclinedName}</span> и утвердить тему магистерской 
          диссертации «<span >{kazakhTopic}</span>», 
          «<span >{russianTopic}</span>», 
          «<span >{englishTopic}</span>».
        </div>

        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between' }}>
          <div>Подпись магистранта</div>
          <div>{getCurrentDateForApplication('Русский')}</div>
        </div>
      </div>
    </Card>
  );
};

export default ApplicationTemplateRussian;
