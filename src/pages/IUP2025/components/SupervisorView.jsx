import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Badge,
  Divider,
  message,
  Modal,
  Progress,
  Tag,
  Descriptions
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  SendOutlined,
  UserOutlined,
  CloseOutlined
} from '@ant-design/icons';
import api from '../../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SupervisorView = ({ iupData, onUpdate, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStageData, setCurrentStageData] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useEffect(() => {
    if (iupData && iupData.stages) {
      const current = iupData.stages.find(stage => stage.stageNumber === iupData.currentStage);
      setCurrentStageData(current);
      
      // Заполняем форму данными студента для редактирования
      if (current) {
        if (current.stageType === 'dissertation_topic') {
          // Заполняем форму темы диссертации
          form.setFieldsValue({
            topicKazakh: current.studentData?.dissertationTopic?.kazakh || '',
            topicRussian: current.studentData?.dissertationTopic?.russian || '',
            topicEnglish: current.studentData?.dissertationTopic?.english || '',
            comments: current.supervisorEdits?.comments || ''
          });
        } else {
          // Заполняем универсальную форму
          form.setFieldsValue({
            textData: current.studentData?.textData || '',
            comments: current.supervisorEdits?.comments || ''
          });
        }
      }
    }
  }, [iupData, form]);

  const getStatusColor = (status) => {
    const colors = {
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
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
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
    return texts[status] || status;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const formData = form.getFieldsValue();
      
      // Подготавливаем данные для отправки
      let updateData = {
        supervisorEdits: {
          ...formData,
          editedAt: new Date()
        }
      };

      // Если это этап темы диссертации, сохраняем в правильном формате
      if (currentStageData.stageType === 'dissertation_topic') {
        updateData.supervisorEdits.dissertationTopic = {
          kazakh: formData.topicKazakh,
          russian: formData.topicRussian,
          english: formData.topicEnglish
        };
        // Удаляем отдельные поля, оставляем только вложенную структуру
        delete updateData.supervisorEdits.topicKazakh;
        delete updateData.supervisorEdits.topicRussian;
        delete updateData.supervisorEdits.topicEnglish;
      }

      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, updateData);
      
      message.success('Изменения сохранены');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      message.error('Ошибка при сохранении изменений');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      
      // Сначала сохраняем изменения
      await handleSave();
      
      // Затем подтверждаем отправку
      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, {
        status: 'supervisor_approved',
        comment: 'Одобрено руководителем'
      });

      message.success('Данные успешно отправлены ответственному по магистратуре');
      setConfirmModalVisible(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Ошибка при подтверждении:', error);
      message.error('Ошибка при подтверждении отправки');
    } finally {
      setLoading(false);
    }
  };

  // Проверяем, есть ли данные студента
  const hasStudentData = useMemo(() => {
    if (!currentStageData) return false;
    
    if (currentStageData.stageType === 'dissertation_topic') {
      return !!(currentStageData.studentData?.dissertationTopic?.kazakh || 
                currentStageData.studentData?.dissertationTopic?.russian || 
                currentStageData.studentData?.dissertationTopic?.english);
    } else {
      return !!(currentStageData.studentData?.textData);
    }
  }, [currentStageData]);

  // Определяем, можно ли редактировать
  const canEdit = useMemo(() => {
    if (!currentStageData) return false;
    return ['submitted', 'supervisor_review', 'rejected', 'in_progress'].includes(currentStageData.status) || hasStudentData;
  }, [currentStageData, hasStudentData]);

  // Определяем, можно ли подтверждать
  const canConfirm = useMemo(() => {
    if (!currentStageData) return false;
    return ['submitted', 'supervisor_review'].includes(currentStageData.status) || hasStudentData;
  }, [currentStageData, hasStudentData]);

  // Отладочная информация
  console.log('🔍 SupervisorView Debug Info:', {
    currentStageData: currentStageData,
    status: currentStageData?.status,
    hasStudentData,
    canEdit,
    canConfirm,
    studentData: currentStageData?.studentData,
    iupData: iupData
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Информация о студенте */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0 }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                {iupData?.student?.fullName || 'Не указано'}
              </Title>
              <Text type="secondary">
                {iupData?.student?.OP || 'Образовательная программа не указана'}
              </Text>
            </Space>
          </Col>
          <Col xs={24} lg={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Курс">1 курс</Descriptions.Item>
              <Descriptions.Item label="Язык обучения">
                {iupData?.metadata?.language || 'Не указан'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Этап работы */}
      {currentStageData && (
        <Card 
          title={
            <Space>
              <EditOutlined />
              <Text strong>Этап {currentStageData.stageNumber}: {currentStageData.title}</Text>
              <Tag 
                color={getStatusColor(currentStageData.status)}
                icon={
                  currentStageData.status === 'completed' ? <CheckCircleOutlined /> :
                  currentStageData.status === 'rejected' ? <ExclamationCircleOutlined /> :
                  <ClockCircleOutlined />
                }
              >
                {getStatusText(currentStageData.status)}
              </Tag>
            </Space>
          }
          extra={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text type="secondary">
                {canEdit ? 'Вы можете редактировать данные студента' : 'Этап недоступен для редактирования'}
              </Text>
            </Space>
          }
        >
          {/* Инструкция для руководителя */}
          <Alert
            message="Инструкция для руководителя"
            description={
              <div>
                <p><strong>1.</strong> Проверьте данные, введенные магистрантом</p>
                <p><strong>2.</strong> При необходимости отредактируйте данные прямо в полях ниже</p>
                <p><strong>3.</strong> Добавьте комментарии при необходимости</p>
                <p><strong>4.</strong> Сохраните изменения кнопкой "Сохранить"</p>
                <p><strong>5.</strong> Подтвердите отправку данных ответственному по магистратуре</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          {currentStageData.stageType === 'dissertation_topic' ? (
            // Этап темы диссертации
            <Form form={form} layout="vertical">
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Тема диссертационной работы (можно редактировать)</Text>
                </Space>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={8}>
                    <Card size="small" title="На казахском языке" headStyle={{ background: '#f0f2f5' }}>
                      <Form.Item 
                        name="topicKazakh"
                        rules={[{ required: true, message: 'Введите тему на казахском языке' }]}
                      >
                        <TextArea
                          placeholder="Қазақ тілінде диссертация тақырыбын енгізіңіз"
                          rows={4}
                          disabled={!canEdit}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={8}>
                    <Card size="small" title="На русском языке" headStyle={{ background: '#f0f2f5' }}>
                      <Form.Item 
                        name="topicRussian"
                        rules={[{ required: true, message: 'Введите тему на русском языке' }]}
                      >
                        <TextArea
                          placeholder="Введите тему диссертации на русском языке"
                          rows={4}
                          disabled={!canEdit}
                        />
                      </Form.Item>
                    </Card>
                  </Col>

                  <Col xs={24} lg={8}>
                    <Card size="small" title="На английском языке" headStyle={{ background: '#f0f2f5' }}>
                      <Form.Item 
                        name="topicEnglish"
                        rules={[{ required: true, message: 'Введите тему на английском языке' }]}
                      >
                        <TextArea
                          placeholder="Enter dissertation topic in English"
                          rows={4}
                          disabled={!canEdit}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* Комментарии руководителя */}
              <Card size="small" title="Ваши комментарии" style={{ marginTop: 16 }}>
                <Form.Item 
                  name="comments"
                  label="Комментарии и рекомендации для студента"
                >
                  <TextArea
                    placeholder="Добавьте комментарии, рекомендации или замечания для магистранта (необязательно)"
                    rows={3}
                    disabled={!canEdit}
                  />
                </Form.Item>
              </Card>

              {/* Кнопки действий */}
              <Card style={{ marginTop: 24, textAlign: 'center', background: '#fafafa' }}>
                <Space size="large">
                  <Button 
                    size="large"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={loading}
                    disabled={!currentStageData}
                    type={canEdit ? "default" : "dashed"}
                  >
                    Сохранить изменения {!canEdit && "(Принудительно)"}
                  </Button>
                  
                  <Button 
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleConfirm}
                    loading={loading}
                    disabled={!currentStageData}
                    ghost={!canConfirm}
                  >
                    Подтвердить отправление данных {!canConfirm && "(Принудительно)"}
                  </Button>
                </Space>
              </Card>
            </Form>
          ) : currentStageData.stageType === 'dissertation_application' ? (
            // Этап заявления на тему диссертации - только просмотр для руководителя
            <Card 
              title={
                <Space>
                  <BookOutlined style={{ color: '#52c41a' }} />
                  <span>Этап 2: Заявление на тему диссертации</span>
                  <Badge 
                    status={
                      currentStageData?.status === 'completed' ? 'success' :
                      currentStageData?.status === 'submitted' ? 'processing' :
                      currentStageData?.status === 'in_progress' ? 'warning' :
                      'default'
                    }
                    text={
                      currentStageData?.status === 'completed' ? 'Завершен' :
                      currentStageData?.status === 'submitted' ? 'Отправлен студентом' :
                      currentStageData?.status === 'in_progress' ? 'В процессе' :
                      'Ожидает'
                    }
                  />
                </Space>
              }
              bordered={false}
              style={{ marginBottom: 24 }}
            >
              <Alert
                message="Информация для научного руководителя"
                description={
                  <div>
                    <p><strong>На данном этапе руководитель не выполняет никаких действий.</strong></p>
                    <p>Ваш магистрант должен:</p>
                    <ul>
                      <li>Написать заявление от руки на А4 листе на языке обучения</li>
                      <li>Получить подписи у руководителя, заведующего кафедры и декана</li>
                      <li>Сдать готовое заявление в 321 кабинет (2 корпус)</li>
                    </ul>
                    <p><strong>Статус получения заявления администратором:</strong></p>
                    <div style={{ marginTop: 10 }}>
                      {currentStageData?.adminReceived ? (
                        <Alert
                          message="✅ Заявление получено администратором"
                          description="Администратор подтвердил получение заявления от магистранта. Скоро откроется следующий этап."
                          type="success"
                          showIcon
                        />
                      ) : (
                        <Alert
                          message="⏳ Ожидается получение заявления администратором"
                          description="Магистрант должен сдать заявление в 321 кабинет. После получения администратор откроет следующий этап."
                          type="warning"
                          showIcon
                        />
                      )}
                    </div>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              {/* Отображение темы диссертации из предыдущего этапа */}
              {iupData?.stages?.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic && (
                <Card size="small" title="Утвержденная тема диссертации" style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} lg={8}>
                      <Text strong>На казахском языке:</Text>
                      <div style={{ marginTop: 8, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
                        {iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.kazakh || 'Не указано'}
                      </div>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Text strong>На русском языке:</Text>
                      <div style={{ marginTop: 8, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
                        {iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.russian || 'Не указано'}
                      </div>
                    </Col>
                    <Col xs={24} lg={8}>
                      <Text strong>На английском языке:</Text>
                      <div style={{ marginTop: 8, padding: 12, background: '#f9f9f9', borderRadius: 6 }}>
                        {iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.english || 'Не указано'}
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Информация о студенте */}
              <Card size="small" title="Информация о магистранте" style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="ФИО">{iupData?.student?.fullName || 'Не указано'}</Descriptions.Item>
                  <Descriptions.Item label="Язык обучения">{iupData?.metadata?.language || 'Не указано'}</Descriptions.Item>
                  <Descriptions.Item label="ОП">{iupData?.student?.OP || 'Не указано'}</Descriptions.Item>
                  <Descriptions.Item label="Курс">1 курс</Descriptions.Item>
                </Descriptions>
              </Card>

              <Divider />
              
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  Этот этап автоматически завершится после того, как администратор подтвердит получение заявления от магистранта.
                </Text>
              </div>
            </Card>
          ) : (
            // Fallback для неизвестных типов этапов
            <Card>
              <Alert
                message="Неизвестный тип этапа"
                description={`Тип этапа "${currentStageData?.stageType}" не поддерживается в интерфейсе руководителя.`}
                type="error"
                showIcon
              />
            </Card>
          )}
        </Card>
      )}

      {/* Модальное окно подтверждения */}
      <Modal
        title="Подтверждение отправки"
        open={confirmModalVisible}
        onOk={handleConfirmSubmit}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Да, отправить"
        cancelText="Отмена"
        confirmLoading={loading}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Подтверждение действия"
            description={
              <div>
                <p><strong>Вы подтверждаете отправку данных ответственному по магистратуре?</strong></p>
                <p>После подтверждения:</p>
                <ul>
                  <li>Все ваши изменения будут сохранены</li>
                  <li>Этап будет отмечен как "Одобрено руководителем"</li>
                  <li>Статус автоматически изменится на "На проверке у админа"</li>
                  <li>Все этапы требуют финального утверждения администратора</li>
                  <li>Ответственный по магистратуре сможет окончательно утвердить этап</li>
                  <li>После этого вы не сможете больше редактировать этот этап</li>
                </ul>
              </div>
            }
            type="warning"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default SupervisorView;
