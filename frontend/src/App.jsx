import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CadastroLogin from './pages/CadastroLogin';
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

// 🔹 importa o pré-cadastro (ajuste o nome do arquivo se estiver diferente)
import PreCadastro from './pages/PreCadastro';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* rota de login */}
        <Route path="/" element={<CadastroLogin />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
