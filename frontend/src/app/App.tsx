import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';
import { useAuth } from '../features/auth/useAuth';
import { PrivateRoute } from '../routes/PrivateRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { ChatLayout } from '../features/chat/ChatLayout';
import { RAGNavbar } from '../components/RAGNavbar';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RAGNavbar 
        isLoggedIn={isAuthenticated} 
        user={user ? { name: `${user.firstName} ${user.lastName}` } : undefined}
        onLogout={handleLogout}
      />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                  <Home />
              }
            />
            {/* <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            /> */}
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

