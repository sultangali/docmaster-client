import React, { useState, useEffect, useRef } from 'react';
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
  Timeline,
  message,
  Modal,
  Progress,
  Tag,
  Descriptions,
  Steps,
  Tooltip
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  SaveOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import api from '../../../services/api';
import ApplicationTemplateKazakh from './ApplicationTemplateKazakh';
import ApplicationTemplateRussian from './ApplicationTemplateRussian';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const StudentStageView = ({ iupData, onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStageData, setCurrentStageData] = useState(null);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const onUpdateRef = useRef(onUpdate);

  console.log(iupData?.metadata);

  useEffect(() => {
    if (iupData && iupData.stages) {
      const current = iupData.stages.find(stage => stage.stageNumber === iupData.currentStage);
      setCurrentStageData(current);
      
      // Заполняем форму существующими данными
      if (current && current.studentData) {
        if (current.stageType === 'dissertation_topic' && current.studentData.dissertationTopic) {
          form.setFieldsValue({
            topicKazakh: current.studentData.dissertationTopic.kazakh || '',
            topicRussian: current.studentData.dissertationTopic.russian || '',
            topicEnglish: current.studentData.dissertationTopic.english || ''
          });
        } else if (current.studentData.textData) {
          form.setFieldsValue({
            textData: current.studentData.textData
          });
        }
      }
    }
  }, [iupData, form]);

  // Обновляем ref когда изменяется onUpdate
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // Функции для управления скроллом
  const scrollLeft = () => {
    const scrollContainer = document.getElementById('application-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const scrollContainer = document.getElementById('application-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Эффект для управления индикаторами горизонтального скролла
  useEffect(() => {
    const scrollContainer = document.getElementById('application-scroll-container');
    if (!scrollContainer) return;

    const updateScrollIndicators = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const isScrollable = scrollWidth > clientWidth;
      
      // Обновляем состояние кнопок
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      
      // Добавляем/убираем класс scrollable
      if (isScrollable) {
        scrollContainer.classList.add('scrollable');
      } else {
        scrollContainer.classList.remove('scrollable');
      }
    };

    const handleScroll = () => {
      updateScrollIndicators();
      scrollContainer.classList.add('scrolling');
      setTimeout(() => {
        scrollContainer.classList.remove('scrolling');
      }, 600);
    };

    // Проверяем при загрузке
    updateScrollIndicators();
    
    // Проверяем при изменении размера окна
    window.addEventListener('resize', updateScrollIndicators);
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', updateScrollIndicators);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [currentStageData]);

  // Автоматическое обновление статуса каждые 30 секунд - ОТКЛЮЧЕНО для предотвращения циклов
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (onUpdateRef.current && !loading) {
  //       onUpdateRef.current();
  //     }
  //   }, 30000); // 30 секунд

  //   return () => clearInterval(interval);
  // }, [loading]);

  const getStatusColor = (status) => {
    const colors = {
      'not_started': 'default',
      'in_progress': 'processing',
      'submitted': 'warning',
      'supervisor_review': 'warning', 
      'supervisor_approved': 'success',
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
      const values = await form.validateFields();
      setLoading(true);

      let studentData = {};
      
      if (currentStageData.stageType === 'dissertation_topic') {
        studentData = {
          dissertationTopic: {
            kazakh: values.topicKazakh?.trim() || '',
            russian: values.topicRussian?.trim() || '',
            english: values.topicEnglish?.trim() || ''
          }
        };
      } else {
        studentData = {
          textData: values.textData?.trim() || ''
        };
      }

      // Автоматически переводим статус с 'not_started' на 'in_progress' при первом сохранении
      let requestData = { studentData };
      if (currentStageData.status === 'not_started') {
        requestData.status = 'in_progress';
      }

      await api.put(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}`, requestData);

      message.success('Данные сохранены');
      onUpdate();
    } catch (error) {
      console.error('Error saving stage data:', error);
      message.error('Ошибка сохранения данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Проверяем заполненность для первого этапа
      if (currentStageData.stageType === 'dissertation_topic') {
        if (!values.topicKazakh?.trim() || !values.topicRussian?.trim() || !values.topicEnglish?.trim()) {
          message.error('Необходимо заполнить тему диссертации на всех трех языках');
          return;
        }
      } else if (!values.textData?.trim()) {
        message.error('Необходимо заполнить данные этапа');
        return;
      }

      setSubmitModalVisible(true);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleSubmitConfirm = async () => {
    try {
      setLoading(true);
      
      // Сначала сохраняем данные
      await handleSave();
      
      // Затем отправляем на проверку
      await api.post(`/iup/${iupData._id}/stage/${currentStageData.stageNumber}/submit`);
      
      message.success('Этап отправлен на проверку');
      setSubmitModalVisible(false);
      onUpdate();
    } catch (error) {
      console.error('Error submitting stage:', error);
      message.error('Ошибка отправки этапа на проверку');
    } finally {
      setLoading(false);
    }
  };

  // Проверяем есть ли сохраненные данные студента
  const hasStudentData = currentStageData && (
    (currentStageData.stageType === 'dissertation_topic' && 
     currentStageData.studentData?.dissertationTopic &&
     (currentStageData.studentData.dissertationTopic.kazakh || 
      currentStageData.studentData.dissertationTopic.russian || 
      currentStageData.studentData.dissertationTopic.english)) ||
    (currentStageData.stageType !== 'dissertation_topic' && 
     currentStageData.studentData?.textData)
  );

  const canEdit = currentStageData && ['not_started', 'in_progress', 'rejected'].includes(currentStageData.status);
  const canSubmit = currentStageData && (
    // Старая логика: можно отправлять если статус позволяет
    ['in_progress', 'rejected'].includes(currentStageData.status) ||
    // Новая логика: можно отправлять если есть сохраненные данные и статус подходящий
    (hasStudentData && ['not_started', 'in_progress', 'rejected'].includes(currentStageData.status))
  );

  // Определяем, нужно ли применить режим ПК (для 2 этапа - заявление на тему диссертации)
  // const isPCMode = currentStageData?.stageType === 'dissertation_application';

  return (
    <div className={`iup-container `}>
      {/* Общий прогресс - упрощенный */}
      <Card className="iup-card" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={8}>
            <div className="iup-progress-circle">
              <Progress
                type="circle"
                percent={iupData.progress}
                size={120}
                format={percent => (
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{percent}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>завершено</div>
                  </div>
                )}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions title="Информация об ИУП" column={1} size="small">
              <Descriptions.Item label="Текущий этап">
                <Space>
                  <Tag color="blue">Этап {iupData.currentStage}</Tag>
                  <Text strong>{currentStageData?.title}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Badge 
                  status={getStatusColor(currentStageData?.status)} 
                  text={getStatusText(currentStageData?.status)}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Общий прогресс">
                <Progress 
                  percent={iupData.progress} 
                  size="small"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Текущий этап - упрощенный */}
      {currentStageData && (
        <Card 
          title={
            <Space>
              <EditOutlined />
              <Text strong>Этап {currentStageData.stageNumber}: {currentStageData.title}</Text>
              <Tag 
                color={getStatusColor(currentStageData.status)}
                icon={
                  currentStageData.status === 'completed' || currentStageData.status === 'admin_approved' ? <CheckCircleOutlined /> :
                  currentStageData.status === 'rejected' ? <ExclamationCircleOutlined /> :
                  currentStageData.status === 'in_progress' ? <ClockCircleOutlined /> :
                  undefined
                }
              >
                {getStatusText(currentStageData.status)}
              </Tag>
            </Space>
          }
          extra={
            canEdit && (
              <Text type="primary">
                <InfoCircleOutlined /> Заполните поля и сохраните изменения
              </Text>
            )
          }
        >
          {/* {isPCMode && (
            <Alert 
              message="🖥️ Режим ПК активирован"
              description="Вы находитесь в специальном режиме для работы с заявлением на тему диссертации. Интерфейс оптимизирован для удобной работы на компьютере."
              type="success" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
          )} */}

          {currentStageData.description && (
            <Alert 
              message="Описание этапа"
              description={currentStageData.description}
              type="info" 
              showIcon 
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Форма ввода данных - упрощенная */}
          <Form form={form} layout="vertical">
            {currentStageData.stageType === 'dissertation_application' ? (
              // Образец заявления для второго этапа
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Образец заявления на тему диссертации</Text>
                </Space>
                
                {/* Примечание для магистранта */}
                <Alert
                  message="Важная информация"
                  description={
                    <div>
                      <p><strong>Заявление нужно написать от руки на языке обучения!</strong></p>
                      
                        Каждый магистрант пишет заявление от руки на А4 листе
                        Язык заявления должен соответствовать вашему языку обучения
                        Посмотрите на образец ниже, чтобы понять что и как написать
                     
                      <br />
                      <p><strong>Порядок получения подписей (2 корпус):</strong></p>
                      
                        <li><strong>Подпись научного руководителя</strong> - получите у своего руководителя</li>
                        <li><strong>Подпись заведующей кафедры</strong> - Попова Надежда Викторовна:
                          <ul style={{ marginTop: '5px', marginLeft: '-24px' }}>
                            <li>📍 Кабинет 318 (2 корпус)</li>
                            <li>Если её нет, спросите в 321 кабинете где её найти</li>
                          </ul>
                        </li>
                        <li><strong>Подпись декана</strong> - Танин Алибек Орланович:
                          <ul style={{ marginTop: '5px', marginLeft: '-24px' }}>
                            <li>📍 Кабинет 408 (2 корпус, 4 этаж)</li>
                          </ul>
                        </li>
                        <li><strong>Сдача готового заявления:</strong>
                          <ul style={{ marginTop: '5px',marginLeft: '-24px' }}>
                            <li>📍 Кабинет 321 (2 корпус)</li>
                            <li>Заявление должно быть с тремя подписями!</li>
                          </ul>
                        </li>
                      
                    </div>
                  }
                  type="warning"
                 
                  style={{ marginBottom: 24 }}
                />
                
                {/* Подсказка о горизонтальном скролле */}
                <div className="application-scroll-hint">
                  Используйте горизонтальный скролл или кнопки для просмотра полного образца заявления
                </div>
                
                {/* Кнопки управления скроллом */}
                <div className="application-scroll-controls">
                  <Tooltip title="Прокрутить влево">
                    <Button 
                      icon={<LeftOutlined />} 
                      onClick={scrollLeft}
                      disabled={!canScrollLeft}
                      size="large"
                    />
                  </Tooltip>
                  <Tooltip title="Прокрутить вправо">
                    <Button 
                      icon={<RightOutlined />} 
                      onClick={scrollRight}
                      disabled={!canScrollRight}
                      size="large"
                    />
                  </Tooltip>
                </div>
                
                {/* Контейнер с горизонтальным скроллом для образца заявления */}
                <div className="application-scroll-container" id="application-scroll-container">
                  {iupData.metadata?.language === 'Қазақша' ? (
                    <ApplicationTemplateKazakh 
                      studentData={iupData.student}
                      supervisorData={iupData.supervisor}
                      dissertationTopic={
                        // Берем тему из первого этапа, если она там есть
                        iupData.stages?.find(s => s.stageNumber === 1)?.studentData?.dissertationTopic ||
                        currentStageData.studentData?.dissertationTopic
                      }
                    />
                  ) : (
                    <ApplicationTemplateRussian 
                      studentData={iupData.student}
                      supervisorData={iupData.supervisor}
                      dissertationTopic={
                        // Берем тему из первого этапа, если она там есть
                        iupData.stages?.find(s => s.stageNumber === 1)?.studentData?.dissertationTopic ||
                        currentStageData.studentData?.dissertationTopic
                      }
                    />
                  )}
                </div>
              </div>
            ) : currentStageData.stageType === 'dissertation_topic' ? (
              // Форма для ввода темы диссертации на трех языках
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Тема диссертационной работы</Text>
                </Space>
                
                <Row gutter={[16, 16]} className="iup-topic-cards">
                  <Col xs={24} lg={8}>
                    <Card size="small" title="На казахском языке" headStyle={{ background: '#f0f2f5' }} className="iup-card">
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
                    <Card size="small" title="На русском языке" headStyle={{ background: '#f0f2f5' }} className="iup-card">
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
                    <Card size="small" title="На английском языке" headStyle={{ background: '#f0f2f5' }} className="iup-card">
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
            ) : (
              // Универсальная форма для других этапов
              <Card size="small">
                <Form.Item 
                  name="textData"
                  rules={[{ required: true, message: 'Заполните данные этапа' }]}
                >
                  <TextArea
                    placeholder={`Введите данные для этапа "${currentStageData.title}"`}
                    rows={8}
                    disabled={!canEdit}
                  />
                </Form.Item>
              </Card>
            )}

            {/* Правки руководителя - упрощенный блок */}
            {currentStageData.supervisorEdits && (
              currentStageData.supervisorEdits.dissertationTopic || 
              currentStageData.supervisorEdits.textData || 
              currentStageData.supervisorEdits.comments
            ) && (
              <Card 
                style={{ marginTop: 24, background: '#fff7e6', borderColor: '#faad14' }}
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    <Text strong style={{ color: '#faad14' }}>Правки и комментарии руководителя</Text>
                  </Space>
                }
                size="small"
              >
                <Descriptions column={1} size="small">
                  {currentStageData.stageType === 'dissertation_topic' && 
                   currentStageData.supervisorEdits.dissertationTopic && (
                    <>
                      {currentStageData.supervisorEdits.dissertationTopic.kazakh && (
                        <Descriptions.Item label="Казахский язык">
                          <Text>{currentStageData.supervisorEdits.dissertationTopic.kazakh}</Text>
                        </Descriptions.Item>
                      )}
                      {currentStageData.supervisorEdits.dissertationTopic.russian && (
                        <Descriptions.Item label="Русский язык">
                          <Text>{currentStageData.supervisorEdits.dissertationTopic.russian}</Text>
                        </Descriptions.Item>
                      )}
                      {currentStageData.supervisorEdits.dissertationTopic.english && (
                        <Descriptions.Item label="Английский язык">
                          <Text>{currentStageData.supervisorEdits.dissertationTopic.english}</Text>
                        </Descriptions.Item>
                      )}
                    </>
                  )}

                  {currentStageData.supervisorEdits.textData && (
                    <Descriptions.Item label="Исправленный текст">
                      <Paragraph>{currentStageData.supervisorEdits.textData}</Paragraph>
                    </Descriptions.Item>
                  )}

                  {currentStageData.supervisorEdits.comments && (
                    <Descriptions.Item label="Комментарии">
                      <Paragraph>{currentStageData.supervisorEdits.comments}</Paragraph>
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="Дата редактирования">
                    <Text type="secondary">
                      {new Date(currentStageData.supervisorEdits.editedAt).toLocaleString('ru-RU')}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Информационное сообщение */}
            {/* {canEdit && (
              <Alert
                message="Информация о сохранении данных"
                description="Ваши данные автоматически становятся доступными руководителю после сохранения. Руководитель может просматривать, РЕДАКТИРОВАТЬ и комментировать ваши работы до официальной отправки на проверку."
                type="info"
                showIcon
                style={{ marginTop: 24 }}
              />
            )} */}

            {/* Кнопки действий - улучшенные */}
            {currentStageData.stageType !== 'dissertation_application' && (
              <Card className="iup-actions" style={{ marginTop: 24 }}>
                <Space size="large" direction="vertical" style={{ width: '100%' }}>
                  <Space size="middle">
                    {canEdit && (
                      <Button 
                        size="middle"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={loading}
                      >
                        Сохранить изменения
                      </Button>
                    )}
                    
                    {canSubmit && (
                      <Button 
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                      >
                        Отправить на проверку
                      </Button>
                    )}
                  </Space>
                
                {/* Дополнительная информация о статусе */}
                {currentStageData && (
                  <div>
                    <Text type="secondary">
                      <strong>Текущий статус:</strong> {getStatusText(currentStageData.status)}
                    </Text>
                    {hasStudentData && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                          ✅ Данные сохранены и доступны руководителю
                        </Text>
                      </div>
                    )}
                  </div>
                )}
                
                {!canEdit && !canSubmit && (
                  <Alert
                    message="Этап недоступен для редактирования"
                    description="Дождитесь проверки руководителя или администратора"
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            </Card>
            )}
          </Form>

          {/* История изменений статуса - упрощенная */}
          {currentStageData.statusHistory && currentStageData.statusHistory.length > 1 && (
            <Card 
              style={{ marginTop: 24 }}
              title={
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>История этапа</Text>
                </Space>
              }
              size="small"
            >
              <Timeline size="small">
                {currentStageData.statusHistory
                  .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
                  .map((history, index) => (
                    <Timeline.Item 
                      key={index}
                      color={getStatusColor(history.status)}
                      dot={
                        history.status === 'completed' || history.status === 'admin_approved' ? <CheckCircleOutlined /> :
                        history.status === 'rejected' ? <ExclamationCircleOutlined /> :
                        history.status === 'in_progress' ? <ClockCircleOutlined /> :
                        undefined
                      }
                    >
                      <div>
                        <Tag color={getStatusColor(history.status)}>
                          {getStatusText(history.status)}
                        </Tag>
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          {new Date(history.changedAt).toLocaleString('ru-RU')}
                        </Text>
                        {history.comment && (
                          <div style={{ marginTop: 4 }}>
                            <Text>{history.comment}</Text>
                          </div>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </Card>
          )}
        </Card>
      )}

      {/* Модальное окно подтверждения отправки */}
      <Modal
        title="Отправить этап на проверку?"
        open={submitModalVisible}
        onOk={handleSubmitConfirm}
        onCancel={() => setSubmitModalVisible(false)}
        okText="Отправить на проверку"
        cancelText="Отмена"
        confirmLoading={loading}
        width={500}
      >
        <div>
          <p>Ваш этап будет отправлен руководителю для проверки.</p>
          <p><strong>Что произойдет дальше:</strong></p>
          <ul>
            <li>Руководитель проверит ваши данные</li>
            <li>При необходимости внесет правки или комментарии</li>
            <li>Одобрит этап или вернет на доработку</li>
          </ul>
          <p><em>После отправки вы не сможете редактировать данные до получения ответа от руководителя.</em></p>
        </div>
      </Modal>
    </div>
  );
};

export default StudentStageView;
