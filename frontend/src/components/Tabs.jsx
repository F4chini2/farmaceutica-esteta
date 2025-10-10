import { NavLink, useNavigate } from 'react-router-dom';

function isAdminFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload?.perfil === 'admin' || payload?.tipo === 'admin' ||
           payload?.role === 'admin' || payload?.is_admin === true;
  } catch {
    return false;
  }
}

export default function Tabs() {
  const navigate = useNavigate();
  const isAdmin = isAdminFromToken();

  const itensBase = [
    { label: 'Clientes', to: '/dashboard' },
    { label: 'Agendamentos', to: '/agendamentos' },
    { label: 'Históricos', to: '/historico' },
    { label: 'Fornecedores', to: '/fornecedores' },
    { label: 'Estoque', to: '/estoque' },
  ];

  const itensAdmin = [
    { label: 'Boletos', to: '/boletos' },
    { label: 'Boletos-Pagos', to: '/boletos-pagos' },
    { label: 'Usuários', to: '/usuarios' },
  ];

  const itens = isAdmin ? [...itensBase, ...itensAdmin] : itensBase;

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      margin: '16px 0',
      flexWrap: 'wrap'
    }}>
      {itens.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => 'tab' + (isActive ? ' active' : '')}
        >
          {it.label}
        </NavLink>
      ))}

      {/* Botão de logout à direita */}
      <button
        onClick={handleLogout}
        className="tab"
        style={{ backgroundColor: '#fce4e4', color: '#b84c4c' }}
      >
        🚪 Sair
      </button>
    </div>
  );
}
