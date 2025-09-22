import React, { useState } from 'react';
import { Card, Tabs, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import EducationProgramDemo from '../../components/EducationProgramDemo';
import EducationProgramUsageGuide from '../../components/EducationProgramUsageGuide';
import OPDisplayExamples from '../../components/OPDisplayExamples';

const { TabPane } = Tabs;

const DemoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Только админы могут видеть демо страницу
  if (user?.role !== 'admins') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Card>
          <h2>Доступ запрещен</h2>
          <p>Демо страница доступна только администраторам</p>
          <Button onClick={() => navigate('/profile')}>Вернуться в профиль</Button>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
            >
              Назад
            </Button>
            <span>Демонстрация системы образовательных программ</span>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Обзор системы" key="1">
            <EducationProgramDemo />
          </TabPane>
          
          <TabPane tab="Руководство использования" key="2">
            <EducationProgramUsageGuide />
          </TabPane>
          
          <TabPane tab="Примеры отображения" key="3">
            <OPDisplayExamples />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default DemoPage;
