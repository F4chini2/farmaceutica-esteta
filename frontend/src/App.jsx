import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CadastroLogin from './pages/CadastroLogin';
import Dashboard from './pages/Dashboard';
import ClienteDetalhes from './pages/ClienteDetalhes'; // 👈 Importa o novo
import Agendamentos from './pages/Agendamentos';
import Estoque from './pages/Estoque';
import Fornecedores from './pages/Fornecedores';
import NovoCliente from './pages/NovoCliente';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/fornecedores" element={<Fornecedores />}/>
        <Route path="/agendamentos" element={token ? <Agendamentos /> : <Navigate to="/" />}/>
        <Route path="/" element={<CadastroLogin />}/>
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />}/>
        <Route path="/clientes/:id" element={token ? <ClienteDetalhes /> : <Navigate to="/" />}/>
        <Route path="/estoque" element={token ? <Estoque /> : <Navigate to="/" />}/>
        <Route path="/dashboard/novo-cliente" element={<NovoCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
