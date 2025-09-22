import React, { useState } from 'react';
import { Card, Select, Table, Space, Tag, Typography } from 'antd';
import { useEducationPrograms } from '../hooks/useEducationPrograms';
import { EducationUtils, EDUCATION_PROGRAMS } from '../utils/educationPrograms';

const { Option } = Select;
const { Title, Text } = Typography;

// Демонстрационный компонент системы образовательных программ
const EducationProgramDemo = () => {
  const [selectedRole, setSelectedRole] = useState('magistrants');
  const [selectedLanguage, setSelectedLanguage] = useState('Русский');
  
  const { programOptions, getDisplayName, getShortName } = useEducationPrograms(
    selectedRole, 
    selectedLanguage
  );

  // Данные для таблицы
  const tableData = Object.entries(EDUCATION_PROGRAMS[selectedRole] || {}).map(([code, program]) => ({
    key: code,
    code,
    program,
    t1_display: getDisplayName(code, 't1'),
    t2_display: getDisplayName(code, 't2'),
    short_display: getShortName(code)
  }));

  const columns = [
    {
      title: 'Код ОП',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="blue">{code}</Tag>
    },
    {
      title: 'Полное название (t1)',
      dataIndex: 't1_display',
      key: 't1'
    },
    {
      title: 'Краткое название (t2)', 
      dataIndex: 't2_display',
      key: 't2'
    },
    {
      title: 'Короткое название',
      dataIndex: 'short_display',
      key: 'short'
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Демонстрация многоязычной системы образовательных программ">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Селекторы */}
          <div>
            <Space size="large">
              <div>
                <Text strong>Роль: </Text>
                <Select
                  value={selectedRole}
                  onChange={setSelectedRole}
                  style={{ width: 200 }}
                >
                  <Option value="magistrants">Магистранты</Option>
                  <Option value="doctorants">Докторанты</Option>
                </Select>
              </div>
              
              <div>
                <Text strong>Язык обучения пользователя: </Text>
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  style={{ width: 150 }}
                >
                  <Option value="Русский">Русский</Option>
                  <Option value="Қазақша">Қазақша</Option>
                </Select>
              </div>
            </Space>
          </div>

          {/* Варианты для формы */}
          <Card size="small" title="Опции для Select компонента">
            <div>
              <Text strong>Доступные варианты в форме:</Text>
              <ul>
                {programOptions.map(option => (
                  <li key={option.value}>
                    <Tag>{option.value}</Tag> - {option.label}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Таблица всех вариантов */}
          <div>
            <Title level={4}>Все варианты отображения для роли "{selectedRole}" на языке "{selectedLanguage}"</Title>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="small"
            />
          </div>

          {/* Объяснение */}
          <Card size="small" title="Объяснение системы" type="inner">
            <Space direction="vertical">
              <div>
                <Text strong>t1 (полное название):</Text> используется в формах выбора, содержит полную информацию с кавычками
              </div>
              <div>
                <Text strong>t2 (краткое название):</Text> используется для отображения в таблицах и профилях
              </div>
              <div>
                <Text strong>short (короткое):</Text> используется в компактных местах, только название программы
              </div>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default EducationProgramDemo;
