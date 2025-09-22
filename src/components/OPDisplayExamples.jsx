import React from 'react';
import { Card, Tag, Select, Table, Space, Typography, Row, Col } from 'antd';
import { useEducationPrograms } from '../hooks/useEducationPrograms';

const { Option } = Select;
const { Title, Text } = Typography;

// Компонент для демонстрации различных способов отображения ОП
const OPDisplayExamples = () => {
  const opCode = '7M06101'; // Пример ОП
  
  // Хуки для разных языков
  const { getDisplayName: getDisplayRus, getShortName: getShortRus } = useEducationPrograms('magistrants', 'Русский');
  const { getDisplayName: getDisplayKaz, getShortName: getShortKaz } = useEducationPrograms('magistrants', 'Қазақша');

  const examples = [
    {
      context: 'Форма создания пользователя',
      template: 't1',
      purpose: 'Полная информация для точного выбора',
      russian: getDisplayRus(opCode, 't1'),
      kazakh: getDisplayKaz(opCode, 't1'),
      usage: 'Select Option в форме'
    },
    {
      context: 'Таблица пользователей',
      template: 't2', 
      purpose: 'Сокращенный формат для экономии места',
      russian: getDisplayRus(opCode, 't2'),
      kazakh: getDisplayKaz(opCode, 't2'),
      usage: 'Колонка ОП в таблице'
    },
    {
      context: 'Профиль пользователя',
      template: 't2',
      purpose: 'Читаемый формат для отображения',
      russian: getDisplayRus(opCode, 't2'),
      kazakh: getDisplayKaz(opCode, 't2'),
      usage: 'Поле ОП в профиле'
    },
    {
      context: 'Мобильная версия / Badge',
      template: 'short',
      purpose: 'Компактное отображение',
      russian: getShortRus(opCode),
      kazakh: getShortKaz(opCode),
      usage: 'Tag, Badge, мобильный интерфейс'
    }
  ];

  const columns = [
    {
      title: 'Контекст',
      dataIndex: 'context',
      key: 'context',
      width: '20%'
    },
    {
      title: 'Шаблон',
      dataIndex: 'template',
      key: 'template', 
      width: '10%',
      render: (template) => (
        <Tag color={template === 't1' ? 'blue' : template === 't2' ? 'green' : 'orange'}>
          {template}
        </Tag>
      )
    },
    {
      title: 'Назначение',
      dataIndex: 'purpose',
      key: 'purpose',
      width: '25%'
    },
    {
      title: 'На русском',
      dataIndex: 'russian',
      key: 'russian',
      width: '20%',
      render: (text) => <Text code style={{ fontSize: '12px' }}>{text}</Text>
    },
    {
      title: 'На казахском',
      dataIndex: 'kazakh', 
      key: 'kazakh',
      width: '25%',
      render: (text) => <Text code style={{ fontSize: '12px' }}>{text}</Text>
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        <Card title={`Примеры отображения ОП "${opCode}" в разных контекстах`}>
          <Table
            columns={columns}
            dataSource={examples}
            pagination={false}
            size="small"
            rowKey="context"
          />
        </Card>

        <Row gutter={[16, 16]}>
          {/* Пример в форме */}
          <Col span={12}>
            <Card size="small" title="Форма (t1)" bordered>
              <Select 
                value={opCode}
                style={{ width: '100%' }}
                disabled
              >
                <Option value={opCode}>
                  {getDisplayRus(opCode, 't1')}
                </Option>
              </Select>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Полное название с кавычками для ясности
              </Text>
            </Card>
          </Col>

          {/* Пример в таблице */}
          <Col span={12}>
            <Card size="small" title="Таблица (t2)" bordered>
              <div style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                {getDisplayRus(opCode, 't2')}
              </div>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Сокращенный формат для таблиц
              </Text>
            </Card>
          </Col>

          {/* Пример компактного отображения */}
          <Col span={12}>
            <Card size="small" title="Компактное (short)" bordered>
              <Tag color="blue" style={{ margin: 0 }}>
                {getShortRus(opCode)}
              </Tag>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Только название программы
              </Text>
            </Card>
          </Col>

          {/* Пример на казахском */}
          <Col span={12}>
            <Card size="small" title="На казахском (t2)" bordered>
              <div style={{ padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                {getDisplayKaz(opCode, 't2')}
              </div>
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                Автоматическая локализация
              </Text>
            </Card>
          </Col>
        </Row>

      </Space>
    </div>
  );
};

export default OPDisplayExamples;
