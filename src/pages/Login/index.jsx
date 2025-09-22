import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Select, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth, useAuthActions } from '../../hooks/useAuth.js';
import './Login.css';

const { Option } = Select;


const Login = () => {
  const { isAuthenticated } = useAuth();
  const { login, getUsers } = useAuthActions();
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    // Очистка localStorage при открытии страницы входа
    if (!isAuthenticated) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Загружаем список пользователей
    loadUsers();
  }, [isAuthenticated]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const result = await getUsers();
      if (result.success) {
        setUsers(result.data.users || []);
      } else {
        message.error(result.error || 'Ошибка загрузки пользователей');
      }
    } catch (error) {
      message.error('Ошибка подключения к серверу');
    } finally {
      setUsersLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);

      if (result.success) {
        message.success('Успешная авторизация!');
      } else {
        message.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const onChange = value => {
    console.log(`selected ${value}`);
  };
  
  const onSearch = value => {
    console.log('search:', value);
  };

  const getUserOptionsByRole = (role) => {
    return users.filter(user => user.role === role);
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      'admins': 'Администраторы',
      'magistrants': 'Магистранты', 
      'doctorants': 'Докторанты',
      'leaders': 'Руководители'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="login-container">
      <Card title="Авторизация в системе" className="login-card">
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Пожалуйста, выберите пользователя!' }]}
          >
            <Select
              size='large'
              showSearch
              placeholder={usersLoading ? "Загрузка пользователей..." : "Выберите себя"}
              optionFilterProp="label"
              onChange={onChange}
              onSearch={onSearch}
              loading={usersLoading}
              disabled={usersLoading}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {['admins', 'leaders', 'magistrants', 'doctorants'].map(role => {
                const roleUsers = getUserOptionsByRole(role);
                if (roleUsers.length === 0) return null;
                
                return (
                  <Select.OptGroup key={role} label={getRoleLabel(role)}>
                    {roleUsers.map(user => (
                      <Option key={user.value} value={user.value} label={user.label}>
                        {user.label}
                      </Option>
                    ))}
                  </Select.OptGroup>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль!' }]}
          >
            <Input.Password size='large' placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              size='large' 
              htmlType="submit" 
              block
              loading={loading}
              disabled={usersLoading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;