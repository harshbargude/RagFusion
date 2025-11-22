
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { PrivateRoute } from '../routes/PrivateRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Navbar } from '../components/Navbar';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { Profile } from '../pages/profile';
import { ChatLayout } from '../features/chat/ChatLayout';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                  <Home />
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatLayout />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:sessionId"
              element={
                <PrivateRoute>
                  <ChatLayout />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

