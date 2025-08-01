import { useAuth } from '@/contexts';
import LoginForm from '@/components/admin/auth/LoginForm';
import HomePage from '@/components/layout/HomePage';
import './App.css';

function App() {
  const { currentUser, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizar tela de login ou homepage baseado na autenticação
  return currentUser ? <HomePage /> : <LoginForm />;
}

export default App;
