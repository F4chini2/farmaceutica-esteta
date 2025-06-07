import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CadastroLogin from './pages/CadastroLogin';
import Dashboard from './pages/Dashboard';
import ClienteDetalhes from './pages/ClienteDetalhes'; // 👈 Importa o novo

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CadastroLogin />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/clientes/:id"
          element={token ? <ClienteDetalhes /> : <Navigate to="/" />} // 👈 Nova rota protegida
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
