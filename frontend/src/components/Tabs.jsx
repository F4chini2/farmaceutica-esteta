import { useLocation, useNavigate } from 'react-router-dom';
import './Tabs.css';

function Tabs() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
  { label: 'Clientes', path: '/dashboard' },
  { label: 'Agendamentos', path: '/agendamentos' },
  { label: 'Histórico', path: '/historico' },
  { label: 'Estoque', path: '/estoque' },
  { label: 'Fornecedores', path: '/fornecedores' },
  { label: 'Boletos', path: '/boletos' },
  { label: 'Boletos Pagos', path: '/boletos-pagos' },
];


  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`tab ${pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
