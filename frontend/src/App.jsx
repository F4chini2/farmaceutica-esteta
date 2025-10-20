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
import Usuarios from './pages/Usuarios'; // ✅ nova página

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* rota de login */}
        <Route path="/" element={<Login />} />

        {/* rota pública do pré-cadastro */}
        <Route path="/pre-cadastro" element={<PreCadastro />} />

        {/* rotas protegidas */}
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/clientes/:id" element={token ? <ClienteDetalhes /> : <Navigate to="/" />} />
        <Route path="/clientes/:id/historico" element={token ? <Historico /> : <Navigate to="/" />} />
        <Route path="/clientes/:id/agendar" element={token ? <Agendar /> : <Navigate to="/" />} />
        <Route path="/historico" element={token ? <Historico /> : <Navigate to="/" />} />
        <Route path="/agendamentos" element={token ? <Agendamentos /> : <Navigate to="/" />} />
        <Route path="/estoque" element={token ? <Estoque /> : <Navigate to="/" />} />
        <Route path="/fornecedores" element={token ? <Fornecedores /> : <Navigate to="/" />} />
        <Route path="/fornecedores/:id/boletos" element={token ? <CadastrarBoleto /> : <Navigate to="/" />} />
        <Route path="/clientesfull" element={token ? <ClientesFull /> : <Navigate to="/" />} />
        <Route path="/boletos" element={token ? <Boletos /> : <Navigate to="/" />} />
        <Route path="/boletos-pagos" element={token ? <BoletosPagos /> : <Navigate to="/" />} />
        {/* ✅ nova rota protegida de usuários */}
        <Route path="/usuarios" element={token ? <Usuarios /> : <Navigate to="/" />} />
        {/* ✅ acesso ao cadastro/login via botão "Novo Usuário" */}
        <Route path="/usuarios/novo" element={token ? <UsuariosFull /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
