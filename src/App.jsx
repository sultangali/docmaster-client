import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext.jsx';
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Magistrants from './pages/Magistrants';
import Doctorants from './pages/Doctorants';
import Leaders from './pages/Leaders';
import DemoPage from './pages/Demo';
import IUP2025 from './pages/IUP2025';
import 'antd/dist/reset.css';

function App() {
  return (
    <AntdApp>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/magistrants"
              element={
                <PrivateRoute>
                  <Magistrants />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctorants"
              element={
                <PrivateRoute>
                  <Doctorants />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaders"
              element={
                <PrivateRoute>
                  <Leaders />
                </PrivateRoute>
              }
            />
            <Route
              path="/demo"
              element={
                <PrivateRoute>
                  <DemoPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/iup2025"
              element={
                <PrivateRoute>
                  <IUP2025 />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </AntdApp>
  );
}

export default App;