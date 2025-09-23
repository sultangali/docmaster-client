import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Card, 
  Button, 
  Spin, 
  Alert, 
  Row, 
  Col,
  Space,
  Badge,
  Divider,
  Input,
  Select,
  Tag,
  Statistic,
  Progress,
  Table,
  message
} from 'antd';
import { 
  ArrowLeftOutlined, 
  BookOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useEducationPrograms } from '../../hooks/useEducationPrograms';

import api from '../../services/api';
import StudentStageView from './components/StudentStageView';
import SupervisorView from './components/SupervisorView';
import AdminView from './components/AdminView';
import './IUP2025.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const IUP2025 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [iupData, setIupData] = useState(null);
  const [superviseesData, setSuperviseesData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    educationProgram: '',
    language: '',
    status: ''
  });

  const { getDisplayName: getDisplayRus, getShortName: getShortRus } = useEducationPrograms('magistrants', 'Русский');
  const { getDisplayName: getDisplayKaz, getShortName: getShortKaz } = useEducationPrograms('magistrants', 'Қазақша');


  const getDisplayWithLanguage = (language, OP) => {
    switch(language) {
      case 'Русский':
        return getDisplayRus(OP,'t2');
      case 'Қазақша':
        return getDisplayKaz(OP,'t2');
      default:
        return getDisplayRus(OP,'t2');
    }
  }


  const loadIUPData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user.role === 'magistrants') {
        // Загружаем ИУП для магистранта
        const response = await api.get('/iup');
        console.log('IUP API Response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          // Новая структура API
          setIupData(response.data.data.iup);
        } else if (response.data && response.data.iup) {
          // Старая/временная структура API
          setIupData(response.data.iup);
        } else {
          throw new Error('Неверная структура ответа API');
        }
      } else if (user.role === 'leaders') {
        // Загружаем список подопечных для руководителя
        console.log('🔍 Making request for supervisees. User:', {
          role: user.role,
          fullName: user.fullName,
          _id: user._id
        });
        
        const response = await api.get('/iup/supervisees');
        console.log('Supervisees API Response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          // Новая структура API
          console.log('✅ Using new API structure, supervisees count:', response.data.data.supervisees?.length);
          setSuperviseesData(response.data.data.supervisees);
        } else if (response.data && response.data.supervisees) {
          // Старая/временная структура API
          console.log('✅ Using old API structure, supervisees count:', response.data.supervisees?.length);
          setSuperviseesData(response.data.supervisees);
        } else {
          console.error('❌ Invalid API response structure:', response.data);
          throw new Error('Неверная структура ответа API');
        }
      } else if (user.role === 'admins') {
        // Загружаем все ИУП для админа
        const response = await api.get('/iup');
        console.log('Admin IUP API Response:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.iups) {
          // Новая структура API
          setSuperviseesData(response.data.data.iups.map(iup => ({
            ...iup.student,
            iup: iup,
            hasIup: true,
            progress: iup.progress,
            currentStageTitle: iup.currentStageData?.title || 'Не определен',
            stagesRequiringAttention: iup.stages?.filter(s => 
              s.status === 'submitted' || s.status === 'supervisor_approved' || s.status === 'admin_review'
            ).length || 0
          })));
        } else if (response.data && response.data.iups) {
          // Старая/временная структура API
          setSuperviseesData(response.data.iups.map(iup => ({
            ...iup.student,
            iup: iup,
            hasIup: true,
            progress: iup.progress,
            currentStageTitle: iup.currentStageData?.title || 'Не определен',
            stagesRequiringAttention: iup.stages?.filter(s => 
              s.status === 'submitted' || s.status === 'supervisor_approved' || s.status === 'admin_review'
            ).length || 0
          })));
        } else {
          throw new Error('Неверная структура ответа API для админа');
        }
      }
    } catch (error) {
      console.error('Error loading IUP data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка загрузки данных ИУП';
      setError(errorMessage);
      message.error(`Ошибка загрузки данных ИУП: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role) {
      loadIUPData();
    }
  }, [user, loadIUPData]);

  const handleStudentSelect = async (studentId) => {
    try {
      setLoading(true);
      let studentIup = null;

      if (user.role === 'leaders') {
        // Для руководителя получаем ИУП конкретного студента
        const response = await api.get(`/iup?studentId=${studentId}`);
        console.log('Leader student IUP response:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.iups) {
          // Новая структура API
          studentIup = response.data.data.iups[0];
        } else if (response.data && response.data.iups) {
          // Старая/временная структура API
          studentIup = response.data.iups[0];
        }
      } else if (user.role === 'admins') {
        // Для админа также получаем ИУП конкретного студента
        const response = await api.get(`/iup?studentId=${studentId}`);
        console.log('Admin student IUP response:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.iups) {
          // Новая структура API
          studentIup = response.data.data.iups[0];
        } else if (response.data && response.data.iups) {
          // Старая/временная структура API
          studentIup = response.data.iups[0];
        }
      }

      if (studentIup) {
        setIupData(studentIup);
        setSelectedStudent(studentId);
      } else {
        message.error('ИУП для данного студента не найден');
      }
    } catch (error) {
      console.error('Error loading student IUP:', error);
      message.error('Ошибка загрузки ИУП студента');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setIupData(null);
    loadIUPData();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'not_started': 'default',
      'in_progress': 'processing',
      'submitted': 'warning',
      'supervisor_review': 'warning',
      'supervisor_approved': 'success',
      'admin_review': 'warning',
      'admin_approved': 'success',
      'completed': 'success',
      'rejected': 'error'
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'not_started': null,
      'in_progress': <ClockCircleOutlined />,
      'submitted': <ExclamationCircleOutlined />,
      'supervisor_review': <ExclamationCircleOutlined />,
      'supervisor_approved': <CheckCircleOutlined />,
      'admin_review': <ExclamationCircleOutlined />,
      'admin_approved': <CheckCircleOutlined />,
      'completed': <CheckCircleOutlined />,
      'rejected': <ExclamationCircleOutlined />
    };
    return icons[status] || null;
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'not_started': 'Не начато',
      'in_progress': 'В процессе',
      'submitted': 'Отправлено на проверку',
      'supervisor_review': 'На проверке у руководителя',
      'supervisor_approved': 'Одобрено руководителем',
      'admin_review': 'На проверке у админа',
      'admin_approved': 'Одобрено админом',
      'completed': 'Завершено',
      'rejected': 'Отклонено'
    };
    return statusTexts[status] || status;
  };

  const filteredSupervisees = superviseesData.filter(supervisee => {
    const matchesSearch = supervisee.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         supervisee.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesOP = !filters.educationProgram || supervisee.OP === filters.educationProgram;
    const matchesLanguage = !filters.language || supervisee.language === filters.language;
    const matchesStatus = !filters.status || supervisee.iup?.overallStatus === filters.status;
    
    return matchesSearch && matchesOP && matchesLanguage && matchesStatus;
  });

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Spin size="large" tip="Загрузка данных ИУП..." />
        </Content>
      </Layout>
    );
  }

  // Если выбран конкретный студент, показываем его ИУП
  if (selectedStudent && iupData) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 20px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToList}
              size="large"
            >
              Назад к списку
            </Button>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              ИУП 2025 - {iupData.student?.fullName}
            </Title>
          </Space>
          <Badge count={iupData.currentStage} showZero color="#1890ff" />
        </Header>
        
        <Content style={{ padding: '20px' }}>
          {user.role === 'leaders' ? (
            <SupervisorView 
              iupData={iupData} 
              onUpdate={loadIUPData}
              onBack={handleBackToList}
            />
          ) : (
            <AdminView 
              iupData={iupData} 
              onUpdate={loadIUPData}
              onBack={handleBackToList}
            />
          )}
        </Content>
      </Layout>
    );
  }

  // Определяем, нужно ли применить режим ПК (для магистрантов на 2 этапе)
  const isPCMode = user.role === 'magistrants' && 
                   iupData && 
                   iupData.currentStage === 2 && 
                   iupData.stages?.find(s => s.stageNumber === 2)?.stageType === 'dissertation_application';

  return (
    <Layout style={{ minHeight: '100vh', background: isPCMode ? '#f0f2f5' : '#f0f2f5' }} className={isPCMode ? 'iup-pc-mode' : ''}>
      <Header style={{ 
        background: isPCMode ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' : '#fff', 
        padding: '0 20px', 
        boxShadow: isPCMode ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space>
          <Button 
            type={isPCMode ? 'primary' : 'text'}
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/profile')}
            size="large"
            style={isPCMode ? { 
              background: 'rgba(255,255,255,0.2)', 
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white'
            } : {}}
          >
            Назад в профиль
          </Button>
          <Title level={3} style={{ margin: 0, color: isPCMode ? 'white' : '#1890ff' }}>
            ИУП 2025
          </Title>
        </Space>
        {user.role === 'magistrants' && iupData && (
          <Badge 
            count={iupData.currentStage} 
            showZero 
            color={isPCMode ? '#52c41a' : '#1890ff'}
            style={isPCMode ? { 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)'
            } : {}}
          />
        )}
      </Header>
      
      <Content style={{ padding: isPCMode ? '0' : '20px', background: isPCMode ? '#f0f2f5' : 'transparent' }}>
        {user.role === 'magistrants' ? (
          // Вид для магистранта
          error ? (
            <Card>
              <Alert
                message="Ошибка загрузки ИУП"
                description={
                  <div>
                    <p>{error}</p>
                    <Button 
                      type="primary" 
                      onClick={loadIUPData}
                      style={{ marginTop: 12 }}
                    >
                      Попробовать снова
                    </Button>
                  </div>
                }
                type="error"
                showIcon
              />
            </Card>
          ) : iupData ? (
            <StudentStageView iupData={iupData} onUpdate={loadIUPData} />
          ) : loading ? (
            <Card>
              <Alert
                message="Загрузка ИУП"
                description="Подождите, идет загрузка ваших данных ИУП..."
                type="info"
                showIcon
              />
            </Card>
          ) : (
            <Card>
              <Alert
                message="ИУП не найден"
                description={
                  <div>
                    <p>Ваш ИУП еще не создан.</p>
                    <p>Возможные причины:</p>
                    <ul>
                      <li>У вас не назначен научный руководитель</li>
                      <li>ИУП находится в процессе создания</li>
                    </ul>
                    <p><strong>Обратитесь к администратору для решения этой проблемы.</strong></p>
                  </div>
                }
                type="warning"
                showIcon
              />
            </Card>
          )
        ) : (user.role === 'leaders' || user.role === 'admins') ? (
          // Список подопечных для руководителя или всех студентов для админа
          <div>
            {/* Статистика */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8} md={6}>
                <Card className="iup-stats-card">
                  <Statistic
                    title={user.role === 'leaders' ? 'Мои подопечные' : 'Всего магистрантов'}
                    value={filteredSupervisees.length}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card className="iup-stats-card">
                  <Statistic
                    title="Требуют внимания"
                    value={filteredSupervisees.filter(s => (s.stagesRequiringAttention || 0) > 0).length}
                    prefix={<ExclamationCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card className="iup-stats-card">
                  <Statistic
                    title="Завершили ИУП"
                    value={filteredSupervisees.filter(s => (s.progress || 0) === 100).length}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Card className="iup-stats-card">
                  <Statistic
                    title="Средний прогресс "
                    
                    value={Math.round(filteredSupervisees.reduce((acc, s) => acc + (s.progress || 0), 0) / (filteredSupervisees.length || 1))}
                    suffix="%"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: 'orange' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Фильтры */}
            <Card style={{ marginBottom: 24 }}>
              <Space wrap style={{ marginBottom: 16 }}>
                <SearchOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                <Text strong>Фильтры и поиск</Text>
              </Space>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Input
                    placeholder="Поиск по имени или email"
                    prefix={<SearchOutlined />}
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    allowClear
                  />
                </Col>
                {user.role === 'admins' && (
                  <>
                    <Col xs={24} sm={6} md={5}>
                      <Select
                        placeholder="Образовательная программа"
                        style={{ width: '100%' }}
                        value={filters.educationProgram}
                        onChange={(value) => setFilters(prev => ({ ...prev, educationProgram: value }))}
                        allowClear
                      >
                        <Option value="7M01503">7M01503</Option>
                        <Option value="7M06101">7M06101</Option>
                        <Option value="7M06104">7M06104</Option>
                        <Option value="8D01103">8D01103</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={6} md={5}>
                      <Select
                        placeholder="Язык обучения"
                        style={{ width: '100%' }}
                        value={filters.language}
                        onChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
                        allowClear
                      >
                        <Option value="Қазақша">Қазақша</Option>
                        <Option value="Русский">Русский</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={6} md={6}>
                      <Select
                        placeholder="Статус ИУП"
                        style={{ width: '100%' }}
                        value={filters.status}
                        onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        allowClear
                      >
                        <Option value="draft">Черновик</Option>
                        <Option value="in_progress">В процессе</Option>
                        <Option value="supervisor_review">На проверке у руководителя</Option>
                        <Option value="admin_review">На проверке у админа</Option>
                        <Option value="completed">Завершен</Option>
                      </Select>
                    </Col>
                  </>
                )}
              </Row>
            </Card>

            {/* Список студентов в табличном формате */}
            <Card title={
              <Space>
                <BookOutlined />
                {user.role === 'leaders' ? 'Мои подопечные магистранты' : 'Все магистранты'}
                <Badge count={filteredSupervisees.length} showZero style={{ backgroundColor: '#52c41a' }} />
              </Space>
            }>
              <Table
                dataSource={filteredSupervisees.filter(item => item && item._id)}
                rowKey={record => record._id || record.email || Math.random().toString()}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} магистрантов`
                }}
                columns={[
                  {
                    title: 'ФИО магистранта',
                    dataIndex: 'fullName',
                    key: 'fullName',
                    width: 200,
                    fixed: 'left',
                    sorter: (a, b) => {
                      const nameA = a.fullName || '';
                      const nameB = b.fullName || '';
                      return nameA.localeCompare(nameB, 'ru');
                    },
                    defaultSortOrder: 'ascend',
                    render: (text, record) => (
                      <div>
                        <Text strong style={{ fontSize: 14 }}>{text || 'Имя не указано'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ID: {record._id ? record._id.slice(-6) : 'Нет ID'}
                        </Text>
                      </div>
                    )
                  },
                  {
                    title: 'WhatsApp / Email',
                    dataIndex: 'email',
                    key: 'contact',
                    width: 180,
                    render: (email, record) => (
                      <div>
                        {record.whatsapp ? (
                          <div>
                            <Text style={{ fontSize: 13 }}>📱 {record.whatsapp}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>✉️ {email || 'Email не указан'}</Text>
                          </div>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 13 }}>✉️ {email || 'Email не указан'}</Text>
                        )}
                      </div>
                    )
                  },
                  {
                    title: 'ОП',
                    dataIndex: 'OP',
                    key: 'OP',
                    width: 120,
                    filters: [
                      { text: '7M01503', value: '7M01503' },
                      { text: '7M06101', value: '7M06101' },
                      { text: '7M06104', value: '7M06104' },
                      { text: '8D01103', value: '8D01103' }
                    ],
                    onFilter: (value, record) => record.OP === value,
                    render: (op) => <Tag color="blue" style={{ fontSize: 12 }}>{op || 'Не указано'}</Tag>
                  },
                  {
                    title: 'Язык обучения',
                    dataIndex: 'language',
                    key: 'language',
                    width: 120,
                    filters: [
                      { text: 'Қазақша', value: 'Қазақша' },
                      { text: 'Русский', value: 'Русский' }
                    ],
                    onFilter: (value, record) => record.language === value,
                    render: (language) => <Tag color="green" style={{ fontSize: 12 }}>{language || 'Не указано'}</Tag>
                  },
                  {
                    title: 'Текущий этап',
                    key: 'currentStage',
                    width: 180,
                    render: (_, record) => (
                      record.hasIup ? (
                        <div>
                          <Text style={{ fontSize: 13 }}>{record.currentStageTitle || 'Этап не определен'}</Text>
                          {(record.stagesRequiringAttention || 0) > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <Badge 
                                count={record.stagesRequiringAttention}
                                text="требуют внимания"
                                style={{ backgroundColor: '#faad14', fontSize: 11 }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>ИУП не создан</Text>
                      )
                    )
                  },
                  {
                    title: 'Статус этапа',
                    key: 'stageStatus',
                    width: 150,
                    filters: [
                      { text: 'Не начато', value: 'not_started' },
                      { text: 'В процессе', value: 'in_progress' },
                      { text: 'На проверке у руководителя', value: 'supervisor_review' },
                      { text: 'Одобрено руководителем', value: 'supervisor_approved' },
                      { text: 'На проверке у админа', value: 'admin_review' },
                      { text: 'Завершен', value: 'completed' }
                    ],
                    onFilter: (value, record) => {
                      if (value === 'not_started') return !record.hasIup;
                      return record.iup?.overallStatus === value;
                    },
                    render: (_, record) => (
                      record.hasIup ? (
                        <Tag 
                          color={getStatusColor(record.iup?.overallStatus)}
                          icon={getStatusIcon(record.iup?.overallStatus)}
                          style={{ fontSize: 11 }}
                        >
                          {getStatusText(record.iup?.overallStatus)}
                        </Tag>
                      ) : (
                        <Tag color="default" style={{ fontSize: 11 }}>Не начато</Tag>
                      )
                    )
                  },
                  {
                    title: 'Прогресс',
                    key: 'progress',
                    width: 120,
                    sorter: (a, b) => (a.progress || 0) - (b.progress || 0),
                    render: (_, record) => (
                      record.hasIup ? (
                        <Progress 
                          percent={record.progress} 
                          size="small"
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                          format={percent => `${percent}%`}
                        />
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
                      )
                    )
                  }, {
                    title: 'Действия',
                    key: 'actions',
                    width: 130,
                    fixed: 'right',
                    render: (_, record) => (
                      <Button
                        type="primary"
                        size="small"
                        icon={user.role === 'leaders' ? <EditOutlined /> : <EyeOutlined />}
                        onClick={() => record._id && handleStudentSelect(record._id)}
                        disabled={!record.hasIup || !record._id}
                        style={{ fontSize: 12 }}
                      >
                        {user.role === 'leaders' ? 'Работать с ИУП' : 'Просмотр ИУП'}
                      </Button>
                    )
                  }
                ]}
                scroll={{ x: 1200 }}
                size="small"
                bordered
                className="iup-students-table"
              />
            </Card>
          </div>
        ) : (
          <Alert
            message="Доступ ограничен"
            description="У вас нет доступа к данной странице."
            type="warning"
            showIcon
          />
        )}
      </Content>
    </Layout>
  );
};

export default IUP2025;
