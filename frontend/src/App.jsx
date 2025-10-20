import UsuariosFull from './pages/UsuariosFull';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClienteDetalhes from './pages/ClienteDetalhes';
import Agendamentos from './pages/Agendamentos';
import Estoque from './pages/Estoque';
import Fornecedores from './pages/Fornecedores';
import Historico from './pages/Historico';
import ClientesFull from './pages/ClientesFull';
import Agendar from './pages/Agendar';
import Boletos from './pages/Boletos';
import BoletosPagos from './pages/BoletosPagos';
import CadastrarBoleto from './pages/CadastrarBoletos';
import PreCadastro from './pages/PreCadastro';
import Usuarios from './pages/Usuarios';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PÚBLICAS ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/pre-cadastro" element={<PreCadastro />} />

        {/* ===== REDIRECIONAMENTOS ===== */}
        {/* Raiz: se logado vai para clientes (Dashboard), senão login */}
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        {/* 404: comportamento igual ao da raiz */}
        <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

        {/* ===== PROTEGIDAS ===== */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />

        <Route path="/clientes/:id" element={token ? <ClienteDetalhes /> : <Navigate to="/login" replace />} />
        <Route path="/clientes/:id/historico" element={token ? <Historico /> : <Navigate to="/login" replace />} />
        <Route path="/clientes/:id/agendar" element={token ? <Agendar /> : <Navigate to="/login" replace />} />
        <Route path="/clientesfull" element={token ? <ClientesFull /> : <Navigate to="/login" replace />} />

        <Route path="/historico" element={token ? <Historico /> : <Navigate to="/login" replace />} />
        <Route path="/agendamentos" element={token ? <Agendamentos /> : <Navigate to="/login" replace />} />
        <Route path="/estoque" element={token ? <Estoque /> : <Navigate to="/login" replace />} />
        <Route path="/fornecedores" element={token ? <Fornecedores /> : <Navigate to="/login" replace />} />
        <Route path="/fornecedores/:id/boletos" element={token ? <CadastrarBoleto /> : <Navigate to="/login" replace />} />
        <Route path="/boletos" element={token ? <Boletos /> : <Navigate to="/login" replace />} />
        <Route path="/boletos-pagos" element={token ? <BoletosPagos /> : <Navigate to="/login" replace />} />

        {/* Usuários continua acessível, mas não é mais tela inicial */}
        <Route path="/usuarios" element={token ? <Usuarios /> : <Navigate to="/login" replace />} />
        <Route path="/usuarios/novo" element={token ? <UsuariosFull /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
