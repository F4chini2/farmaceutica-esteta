// Removivel //
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Login bem-sucedido!');
        localStorage.setItem('token', dados.token);
        navigate('/dashboard'); // Redireciona sem recarregar a página
      } else {
        alert(dados.erro || 'Erro no login');
      }
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      alert('Erro de conexão com o servidor');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      /><br />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default Login;
