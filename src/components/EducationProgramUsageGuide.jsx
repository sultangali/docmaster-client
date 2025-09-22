import React, { useState } from 'react';
import { Card, Select, Table, Space, Tag, Typography, Row, Col, Alert } from 'antd';
import { useEducationPrograms } from '../hooks/useEducationPrograms';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// Руководство по использованию t1 и t2 для образовательных программ
const EducationProgramUsageGuide = () => {
  const [selectedRole, setSelectedRole] = useState('magistrants');
  const [selectedLanguage, setSelectedLanguage] = useState('Русский');

  const { programOptions, getDisplayName, getShortName } = useEducationPrograms(
    selectedRole,
    selectedLanguage
  );

  const usageCases = [
    {
      context: 'Формы создания/редактирования пользователя',
      template: 't1',
      description: 'Полное название с кавычками для ясности выбора',
      example: getDisplayName('7M01503', 't1') || 'Пример недоступен'
    },
    {
      context: 'Таблицы списков пользователей',
      template: 't2',
      description: 'Сокращенный вариант для экономии места',
      example: getDisplayName('7M01503', 't2') || 'Пример недоступен'
    },
    {
      context: 'Профиль пользователя',
      template: 't2',
      description: 'Читаемый формат для отображения текущей ОП',
      example: getDisplayName('7M01503', 't2') || 'Пример недоступен'
    },
    {
      context: 'Компактные элементы (Badge, Tag)',
      template: 'short',
      description: 'Только название программы без кода',
      example: getShortName('7M01503') || 'Пример недоступен'
    },
    {
      context: 'Поиск и фильтрация',
      template: 't1',
      description: 'Полная информация для точного поиска',
      example: getDisplayName('7M01503', 't1') || 'Пример недоступен'
    }
  ];

  const columns = [
    {
      title: 'Контекст использования',
      dataIndex: 'context',
      key: 'context',
      width: '25%'
    },
    {
      title: 'Шаблон',
      dataIndex: 'template',
      key: 'template',
      width: '10%',
      render: (template) => <Tag color={template === 't1' ? 'blue' : template === 't2' ? 'green' : 'orange'}>{template}</Tag>
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '35%'
    },
    {
      title: 'Пример',
      dataIndex: 'example',
      key: 'example',
      width: '30%',
      render: (text) => <Text code>{text}</Text>
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Руководство по использованию шаблонов отображения ОП">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* Селекторы для демонстрации */}
          <Alert
            message="Примечание"
            description="В реальной системе язык определяется полем 'language' в профиле пользователя (язык обучения), а не общим переключателем интерфейса"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Space>
                <Text strong>Роль пользователя: </Text>
                <Select
                  value={selectedRole}
                  onChange={setSelectedRole}
                  style={{ width: 200 }}
                >
                  <Option value="magistrants">Магистранты</Option>
                  <Option value="doctorants">Докторанты</Option>
                </Select>
              </Space>
            </Col>
            <Col span={12}>
              <Space>
                <Text strong>Язык обучения: </Text>
                <Select
                  value={selectedLanguage}
                  onChange={setSelectedLanguage}
                  style={{ width: 150 }}
                >
                  <Option value="Русский">Русский</Option>
                  <Option value="Қазақша">Қазақша</Option>
                </Select>
              </Space>
            </Col>
          </Row>

          {/* Объяснение концепции */}
          <Alert
            message="Концепция шаблонов отображения"
            description={
              <div>
                <Paragraph>
                  <Text strong>t1</Text> - Полный формат с кавычками и кодом, используется в формах и важных местах где нужна максимальная ясность
                </Paragraph>
                <Paragraph>
                  <Text strong>t2</Text> - Сокращенный читаемый формат, используется в таблицах и профилях для удобства восприятия
                </Paragraph>
                <Paragraph>
                  <Text strong>short</Text> - Только название программы, используется в компактных элементах
                </Paragraph>
              </div>
            }
            type="info"
            showIcon
          />

          {/* Таблица с примерами использования */}
          <div>
            <Title level={4}>Примеры использования для роли "{selectedRole}" на языке "{selectedLanguage}"</Title>
            <Table
              columns={columns}
              dataSource={usageCases}
              pagination={false}
              size="middle"
              rowKey="context"
            />
          </div>

          {/* Примеры кода */}
          <Card size="small" title="Примеры кода">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>В форме (используем t1):</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '4px' }}>
                  {`// Получаем опции для Select с полными названиями
const options = getSelectOptions(role, language, 't1');

<Select>
  {options.map(option => (
    <Option key={option.value} value={option.value}>
      {option.label} // Полное название с кавычками
    </Option>
  ))}
</Select>`}
                </pre>
              </div>

              <div>
                <Text strong>В таблице (используем t2):</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '4px' }}>
                  {`// Отображаем в колонке таблицы
{
  title: 'ОП',
  dataIndex: 'OP',
  render: (code, record) => getDisplayName(code, 't2') // Сокращенный формат
}`}
                </pre>
              </div>

              <div>
                <Text strong>В компактном элементе (используем short):</Text>
                <pre style={{ background: '#f5f5f5', padding: '8px', marginTop: '4px' }}>
                  {`// Для Badge или Tag
<Tag>{getShortName(opCode)}</Tag> // Только название программы`}
                </pre>
              </div>
            </Space>
          </Card>

        </Space>
      </Card>
    </div>
  );
};

export default EducationProgramUsageGuide;
