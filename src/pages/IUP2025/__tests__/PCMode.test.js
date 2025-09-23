import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext.jsx';
import IUP2025 from '../index.jsx';

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Мокаем API
jest.mock('../../../services/api', () => ({
  get: jest.fn(),
}));

// Тестовый компонент-обертка
const TestWrapper = ({ user, iupData }) => (
  <BrowserRouter>
    <AuthProvider>
      <IUP2025 />
    </AuthProvider>
  </BrowserRouter>
);

describe('IUP2025 PC Mode', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('применяет режим ПК для магистранта на 2 этапе с типом dissertation_application', () => {
    const magistrantUser = {
      role: 'magistrants',
      fullName: 'Иванов Иван Иванович'
    };
    
    const iupDataWithStage2 = {
      currentStage: 2,
      stages: [
        { stageNumber: 1, stageType: 'dissertation_topic' },
        { stageNumber: 2, stageType: 'dissertation_application' }
      ]
    };
    
    localStorage.setItem('user', JSON.stringify(magistrantUser));
    localStorage.setItem('token', 'test-token');

    const { container } = render(<TestWrapper user={magistrantUser} iupData={iupDataWithStage2} />);
    
    // Проверяем, что применен класс режима ПК
    expect(container.querySelector('.iup-pc-mode')).toBeTruthy();
  });

  test('не применяет режим ПК для других этапов', () => {
    const magistrantUser = {
      role: 'magistrants',
      fullName: 'Иванов Иван Иванович'
    };
    
    const iupDataWithStage1 = {
      currentStage: 1,
      stages: [
        { stageNumber: 1, stageType: 'dissertation_topic' }
      ]
    };
    
    localStorage.setItem('user', JSON.stringify(magistrantUser));
    localStorage.setItem('token', 'test-token');

    const { container } = render(<TestWrapper user={magistrantUser} iupData={iupDataWithStage1} />);
    
    // Проверяем, что класс режима ПК не применен
    expect(container.querySelector('.iup-pc-mode')).toBeFalsy();
  });

  test('не применяет режим ПК для других ролей', () => {
    const leaderUser = {
      role: 'leaders',
      fullName: 'Петров Петр Петрович'
    };
    
    localStorage.setItem('user', JSON.stringify(leaderUser));
    localStorage.setItem('token', 'test-token');

    const { container } = render(<TestWrapper user={leaderUser} />);
    
    // Проверяем, что класс режима ПК не применен
    expect(container.querySelector('.iup-pc-mode')).toBeFalsy();
  });
});
