import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CadastroLogin from './pages/CadastroLogin'; // 👈 novo componente

import Dashboard from './pages/Dashboard';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
