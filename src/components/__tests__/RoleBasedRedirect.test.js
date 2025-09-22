import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';
import RoleBasedRedirect from '../RoleBasedRedirect.jsx';

// Мокаем useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />
}));

// Тестовый компонент-обертка
const TestWrapper = ({ user }) => (
  <BrowserRouter>
    <AuthProvider>
      <RoleBasedRedirect />
    </AuthProvider>
  </BrowserRouter>
);

describe('RoleBasedRedirect', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  test('перенаправляет неавторизованных пользователей на /login', () => {
    const { getByTestId } = render(<TestWrapper user={null} />);
    const navigateElement = getByTestId('navigate');
    expect(navigateElement.getAttribute('data-to')).toBe('/login');
  });

  test('перенаправляет магистрантов на /iup2025', () => {
    // Мокаем пользователя-магистранта в localStorage
    const magistrantUser = {
      role: 'magistrants',
      fullName: 'Иванов Иван Иванович'
    };
    localStorage.setItem('user', JSON.stringify(magistrantUser));
    localStorage.setItem('token', 'test-token');

    const { getByTestId } = render(<TestWrapper user={magistrantUser} />);
    const navigateElement = getByTestId('navigate');
    expect(navigateElement.getAttribute('data-to')).toBe('/iup2025');
  });

  test('перенаправляет других пользователей на /profile', () => {
    // Тестируем разные роли
    const roles = ['doctorants', 'leaders', 'admins'];
    
    roles.forEach(role => {
      const user = {
        role: role,
        fullName: 'Тестовый Пользователь'
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'test-token');

      const { getByTestId } = render(<TestWrapper user={user} />);
      const navigateElement = getByTestId('navigate');
      expect(navigateElement.getAttribute('data-to')).toBe('/profile');
    });
  });
});
