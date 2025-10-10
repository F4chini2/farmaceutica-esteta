// src/components/LogoutButton.jsx
export default function LogoutButton() {
  const sair = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  return (
    <button className="btn-danger" onClick={sair}>
      ↩️ Sair
    </button>
  );
}
