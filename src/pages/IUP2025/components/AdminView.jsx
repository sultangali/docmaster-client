import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Badge,
  Divider,
  Timeline,
  message,
  Modal,
  Tabs,
  Input,
  Form
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import api from '../../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;

const AdminView = ({ iupData, onUpdate, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [currentStageData, setCurrentStageData] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  useEffect(() => {
    if (iupData && iupData.stages) {
      const current = iupData.stages.find(stage => stage.stageNumber === iupData.currentStage);
      setCurrentStageData(current);
    }
  }, [iupData]);

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

  const handleApproveStage = () => {
    setApproveModalVisible(true);
  };

  // Обработчик получения заявления для этапа dissertation_application
  const handleReceiveApplication = async () => {
    try {
      setLoading(true);
      
      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, {
        adminReceived: true,
        adminReceivedDate: new Date(),
        status: 'admin_approved',
        comment: 'Заявление получено администратором'
      });

      message.success('Заявление успешно получено! Этап завершен.');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Ошибка при получении заявления:', error);
      message.error('Ошибка при получении заявления');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConfirm = async () => {
    try {
      setLoading(true);
      
      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, {
        status: 'admin_approved',
        comment: 'Одобрено администратором'
      });

      message.success('Этап одобрен, студент допущен к следующему этапу');
      setApproveModalVisible(false);
      onUpdate();
    } catch (error) {
      console.error('Error approving stage:', error);
      message.error('Ошибка одобрения этапа');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectStage = () => {
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, {
        status: 'rejected',
        comment: values.adminComment
      });

      message.success('Этап отклонен');
      form.resetFields();
      setRejectModalVisible(false);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting stage:', error);
      message.error('Ошибка отклонения этапа');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReview = async () => {
    try {
      setLoading(true);
      
      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, {
        status: 'admin_review',
        comment: 'Взято на проверку администратором'
      });

      message.success('Этап взят на проверку');
      onUpdate();
    } catch (error) {
      console.error('Error setting review status:', error);
      message.error('Ошибка изменения статуса');
    } finally {
      setLoading(false);
    }
  };

  const canApprove = currentStageData && ['supervisor_approved', 'admin_review'].includes(currentStageData.status);
  const canSetReview = currentStageData && currentStageData.status === 'supervisor_approved';

  return (
    <div className="iup-container">
      {/* Информация о студенте */}
      <Card className="student-info-card" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={4} style={{ color: 'black', marginBottom: 8 }}>
              {iupData.student?.fullName}
            </Title>
            <Space direction="vertical" size={4}>
              <Text style={{ color: 'black' }}>
                📚 {iupData.student?.OP} • {iupData.student?.language}
              </Text>
              <Text style={{ color: 'black' }}>
                📧 {iupData.student?.email}
              </Text>
              <Text style={{ color: 'black' }}>
                👨‍🏫 Руководитель: {iupData.supervisor?.fullName || 'Не назначен'}
              </Text>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Title level={5} style={{ color: 'black', marginBottom: 8 }}>
              Прогресс: {iupData.progress}%
            </Title>
            <Text style={{ color: 'black' }}>
              Этап {iupData.currentStage} из {iupData.metadata.totalStages}
            </Text>
            <br />
            <Badge 
              status={getStatusColor(iupData.overallStatus)} 
              text={getStatusText(iupData.overallStatus)}
              style={{ color: 'black' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Табы для просмотра */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Текущий этап" key="current">
            {currentStageData && (
              <div>
                <Row gutter={16} style={{ marginBottom: 20 }}>
                  <Col span={16}>
                    <Title level={4}>
                      Этап {currentStageData.stageNumber}: {currentStageData.title}
                    </Title>
                    {currentStageData.description && (
                      <Alert 
                        message={currentStageData.description} 
                        type="info" 
                        showIcon 
                        style={{ marginBottom: 16 }}
                      />
                    )}
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Badge 
                      status={getStatusColor(currentStageData.status)} 
                      text={getStatusText(currentStageData.status)}
                    />
                    <br />
                    <Space style={{ marginTop: 12 }}>
                      {canSetReview && (
                        <Button 
                          type="default"
                          icon={<EyeOutlined />}
                          onClick={handleSetReview}
                          loading={loading}
                        >
                          Взять на проверку
                        </Button>
                      )}
                    </Space>
                  </Col>
                </Row>

                {/* Данные студента */}
                <Title level={5}>Данные студента</Title>
                {currentStageData.stageType === 'dissertation_topic' ? (
                  // Отображение темы диссертации
                  <div>
                    {currentStageData.studentData.dissertationTopic && (
                      <div>
                        <div className="topic-card">
                          <div className="language-label">На казахском языке:</div>
                          <Paragraph>{currentStageData.studentData.dissertationTopic.kazakh || 'Не заполнено'}</Paragraph>
                        </div>

                        <div className="topic-card">
                          <div className="language-label">На русском языке:</div>
                          <Paragraph>{currentStageData.studentData.dissertationTopic.russian || 'Не заполнено'}</Paragraph>
                        </div>

                        <div className="topic-card">
                          <div className="language-label">На английском языке:</div>
                          <Paragraph>{currentStageData.studentData.dissertationTopic.english || 'Не заполнено'}</Paragraph>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentStageData.stageType === 'dissertation_application' ? (
                  // Этап заявления на тему диссертации
                  <div>
                    <Alert
                      message="Этап заявления на тему диссертации"
                      description={
                        <div>
                          <p>На данном этапе магистрант написал заявление от руки и должен сдать его в 321 кабинет.</p>
                          <p><strong>Для завершения этапа необходимо подтвердить получение заявления.</strong></p>
                        </div>
                      }
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />

                    {/* Информация о заявлении */}
                    <div className="topic-card">
                      <div className="language-label">Информация о заявлении:</div>
                      <Paragraph>
                        Магистрант должен написать заявление от руки на языке обучения ({iupData?.metadata?.language || 'не указан'}) 
                        с указанием утвержденной темы диссертации.
                      </Paragraph>
                    </div>

                    {/* Утвержденная тема из первого этапа */}
                    {iupData?.stages?.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Утвержденная тема диссертации:</Text>
                        <div style={{ marginTop: 8 }}>
                          <div className="topic-card">
                            <div className="language-label">На казахском языке:</div>
                            <Paragraph>{iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.kazakh || 'Не указано'}</Paragraph>
                          </div>
                          <div className="topic-card">
                            <div className="language-label">На русском языке:</div>
                            <Paragraph>{iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.russian || 'Не указано'}</Paragraph>
                          </div>
                          <div className="topic-card">
                            <div className="language-label">На английском языке:</div>
                            <Paragraph>{iupData.stages.find(stage => stage.stageNumber === 1)?.studentData?.dissertationTopic?.english || 'Не указано'}</Paragraph>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Статус получения заявления */}
                    <div style={{ marginTop: 20 }}>
                      <Title level={5}>Статус получения заявления</Title>
                      {currentStageData?.adminReceived ? (
                        <Alert
                          message="✅ Заявление получено"
                          description={
                            <div>
                              <p>Вы подтвердили получение заявления от магистранта.</p>
                              <p><strong>Дата получения:</strong> {new Date(currentStageData.adminReceivedDate).toLocaleString('ru-RU')}</p>
                            </div>
                          }
                          type="success"
                          showIcon
                        />
                      ) : (
                        <Alert
                          message="⏳ Ожидается получение заявления"
                          description="Когда магистрант принесет заявление в 321 кабинет, подтвердите его получение."
                          type="warning"
                          showIcon
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  // Отображение текстовых данных для других типов этапов
                  <div className="topic-card">
                    <Paragraph>
                      {currentStageData.studentData.textData || 'Данные не предоставлены'}
                    </Paragraph>
                  </div>
                )}

                {/* Правки руководителя */}
                {currentStageData.supervisorEdits && (
                  currentStageData.supervisorEdits.dissertationTopic || 
                  currentStageData.supervisorEdits.textData || 
                  currentStageData.supervisorEdits.comments
                ) && (
                  <>
                    <Divider />
                    <Title level={5} style={{ color: '#faad14' }}>
                      Правки и комментарии руководителя
                    </Title>
                    
                    {currentStageData.stageType === 'dissertation_topic' && 
                     currentStageData.supervisorEdits.dissertationTopic && (
                      <div className="supervisor-edits">
                        {currentStageData.supervisorEdits.dissertationTopic.kazakh && (
                          <div className="topic-card has-edits">
                            <div className="edit-indicator">Исправленный вариант (казахский):</div>
                            <Paragraph>{currentStageData.supervisorEdits.dissertationTopic.kazakh}</Paragraph>
                          </div>
                        )}
                        {currentStageData.supervisorEdits.dissertationTopic.russian && (
                          <div className="topic-card has-edits">
                            <div className="edit-indicator">Исправленный вариант (русский):</div>
                            <Paragraph>{currentStageData.supervisorEdits.dissertationTopic.russian}</Paragraph>
                          </div>
                        )}
                        {currentStageData.supervisorEdits.dissertationTopic.english && (
                          <div className="topic-card has-edits">
                            <div className="edit-indicator">Исправленный вариант (английский):</div>
                            <Paragraph>{currentStageData.supervisorEdits.dissertationTopic.english}</Paragraph>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStageData.supervisorEdits.textData && (
                      <div className="supervisor-edits">
                        <div className="topic-card has-edits">
                          <div className="edit-indicator">Исправленный текст:</div>
                          <Paragraph>{currentStageData.supervisorEdits.textData}</Paragraph>
                        </div>
                      </div>
                    )}

                    {currentStageData.supervisorEdits.comments && (
                      <div className="supervisor-edits">
                        <div className="topic-card has-edits">
                          <div className="edit-indicator">Комментарии руководителя:</div>
                          <Paragraph>{currentStageData.supervisorEdits.comments}</Paragraph>
                        </div>
                      </div>
                    )}
                    
                    <Text type="secondary">
                      Дата редактирования: {new Date(currentStageData.supervisorEdits.editedAt).toLocaleString('ru-RU')}
                    </Text>
                  </>
                )}

                {/* Кнопки администратора */}
                {canApprove && (
                  <>
                    <Divider />
                    <div className="stage-actions">
                      {currentStageData.stageType === 'dissertation_application' ? (
                        // Специальные кнопки для этапа заявления
                        <>
                          <Alert
                            message="Получение заявления"
                            description={
                              currentStageData?.adminReceived ? 
                                "Заявление уже получено. Этап завершен." :
                                "Подтвердите получение заявления от магистранта для завершения этапа."
                            }
                            type={currentStageData?.adminReceived ? "success" : "info"}
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                          
                          {!currentStageData?.adminReceived && (
                            <Button 
                              type="primary" 
                              icon={<CheckOutlined />}
                              onClick={handleReceiveApplication}
                              loading={loading}
                              size="large"
                              style={{ 
                                backgroundColor: '#52c41a', 
                                borderColor: '#52c41a',
                                marginRight: 12
                              }}
                            >
                              Подтвердить получение заявления
                              <ArrowRightOutlined />
                            </Button>
                          )}
                        </>
                      ) : (
                        // Обычные кнопки для других этапов
                        <>
                          <Alert
                            message="Административное решение"
                            description="Проверьте данные студента и правки руководителя перед принятием решения."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                          />
                          
                          <Button 
                            type="primary" 
                            icon={<CheckOutlined />}
                            htmlType='button'
                            onClick={handleApproveStage}
                            loading={loading}
                            size="large"
                            style={{ 
                              backgroundColor: '#52c41a', 
                              borderColor: '#52c41a',
                              marginRight: 12
                            }}
                          >
                            Одобрить и допустить к следующему этапу
                            <ArrowRightOutlined />
                          </Button>
                          
                          <Button 
                            danger
                            icon={<CloseOutlined />}
                            onClick={handleRejectStage}
                            loading={loading}
                            size="large"
                          >
                            Отклонить
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* История изменений */}
                {currentStageData.statusHistory && currentStageData.statusHistory.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>История этапа</Title>
                    <Timeline size="small">
                      {currentStageData.statusHistory
                        .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                        .map((history, index) => (
                          <Timeline.Item 
                            key={index}
                            color={getStatusColor(history.status)}
                          >
                            <Text strong>{getStatusText(history.status)}</Text>
                            <br />
                            <Text type="secondary">
                              {new Date(history.changedAt).toLocaleString('ru-RU')}
                            </Text>
                            {history.comment && (
                              <>
                                <br />
                                <Text>{history.comment}</Text>
                              </>
                            )}
                          </Timeline.Item>
                        ))}
                    </Timeline>
                  </>
                )}
              </div>
            )}
          </TabPane>

          <TabPane tab="Все этапы" key="all">
            <Steps 
              direction="vertical" 
              current={iupData.currentStage - 1}
              className="iup-steps"
            >
              {iupData.stages.map((stage) => (
                <Step
                  key={stage.stageNumber}
                  title={`Этап ${stage.stageNumber}: ${stage.title}`}
                  description={
                    <Space direction="vertical" size={4}>
                      <Badge 
                        status={getStatusColor(stage.status)} 
                        text={getStatusText(stage.status)}
                      />
                      {stage.description && (
                        <Text type="secondary">{stage.description}</Text>
                      )}
                      {stage.submittedAt && (
                        <Text type="secondary">
                          Отправлено: {new Date(stage.submittedAt).toLocaleString('ru-RU')}
                        </Text>
                      )}
                      {stage.supervisorReviewedAt && (
                        <Text type="secondary">
                          Проверено руководителем: {new Date(stage.supervisorReviewedAt).toLocaleString('ru-RU')}
                        </Text>
                      )}
                      {stage.adminReviewedAt && (
                        <Text type="secondary">
                          Проверено админом: {new Date(stage.adminReviewedAt).toLocaleString('ru-RU')}
                        </Text>
                      )}
                    </Space>
                  }
                  status={
                    stage.status === 'completed' || stage.status === 'admin_approved' ? 'finish' :
                    stage.stageNumber === iupData.currentStage ? 'process' :
                    stage.status === 'rejected' ? 'error' : 'wait'
                  }
                />
              ))}
            </Steps>
          </TabPane>

          <TabPane tab="Сводка" key="summary">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Информация об ИУП" size="small">
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Год:</Text> {iupData.year}
                    </div>
                    <div>
                      <Text strong>Образовательная программа:</Text> {iupData.metadata.educationProgram}
                    </div>
                    <div>
                      <Text strong>Язык обучения:</Text> {iupData.metadata.language}
                    </div>
                    <div>
                      <Text strong>Общий статус:</Text> 
                      <Badge 
                        status={getStatusColor(iupData.overallStatus)} 
                        text={getStatusText(iupData.overallStatus)}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                    <div>
                      <Text strong>Создан:</Text> {new Date(iupData.createdAt).toLocaleString('ru-RU')}
                    </div>
                    <div>
                      <Text strong>Последнее обновление:</Text> {new Date(iupData.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Статистика этапов" size="small">
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text strong>Всего этапов:</Text> {iupData.metadata.totalStages}
                    </div>
                    <div>
                      <Text strong>Завершено:</Text> {iupData.stages.filter(s => 
                        ['completed', 'admin_approved'].includes(s.status)
                      ).length}
                    </div>
                    <div>
                      <Text strong>В процессе:</Text> {iupData.stages.filter(s => 
                        ['in_progress', 'submitted', 'supervisor_review', 'admin_review'].includes(s.status)
                      ).length}
                    </div>
                    <div>
                      <Text strong>Отклонено:</Text> {iupData.stages.filter(s => 
                        s.status === 'rejected'
                      ).length}
                    </div>
                    <div>
                      <Text strong>Текущий этап:</Text> {iupData.currentStage}
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Модальное окно подтверждения одобрения */}
      <Modal
        title="Одобрить этап и допустить к следующему?"
        open={approveModalVisible}
        onOk={handleApproveConfirm}
        onCancel={() => setApproveModalVisible(false)}
        okText="Одобрить"
        cancelText="Отмена"
        confirmLoading={loading}
      >
        <p>Студент {iupData.student?.fullName} будет допущен к следующему этапу.</p>
      </Modal>

      {/* Модальное окно подтверждения отклонения */}
      <Modal
        title="Отклонить этап?"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalVisible(false)}
        okText="Отклонить"
        cancelText="Отмена"
        confirmLoading={loading}
      >
        <div>
          <p>Этап будет возвращен студенту для доработки.</p>
          <Form form={form}>
            <Form.Item
              name="adminComment"
              label="Комментарий (обязательно)"
              rules={[{ required: true, message: 'Укажите причину отклонения' }]}
            >
              <TextArea 
                placeholder="Укажите причину отклонения и рекомендации для доработки"
                rows={4}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminView;
