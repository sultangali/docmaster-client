import { Card, Button, Row, Col, Alert, Form, Input, Tag, Flex, Select, Badge, Descriptions, List, Avatar, Space as AntSpace, message, Modal } from 'antd';
import { useAuth, useAuthActions } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';
import PhoneInput from "antd-phone-input";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import { Typography } from 'antd';
import { useEducationPrograms } from '../../hooks/useEducationPrograms';
import { useDegrees } from '../../hooks/useDegrees';
import { DegreesUtils } from '../../utils/degrees';
import { EducationUtils } from '../../utils/educationPrograms';
import { usersApi, apiUtils } from '../../services/api';
const { Paragraph, Text } = Typography;

const { Option } = Select;

const customizeRequiredMark = (label, { required }) => (
  <>
    {required ? <Tag color="error">Обязательно</Tag> : <Tag color="warning">Не Обязательно</Tag>}
    {label}
  </>
);

const validator = (_, value) => {
  // Если значение пустое, считаем валидным (поле обязательное, но это проверяется отдельно)
  if (!value) return Promise.resolve();
  
  // Если это объект от PhoneInput компонента
  if (typeof value === 'object' && value.phoneNumber) {
    // Можно добавить дополнительные проверки
    if (value.phoneNumber.length < 6) {
      return Promise.reject("Номер телефона слишком короткий");
    }
    return Promise.resolve();
  }
  
  // Если это строка (старые данные)
  if (typeof value === 'string') {
    if (value.length < 10) {
      return Promise.reject("Номер телефона слишком короткий");
    }
    return Promise.resolve();
  }
  
  return Promise.reject("Неверный формат номера телефона");
}

const Profile = () => {
  const [form] = Form.useForm()
  const { user, setUser } = useAuth()

  console.log('👤 Данные пользователя в Profile:', {
    role: user?.role,
    supervisor: user?.supervisor,
    hasSupervisor: !!user?.supervisor,
    supervisees: user?.supervisees,
    superviseesCount: user?.supervisees?.length || 0
  })

  const [isReadOnly, setIsReadOnly] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [initialValues, setInitialValues] = React.useState({})
  const [messageApi, contextHolder] = message.useMessage()
  const [allStudents, setAllStudents] = React.useState([])

  // Функции для работы с ролями
  const getRoleLabel = (role) => {
    const labels = {
      'admins': 'Администратор',
      'leaders': 'Руководитель',
      'magistrants': 'Магистрант',
      'doctorants': 'Докторант'
    };
    return labels[role] || 'Неизвестно';
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

  const getProfileTitle = (role) => {
    const titles = {
      'admins': 'Административная панель',
      'leaders': 'Личный кабинет руководителя',
      'magistrants': 'Личный кабинет магистранта',
      'doctorants': 'Личный кабинет докторанта'
    };
    return titles[role] || 'Личный кабинет';
  };

  const firstname = "Султан";
  const lastname = "Сайлаубаев";
  const fathername = "Шахмаранович";

  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const items = [
    {
      key: '1',
      label: 'ФИО',
      children: user?.fullName || `${user?.lastname || ''} ${user?.firstname || ''} ${user?.fathername || ''}`.trim(),
    },
    {
      key: '2',
      label: 'Имя пользователя',
      children: user?.username || 'N/A',
    },
    {
      key: '3',
      label: 'Роль',
      children: user?.role === 'admins' ? 'Администратор' : 
               user?.role === 'magistrants' ? 'Магистрант' :
               user?.role === 'doctorants' ? 'Докторант' :
               user?.role === 'leaders' ? 'Руководитель' : 'Неизвестно',
    },
    {
      key: '4',
      label: 'Email',
      children: user?.email || 'N/A',
    },
    {
      key: '5',
      label: 'Последний вход',
      children: user?.lastLogin ? new Date(user.lastLogin).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : 'Первый вход',
    },
    // Степени для руководителей
    ...(user?.role === 'leaders' && user?.degree ? [{
      key: '6',
      label: 'Степени',
      children: DegreesUtils.formatArray(user.degree, user.language, 'd1'),
    }] : []),
    // Руководитель для магистрантов/докторантов
    ...((['magistrants', 'doctorants'].includes(user?.role)) && user?.supervisor ? [{
      key: '7',
      label: 'Руководитель',
      children: user.supervisor?.fullName || 'Не назначен',
    }] : []),
    // Степени руководителя для магистрантов/докторантов
    ...((['magistrants', 'doctorants'].includes(user?.role)) && user?.supervisor?.degree ? [{
      key: '8',
      label: 'Степени руководителя',
      children: DegreesUtils.formatArray(user.supervisor.degree, user.language, 'd2'),
    }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Функция для проверки изменений в форме
  const checkForChanges = (changedFields) => {
    const currentValues = form.getFieldsValue();
    
    // Преобразуем whatsapp для сравнения
    const normalizeWhatsapp = (value) => {
      if (value && typeof value === 'object') {
        const { countryCode, areaCode, phoneNumber } = value;
        return `+${countryCode} ${areaCode} ${phoneNumber}`;
      }
      return value || '';
    };

    const changed = Object.keys(initialValues).some(key => {
      let currentValue = currentValues[key];
      let initialValue = initialValues[key];
      
      // Специальная обработка для whatsapp
      if (key === 'whatsapp') {
        currentValue = normalizeWhatsapp(currentValue);
        initialValue = normalizeWhatsapp(initialValue);
      }
      
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    });
    setHasChanges(changed);
  };

  // Функция для сохранения профиля
  const handleSaveProfile = async (values) => {
    setIsLoading(true);
    
    try {
      // Преобразуем whatsapp объект в строку
      let whatsappString = '';
      if (values.whatsapp && typeof values.whatsapp === 'object') {
        const { countryCode, areaCode, phoneNumber } = values.whatsapp;
        whatsappString = `+${countryCode} ${areaCode} ${phoneNumber}`;
      } else if (typeof values.whatsapp === 'string') {
        whatsappString = values.whatsapp;
      }

      // Подготавливаем данные для отправки
      const updateData = {
        firstname: values.firstname,
        lastname: values.lastname,
        fathername: values.fathername,
        email: values.email,
        language: values.language,
        whatsapp: whatsappString,
        ...((['magistrants', 'doctorants'].includes(user?.role)) && values.OP && { OP: values.OP }),
        ...(user?.role === 'leaders' && values.degree && { degree: values.degree }),
        ...(user?.role === 'leaders' && values.supervisees !== undefined && { supervisees: values.supervisees })
      };

      console.log('Sending update data:', updateData);

      // Отправляем данные на сервер
      const response = await usersApi.updateUser(user._id || user.id, updateData);
      
      if (response.success) {
        
        // Обновляем данные пользователя в контексте
        let updatedUser = { ...user, ...updateData };
        
        // Для руководителей обновляем массив подчиненных с полными объектами
        if (user?.role === 'leaders' && updateData.supervisees) {
          const updatedSupervisees = allStudents.filter(s => updateData.supervisees.includes(s.value));
          updatedUser = { ...updatedUser, supervisees: updatedSupervisees };
        }
        
        setUser(updatedUser);
        
        // Сбрасываем состояния
        const initialValuesForForm = {
          ...updateData,
          supervisees: updateData.supervisees || user?.supervisees?.map(s => s._id || s.id) || []
        };
        setIsReadOnly(true);
        setHasChanges(false);
        setInitialValues(initialValuesForForm);
        
        messageApi.success('Профиль успешно обновлен!');
      } else {
        throw new Error(response.message || 'Ошибка при сохранении профиля');
      }
    } catch (error) {
      const errorMessage = apiUtils.handleApiError(error);
      messageApi.error(`Ошибка при сохранении: ${errorMessage}`);
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция подтверждения отмены изменений
  const handleCancelEdit = () => {
    if (hasChanges) {
      Modal.confirm({
        title: 'Отменить изменения?',
        icon: <ExclamationCircleOutlined />,
        content: 'У вас есть несохраненные изменения. Вы уверены, что хотите их отменить?',
        okText: 'Да, отменить',
        cancelText: 'Продолжить редактирование',
        onOk: () => {
          onFill();
          setIsReadOnly(true);
          setHasChanges(false);
        }
      });
    } else {
      setIsReadOnly(true);
    }
  };

  const onReset = () => {
    form.resetFields();
    setHasChanges(true);
  };

  const onFill = () => {
    // Преобразуем строку whatsapp обратно в объект для PhoneInput
    let whatsappValue = user?.whatsapp || '';
    if (typeof whatsappValue === 'string' && whatsappValue.startsWith('+')) {
      // Парсим строку формата "+7 702 1235625"
      const match = whatsappValue.match(/^\+(\d+)\s(\d+)\s(\d+)$/);
      if (match) {
        whatsappValue = {
          countryCode: parseInt(match[1]),
          areaCode: match[2],
          phoneNumber: match[3],
          isoCode: match[1] === '7' ? 'kz' : 'us' // Простая логика для примера
        };
      }
    }

    const formValues = {
      lastname: user?.lastname || '',
      firstname: user?.firstname || '',
      fathername: user?.fathername || '',
      email: user?.email || '',
      OP: user?.OP || '',
      language: user?.language || '',
      whatsapp: whatsappValue,
      degree: user?.degree || [],
      supervisees: user?.supervisees?.map(s => s._id || s.id) || []
    };
    
    // Для initialValues сохраняем whatsapp как строку
    const initialValuesData = {
      ...formValues,
      whatsapp: user?.whatsapp || ''
    };
    
    form.setFieldsValue(formValues);
    setInitialValues(initialValuesData);
    setHasChanges(false);
  };

  // Используем хук для работы с ОП
const { programOptions: opOptions, getDisplayName, getShortName } = useEducationPrograms(
  user?.role, 
  user?.language || 'Русский'
);

const getOPOptions = () => opOptions;
const getOPDisplayName = (code) => getDisplayName(code, 't2');


const onLangaugeChange = value => {
  const languageMap = {
      'kaz': 'Қазақша',
      'rus': 'Русский'
  };
  form.setFieldsValue({ language: languageMap[value] });
};

  // Функция для загрузки всех студентов
  const loadAllStudents = async () => {
    if (user?.role === 'leaders') {
      try {
        const [magistrantsResponse, doctorantsResponse] = await Promise.all([
          usersApi.getUsersByRole('magistrants'),
          usersApi.getUsersByRole('doctorants')
        ]);
        
        const students = [];
        if (magistrantsResponse.success) {
          students.push(...magistrantsResponse.data.map(s => ({
            ...s,
            label: `${s.fullName || s.lastname + ' ' + s.firstname} (Магистрант)`,
            value: s._id || s.id
          })));
        }
        if (doctorantsResponse.success) {
          students.push(...doctorantsResponse.data.map(s => ({
            ...s,
            label: `${s.fullName || s.lastname + ' ' + s.firstname} (Докторант)`,
            value: s._id || s.id
          })));
        }
        
        setAllStudents(students);
      } catch (error) {
        console.error('Error loading students:', error);
        messageApi.error('Ошибка загрузки списка студентов');
      }
    }
  };

  React.useEffect(() => {
    onFill();
    loadAllStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div position="center" style={{ padding: '24px' }}>
      {contextHolder}
      {user?.username === "admin" ? (<>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={24}>
            <Card
              title={
                <AntSpace>
                  {getProfileTitle(user?.role)}
                  <Tag color={getRoleColor(user?.role)} size="small">
                    {getRoleLabel(user?.role)}
                  </Tag>
                </AntSpace>
              }
              style={{
                minHeight: 180
              }}
              extra={
                <>
                  <Button type="primary" size='large' danger onClick={handleLogout}>
                    Выйти
                  </Button>
                </>
              }
            >
              <Descriptions bordered items={items} />
            </Card>
          </Col>
          <Col lg={24} xs={24}>
            <Card 
              title={
                <AntSpace>
                  <span>Управление системой</span>
                  <Tag color="gold" size="small">Административные функции</Tag>
                </AntSpace>
              } 
              style={{
                minHeight: 180
              }}
            >
              <Row>
                <Col lg={24} xs={24}>
                  <Paragraph style={{ marginBottom: 12, fontSize: '12px', color: '#666' }}>
                    Управление пользователями по ролям
                  </Paragraph>
                </Col>
                 <Col lg={24} xs={24}>
                   <Flex gap={'small'} justify={'start'} wrap>
                     <Button 
                       size='large' 
                       color='primary' 
                       variant="solid"
                       onClick={() => navigate('/magistrants')}
                     >
                       Магистранты
                     </Button>
                     <Button 
                       size='large' 
                       color='danger' 
                       variant="solid"
                       onClick={() => navigate('/doctorants')}
                     >
                       Докторанты
                     </Button>
                     <Button 
                       size='large' 
                       color='pink' 
                       variant="solid"
                       onClick={() => navigate('/leaders')}>
                       Руководители
                     </Button>
                     <Button 
                       size='large' 
                       variant="outlined"
                       onClick={() => navigate('/demo')}
                       style={{ borderColor: '#722ed1', color: '#722ed1' }}
                     >
                       Демо ОП
                     </Button>
                     <Button 
                       size='large' 
                       color='orange' 
                       variant="solid"
                       onClick={() => navigate('/iup2025')}
                     >
                       ИУП 2025
                     </Button>
                   </Flex>
                 </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </>) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <Card
              title={
                <AntSpace>
                  {getProfileTitle(user?.role)}
                  <Tag color={getRoleColor(user?.role)} size="small">
                    {getRoleLabel(user?.role)}
                  </Tag>
                </AntSpace>
              }
              extra={
                <>
                  {isReadOnly ? (
                    <Button 
                      type="link" 
                      size='large' 
                      danger 
                      onClick={() => setIsReadOnly(false)}
                      disabled={isLoading}
                    >
                      Редактировать
                    </Button>
                  ) : (
                    <Button 
                      type="link" 
                      size='large' 
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      {hasChanges ? 'Отменить' : 'Закрыть'}
                    </Button>
                  )}
                  <Button 
                    type="primary" 
                    size='large' 
                    danger 
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    Выйти
                  </Button>
                </>
              }
            >
              <Form
                form={form}
                layout='vertical'
                requiredMark={customizeRequiredMark}
                onValuesChange={checkForChanges}
                onFinish={handleSaveProfile}>
                <Row justify="space-between">
                  <Col lg={7} xs={24}>
                    <Form.Item
                      label="Фамилия"
                      name={'lastname'}
                      tooltip="This is a required field"
                      rules={[{ required: true }]}>
                      <Input size='large' disabled={isReadOnly} placeholder="input placeholder" readOnly={isReadOnly} />
                    </Form.Item>
                  </Col>
                  <Col lg={7} xs={24}>
                    <Form.Item
                      label="Имя"
                      name={'firstname'}
                      tooltip={{ title: 'Tooltip with customize icon', icon: <InfoCircleOutlined /> }}
                      rules={[{ required: true }]}
                    >
                      <Input size='large' disabled={isReadOnly} readOnly={isReadOnly} placeholder="input placeholder" />
                    </Form.Item>
                  </Col>
                  <Col lg={7} xs={24}>
                    <Form.Item
                      label="Отчество"
                      name={'fathername'}
                      tooltip={{ title: 'Tooltip with customize icon', icon: <InfoCircleOutlined /> }}
                      rules={[{ required: false }]}
                    >
                      <Input size='large' disabled={isReadOnly} readOnly={isReadOnly} placeholder="input placeholder" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="space-between">
                  <Col lg={24} xs={24}>
                    <Form.Item
                      label="Email"
                      name={'email'}
                      tooltip={{ title: 'Email адрес для связи', icon: <InfoCircleOutlined /> }}
                      rules={[
                        { required: true, message: 'Введите email' },
                        { type: 'email', message: 'Некорректный email адрес' }
                      ]}
                    >
                      <Input size='large' disabled={isReadOnly} readOnly={isReadOnly} placeholder="example@email.com" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="space-between">
                  {(user?.role === 'magistrants' || user?.role === 'doctorants') && (
                    <Col lg={24} xs={24}>
                      <Form.Item
                        label="Образовательные программы"
                        name="OP"
                        tooltip={{ title: 'Образовательная программа', icon: <InfoCircleOutlined /> }}
                        rules={[{ required: true, message: 'Выберите образовательную программу' }]}>
                        <Select
                          size='large'
                          placeholder="Выберите образовательную программу"
                          disabled={isReadOnly}
                          allowClear>
                          {getOPOptions().map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                  {user?.role === 'leaders' && (
                    <Col lg={24} xs={24}>
                      <Form.Item
                        label="Научные степени"
                        name="degree"
                        tooltip={{ title: 'Ваши научные степени и звания', icon: <InfoCircleOutlined /> }}
                        rules={[{ required: false }]}>
                        <Select
                          size='large'
                          mode="tags"
                          placeholder="Введите или выберите научные степени"
                          disabled={isReadOnly}
                          allowClear
                          style={{ width: '100%' }}
                          tokenSeparators={[',', ';']}
                          options={[
                            { value: 'phd', label: 'PhD' },
                            { value: 'assoc_prof', label: 'Ассоциированный профессор' },
                            { value: 'prof', label: 'Профессор' },
                            { value: 'phd_assoc_prof', label: 'PhD, Ассоциированный профессор' },
                            { value: 'к.т.н.', label: 'Кандидат технических наук' },
                            { value: 'д.т.н.', label: 'Доктор технических наук' },
                            { value: 'к.ф.-м.н.', label: 'Кандидат физико-математических наук' },
                            { value: 'д.ф.-м.н.', label: 'Доктор физико-математических наук' },
                            { value: 'к.э.н.', label: 'Кандидат экономических наук' },
                            { value: 'д.э.н.', label: 'Доктор экономических наук' },
                            { value: 'к.п.н.', label: 'Кандидат педагогических наук' },
                            { value: 'д.п.н.', label: 'Доктор педагогических наук' },
                            { value: 'профессор', label: 'Профессор' },
                            { value: 'доцент', label: 'Доцент' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {user?.role === 'leaders' && (
                    <Col lg={24} xs={24}>
                      <Form.Item
                        label="Подчиненные"
                        name="supervisees"
                        tooltip={{ title: 'Студенты под вашим научным руководством', icon: <InfoCircleOutlined /> }}
                        rules={[{ required: false }]}>
                        <Select
                          size='large'
                          mode="multiple"
                          placeholder="Выберите студентов для научного руководства"
                          disabled={isReadOnly}
                          allowClear
                          style={{ width: '100%' }}
                          loading={allStudents.length === 0}
                          filterOption={(input, option) =>
                            option?.label?.toLowerCase().includes(input.toLowerCase())
                          }
                          options={allStudents}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col lg={11} xs={24}>
                    <Form.Item
                      label="Язык обучения"
                      name={`language`}
                      tooltip={{ title: 'Tooltip with customize icon', icon: <InfoCircleOutlined /> }}
                      rules={[{ required: true }]}>
                      <Select
                        size='large'
                        placeholder="Select a option and change input text above"
                        onChange={onLangaugeChange}
                        disabled={isReadOnly}
                        readOnly={isReadOnly}
                        allowClear>
                        <Option value="kaz">Қазақша</Option>
                        <Option value="rus">Русский</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={11} xs={24}>
                    <Form.Item label="WhatsApp"
                      name={'whatsapp'}
                      tooltip={{ title: 'Номер телефона для WhatsApp', icon: <InfoCircleOutlined /> }}
                      rules={[{ validator, required: true }]}>
                      <PhoneInput size='large' enableSearch readOnly={isReadOnly} disabled={isReadOnly} />
                    </Form.Item>
                  </Col>
                </Row>
                {
                  !isReadOnly ? (
                    <Form.Item>
                      <Flex vertical gap="small" align='end'>
                        <Flex gap="small" wrap>
                          <Button 
                            size='large' 
                            
                            onClick={onFill} 
                            htmlType='button'
                            variant='text'

                            color='cyan'
                     disabled={isLoading}
                          >
                            Вернуть
                          </Button>
                          <Button 
                            size='large' 
                            color='cyan'
                            variant="filled" 
                            htmlType='reset'
                            disabled={isLoading}
                            onClick={() => setHasChanges(true)}
                          >
                            Очистить
                          </Button>
                          <Button 
                            size='large' 
                            variant='solid'
                            color='cyan'
                            htmlType='submit'
                            loading={isLoading}
                            disabled={!hasChanges}
                          >
                            Сохранить
                          </Button>
                        </Flex>
                        {hasChanges && (
                          <Text type="warning" style={{ fontSize: '12px' }}>
                            У вас есть несохраненные изменения
                          </Text>
                        )}
                      </Flex>
                    </Form.Item>
                  ) : (<></>)
                }
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={6}>
            {/* Информация о руководителе для студентов */}
            {(['magistrants', 'doctorants'].includes(user?.role) && user?.supervisor) && (
              <Card 
                title={
                  <AntSpace>
                    <span>Руководитель</span>
                    <Tag color="orange" size="small">Научный руководитель</Tag>
                  </AntSpace>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions 
                  size="small" 
                  column={1}
                  items={[
                    {
                      key: 'supervisor_name',
                      label: 'ФИО',
                      children: user.supervisor.fullName
                    },
                    {
                      key: 'supervisor_degree',
                      label: 'Степени',
                      children: user.supervisor.degree ? 
                        DegreesUtils.formatArray(user.supervisor.degree, user.language, 'd2') : 
                        'Не указаны'
                    },
                    {
                      key: 'supervisor_email',
                      label: 'Email',
                      children: user.supervisor.email || 'Не указан'
                    }
                  ]}
                />
              </Card>
            )}

            {/* Информация о подопечных для руководителей */}
            {(user?.role === 'leaders' && user?.supervisees && user.supervisees.length > 0) && (
              <Card 
                title={
                  <AntSpace>
                    <span>Мои подопечные</span>
                    <Tag color="blue" size="small">{user.supervisees.length}</Tag>
                  </AntSpace>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <List
                  size="small"
                  dataSource={user.supervisees}
                  renderItem={(student) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar size="small" style={{ backgroundColor: student.role === 'magistrants' ? '#1890ff' : '#52c41a' }}>
                          {student.role === 'magistrants' ? 'М' : 'Д'}
                        </Avatar>}
                        title={
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                              {student.fullName || `${student.lastname || ''} ${student.firstname || ''}`.trim()}
                            </div>
                            {student.whatsapp && (
                              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                📱 {student.whatsapp}
                              </div>
                            )}
                          </div>
                        }
                        description={
                          <AntSpace direction="vertical" size={2} style={{ width: '100%' }}>
                            <AntSpace size="small" wrap>
                              <Tag color={student.role === 'magistrants' ? 'blue' : 'green'} size="small">
                                {student.role === 'magistrants' ? 'Магистрант' : 'Докторант'}
                              </Tag>
                            </AntSpace>
                            {student.OP && (
                              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                🎓 {EducationUtils.getLocalizedName(student.OP, student.language || user.language, 't2')}
                              </div>
                            )}
                            {student.email && (
                              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                📧 {student.email}
                              </div>
                            )}
                          </AntSpace>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Заглушка для админов и пользователей без руководителя/подопечных */}
            {((user?.role === 'admins') || 
              (['magistrants', 'doctorants'].includes(user?.role) && !user?.supervisor) ||
              (user?.role === 'leaders' && (!user?.supervisees || user.supervisees.length === 0))) && (
              <Card 
                title="Дополнительная информация"
                size="small"
                style={{ marginBottom: 16 }}
              >
                {user?.role === 'admins' && (
                  <p>Административные функции доступны через кнопки управления.</p>
                )}
                {(['magistrants', 'doctorants'].includes(user?.role) && !user?.supervisor) && (
                  <Alert
                    message="Руководитель не назначен"
                    description="Обратитесь к администратору для назначения научного руководителя."
                    type="info"
                    showIcon
                    size="small"
                  />
                )}
                {(user?.role === 'leaders' && (!user?.supervisees || user.supervisees.length === 0)) && (
                  <Alert
                    message="Подопечные не назначены"
                    description="Администратор может назначить вам студентов для научного руководства."
                    type="info"
                    showIcon
                    size="small"
                  />
                )}
              </Card>
            )}
          </Col>

          <Col xs={24} lg={24}>
            <div className="calendar-scroll-container" style={{
              width: '100%',
              paddingBottom: '10px'
            }}>
              <Flex justify="start" gap={'middle'} align="center" className="action-buttons-container" style={{ 
                height: '100%',
                minWidth: '700px', // Минимальная ширина для всех кнопок
                width: '100%'
              }}>
                <Button size='large' variant="solid" color="primary" disabled style={{
                  height: '100px',
                  width: '220px',
                  borderRadius: '10px',
                  fontSize: '1.5rem',
                  flexShrink: 0 // Не сжимать кнопку
                }} >
                  Пререквизиты
                </Button>
                <Button size='large'  variant="solid" color="danger" onClick={() => navigate('/iup2025')} style={{
                  height: '100px',
                  width: '220px',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0 // Не сжимать кнопку
                }} >
                  ИУП 2025
                </Button>
                {/* <Button
                  size='large'
                  variant="filled"
                  color="cyan"
                  style={{
                    height: '100px',
                    width: '220px',
                    borderRadius: '10px',
                    flexShrink: 0, // Не сжимать кнопку
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: 0,
                  }}
                  disabled
                >
                  Зарубежные<br />консультанты
                </Button> */}
              </Flex>
            </div>
          </Col>

          <Col xs={24} lg={24}>
            {/* Импортируйте локализатор в начале файла:
                 import ruLocale from '@fullcalendar/core/locales/ru';
             */}
            <div
              className="calendar-scroll-container"
              style={{
                position: 'relative',
                minWidth: '100%',
                width: '100%'
              }}>
              <div style={{
                minWidth: '1500px', // Минимальная ширина для корректного отображения календаря
                width: '100%'
              }}>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  weekends={true}
                  firstDay={1}
                  selectable={true}
                  height={420}
                  headerToolbar={false}
                  locale="ru"
                  locales={[]}
                  events={[
                  {
                    start: new Date().toISOString().slice(0, 10),
                    title: 'Сегодня',
                    display: 'list-item',
                  },
                  {
                    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                    end: '2025-09-24',
                    backgroundColor: '#73d13d',
                    display: 'background'
                  },
                  {
                    start: '2025-09-25',
                    title: 'ИУП 2025 крайный срок',
                    display: 'list-item',
                    extendedProps: {
                      isCustom: true
                    }
                  }, 
                
                ]}
                dayCellClassNames={arg => {
                  const y = arg.date.getFullYear();
                  const m = String(arg.date.getMonth() + 1).padStart(2, '0');
                  const d = String(arg.date.getDate()).padStart(2, '0');
                  const today = new Date().toISOString().slice(0, 10);
                  if (`${y}-${m}-${d}` === '2025-09-25') {
                    return ['custom-red-cell', 'white-day-number'];
                  }
                  if (`${y}-${m}-${d}` === today) {
                    return ['custom-today-cell', 'white-day-number'];
                  }
                  return ['black-day-number'];
                }}
                eventContent={(eventInfo) => {
                  // Для кастомных ивентов (например, дедлайн)
                  if (eventInfo.event.extendedProps && eventInfo.event.extendedProps.isCustom) {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: 16 }}>
                        <span style={{ fontWeight: 700, color: 'white', marginLeft: '12px' }}>
                          {eventInfo.event.title}
                        </span>
                      </div>
                    );
                  }
                  // Для обычных ивентов (например, сегодня)
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px', fontSize: 16, color: 'white', fontWeight: 700 }}>
                      {eventInfo.event.title}
                    </div>
                  );
                }}
              />
              <style>
                {`
                   .custom-red-cell {
                     background: #ff4d4f !important;
                   }
                   .custom-today-cell  {
                     background: #4096ff !important;
                   }
                   /* Белый цвет номера дня для "Сегодня" и "Дедлайн" */
                   .white-day-number .fc-daygrid-day-number {
                     color: #fff !important;
                   }
                   /* Черный цвет номера дня для остальных */
                   .black-day-number .fc-daygrid-day-number {
                     color: #222 !important;
                   }
                   /* Явно делаем текст событий белым на цветном фоне */
                   .fc-event-main {
                     color: #fff !important;
                   }
                   /* Убираем лишние полосы, если они есть */
                   .fc-daygrid-event-dot {
                     display: none !important;
                   }
                 `}
              </style>
              </div>
            </div>
          </Col>
        </Row>
      )}

    </div>
  );
};

export default Profile;