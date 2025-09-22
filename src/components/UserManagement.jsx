import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  Card,
  Row,
  Col 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  UserOutlined 
} from '@ant-design/icons';
import PhoneInput from "antd-phone-input";
import { usersApi } from '../services/api';
import { useEducationPrograms } from '../hooks/useEducationPrograms';
import { EducationUtils } from '../utils/educationPrograms';
import { useDegrees } from '../hooks/useDegrees';
import { DegreesUtils } from '../utils/degrees';

const { Option } = Select;

const UserManagement = ({ role, title }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
    if (role === 'leaders' || role === 'all') {
      loadAvailableStudents();
    }
  }, [role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = role === 'all' 
        ? await usersApi.getUsers()
        : await usersApi.getUsersByRole(role);
      
      if (response.success) {
        // Обрабатываем разные структуры ответа
        let usersData = [];
        if (response.data) {
          // Если есть response.data.users (обычный формат)
          if (response.data.users) {
            usersData = response.data.users;
          }
          // Если данные находятся прямо в response.data (формат getUsersByRole)
          else if (Array.isArray(response.data)) {
            usersData = response.data;
          }
          // Если response.data - это объект с пользователями
          else if (response.data.data && Array.isArray(response.data.data)) {
            usersData = response.data.data;
          }
        }
        
        setUsers(usersData || []);
      } else {
        console.error('API Error:', response);
        message.error(response.message || 'Ошибка загрузки пользователей');
        setUsers([]);
      }
    } catch (error) {
      console.error('Load users error:', error);
      message.error('Ошибка подключения к серверу');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      // Загружаем магистрантов и докторантов
      const [magistrantsResponse, doctorantsResponse] = await Promise.all([
        usersApi.getUsersByRole('magistrants'),
        usersApi.getUsersByRole('doctorants')
      ]);
      
      // Извлекаем данные с учетом разных структур ответа
      const extractUsers = (response) => {
        if (!response.success || !response.data) return [];
        
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.users) {
          return response.data.users;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        
        return [];
      };
      
      const allStudents = [
        ...extractUsers(magistrantsResponse),
        ...extractUsers(doctorantsResponse)
      ];
      
      
      // Формируем опции для Select
      const studentOptions = allStudents.map(student => ({
        value: student._id,
        label: `${student.fullName || student.lastname + ' ' + student.firstname} (${student.role === 'magistrants' ? 'Магистрант' : 'Докторант'})`,
        role: student.role
      }));
      
      setAvailableStudents(studentOptions);
    } catch (error) {
      console.error('Ошибка загрузки студентов:', error);
      setAvailableStudents([]);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    if (role !== 'all') {
      form.setFieldsValue({ role });
    }
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      ...user,
      whatsapp: user.whatsapp,
      password: '', // Не показываем текущий пароль
      supervisees: user.supervisees?.map(s => s._id || s) || [] // Обрабатываем supervisees
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    try {
      const response = await usersApi.deleteUser(userId);
      if (response.success) {
        message.success('Пользователь деактивирован');
        loadUsers();
      } else {
        message.error(response.message || 'Ошибка деактивации пользователя');
      }
    } catch (error) {
      message.error('Ошибка подключения к серверу');
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Удаляем пароль из данных если он пустой (для обновления)
      if (editingUser && !values.password) {
        delete values.password;
      }

      // Обрабатываем WhatsApp данные если это объект PhoneInput
      if (values.whatsapp && typeof values.whatsapp === 'object') {
        const { countryCode, areaCode, phoneNumber } = values.whatsapp;
        values.whatsapp = `+${countryCode}${areaCode}${phoneNumber}`;
      }

      console.log('Отправляемые данные:', values);

      const response = editingUser
        ? await usersApi.updateUser(editingUser._id, values)
        : await usersApi.createUser(values);
      
      // Если это руководитель, обновляем связи
      if (response.success && values.role === 'leaders') {
        const leaderId = response.data.user?._id || editingUser?._id;
        
        if (leaderId) {
          console.log('Обновляем связи руководитель-подопечный...');
          
          // Получаем старый список подопечных для очистки связей
          const oldSupervisees = editingUser?.supervisees?.map(s => s._id || s) || [];
          const newSupervisees = values.supervisees || [];
          
          // Убираем связи у студентов, которые больше не в списке
          const removedStudents = oldSupervisees.filter(id => !newSupervisees.includes(id));
          console.log('Удаляем связи для студентов:', removedStudents);
          
          for (const studentId of removedStudents) {
            try {
              await usersApi.updateUser(studentId, { supervisor: null });
              console.log(`✅ Убрана связь с руководителем для студента ${studentId}`);
            } catch (error) {
              console.error(`❌ Ошибка удаления связи для студента ${studentId}:`, error);
            }
          }
          
          // Устанавливаем связи для новых подопечных
          console.log('Устанавливаем связи для студентов:', newSupervisees);
          
          for (const studentId of newSupervisees) {
            try {
              const updateResponse = await usersApi.updateUser(studentId, { supervisor: leaderId });
              if (updateResponse.success) {
                console.log(`✅ Установлена связь с руководителем для студента ${studentId}`);
              } else {
                console.error(`❌ Ошибка при установке связи для студента ${studentId}:`, updateResponse.message);
              }
            } catch (error) {
              console.error(`❌ Ошибка обновления руководителя для студента ${studentId}:`, error);
            }
          }
        }
      }

      if (response.success) {
        message.success(editingUser ? 'Пользователь обновлен' : 'Пользователь создан');
        setModalVisible(false);
        loadUsers();
      } else {
        message.error(response.message || 'Ошибка сохранения пользователя');
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      message.error('Ошибка подключения к серверу');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'admins': 'red',
      'leaders': 'purple',
      'magistrants': 'blue',
      'doctorants': 'green'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admins': 'Администратор',
      'leaders': 'Руководитель',
      'magistrants': 'Магистрант',
      'doctorants': 'Докторант'
    };
    return labels[role] || role;
  };

  const phoneValidator = (_, value) => {
    if (!value) {
      return Promise.reject('Введите номер WhatsApp');
    }
    
    // Если это объект PhoneInput с методом valid
    if (typeof value === 'object' && value.valid && typeof value.valid === 'function') {
      if (value.valid()) return Promise.resolve();
      return Promise.reject("Некорректный номер телефона");
    }
    
    // Если это строка, проверяем базовую валидацию
    if (typeof value === 'string') {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (phoneRegex.test(value.replace(/\s/g, ''))) {
        return Promise.resolve();
      }
      return Promise.reject("Некорректный номер телефона");
    }
    
    // Если это объект PhoneInput без метода valid
    if (typeof value === 'object' && value.phoneNumber) {
      const { countryCode, phoneNumber } = value;
      if (countryCode && phoneNumber && phoneNumber.length >= 6) {
        return Promise.resolve();
      }
      return Promise.reject("Некорректный номер телефона");
    }
    
    return Promise.reject("Некорректный номер телефона");
  };

  const columns = [
    {
      title: 'ФИО',
      key: 'fullName',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.fullName}</span>
        </Space>
      ),
    },
    {
      title: 'Имя пользователя',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleLabel(role)}
        </Tag>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'WhatsApp',
      dataIndex: 'whatsapp',
      key: 'whatsapp',
    },
    {
      title: 'Язык',
      dataIndex: 'language',
      key: 'language',
    },
    ...(role === 'leaders' || role === 'all' ? [{
      title: 'Степени',
      dataIndex: 'degree',
      key: 'degree',
      render: (degrees, record) => {
        if (!degrees || !Array.isArray(degrees) || degrees.length === 0) return '-';
        return DegreesUtils.formatArray(degrees, record.language, 'd2');
      }
    }] : []),
    ...(role === 'magistrants' || role === 'doctorants' || role === 'all' ? [{
      title: 'ОП',
      dataIndex: 'OP',
      key: 'OP',
      render: (opCode, record) => {
        if (!opCode) return '-';
        // Используем t2 для таблицы - сокращенный читаемый формат
        return getOPDisplayName(opCode, record.language);
      }
    }] : []),
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Вы уверены?"
            description="Пользователь будет деактивирован"
            onConfirm={() => handleDelete(record._id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Деактивировать
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Получаем текущие значения из формы
  const selectedRole = Form.useWatch('role', form);
  const selectedLanguage = Form.useWatch('language', form);
  
  // Используем хук для получения опций ОП
  const { programOptions, getDisplayName } = useEducationPrograms(
    selectedRole, 
    selectedLanguage || 'Русский'
  );
  
  // Используем хук для получения опций степеней
  const { degreeOptions } = useDegrees(selectedLanguage || 'Русский', 'd1');
  
  const getOPDisplayName = (code, userLanguage = 'Русский') => {
    // Используем напрямую EducationUtils без хуков
    return EducationUtils.getLocalizedName(code, userLanguage, 't2');
  };

  return (
    <Card title={title} style={{ margin: '24px' }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <h3>Всего пользователей: {users ? users.length : 0}</h3>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadUsers}
              loading={loading}
            >
              Обновить
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Добавить пользователя
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={users || []}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Всего ${total} записей`,
        }}
      />

      <Modal
        title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lastname"
                label="Фамилия"
                rules={[{ required: true, message: 'Введите фамилию' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="firstname"
                label="Имя"
                rules={[{ required: true, message: 'Введите имя' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fathername"
            label="Отчество"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email адрес' }
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Роль"
                rules={[{ required: true, message: 'Выберите роль' }]}
              >
                <Select disabled={role !== 'all'}>
                  <Option value="admins">Администратор</Option>
                  <Option value="leaders">Руководитель</Option>
                  <Option value="magistrants">Магистрант</Option>
                  <Option value="doctorants">Докторант</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="language"
                label="Язык обучения"
                rules={[{ required: true, message: 'Выберите язык' }]}
              >
                <Select>
                  <Option value="Қазақша">Қазақша</Option>
                  <Option value="Русский">Русский</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {selectedRole === 'admins' && (
            <Form.Item
              name="password"
              label={editingUser ? "Новый пароль (оставьте пустым для сохранения текущего)" : "Пароль"}
              rules={[
                { 
                  required: !editingUser, 
                  message: 'Введите пароль для администратора' 
                },
                { 
                  min: 6, 
                  message: 'Пароль должен быть не менее 6 символов' 
                }
              ]}
            >
              <Input.Password placeholder="Введите пароль администратора" />
            </Form.Item>
          )}

          {(selectedRole === 'magistrants' || selectedRole === 'doctorants') && (
            <Form.Item
              name="OP"
              label="Образовательная программа"
              rules={[{ required: true, message: 'Выберите образовательную программу' }]}
            >
              <Select>
                {/* В форме используем t1 - полное название для ясности выбора */}
                {programOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label} {/* это t1 формат из хука */}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {selectedRole === 'leaders' && (
            <>
              <Form.Item
                name="degree"
                label="Степени"
                rules={[{ required: true, message: 'Выберите хотя бы одну степень' }]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Выберите степени"
                  options={degreeOptions}
                />
              </Form.Item>
              
              <Form.Item
                name="supervisees"
                label="Подопечные (магистранты/докторанты)"
                tooltip="Выберите студентов, которыми будет руководить данный преподаватель"
              >
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Выберите подопечных"
                  options={availableStudents}
                  showSearch
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="whatsapp"
            label="WhatsApp"
            rules={[
              { validator: phoneValidator }
            ]}
          >
            <PhoneInput enableSearch />
          </Form.Item>

          {selectedRole === 'admins' && (
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px', 
              padding: '12px',
              marginTop: '16px'
            }}>
              <strong>Примечание:</strong> Администраторы используют индивидуальный пароль для входа. 
              Остальные роли используют общий пароль системы.
            </div>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;