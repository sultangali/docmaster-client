import React from 'react';
import { Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserManagement from '../../components/UserManagement';

const Leaders = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profile');
  };

  const title = (
    <Space>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBack}
        variant="filled"
        color="primary"
        size="large"
      >
        Назад
      </Button>
      <span style={{marginLeft: '10px'}}>Управление руководителями</span>
    </Space>
  );

  return (
    <UserManagement 
      role="leaders" 
      title={title}
    />
  );
};

export default Leaders;