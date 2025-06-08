import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CadastroLogin from './pages/CadastroLogin';
import Dashboard from './pages/Dashboard';
import ClienteDetalhes from './pages/ClienteDetalhes'; // 👈 Importa o novo
import Agendamentos from './pages/Agendamentos';
import Estoque from './pages/Estoque';
import Fornecedores from './pages/Fornecedores';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/agendamentos" 
        element={token ? <Agendamentos /> : <Navigate to="/" />}/>
        <Route path="/" element={<CadastroLogin />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/clientes/:id"
          element={token ? <ClienteDetalhes /> : <Navigate to="/" />} // 👈 Nova rota protegida
        />
        <Route
          path="/estoque"
          element={token ? <Estoque /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
