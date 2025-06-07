import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CadastroLogin() {
  const navigate = useNavigate();

  // Estados do formulário de cadastro
  const [cadastro, setCadastro] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmar: ''
  });

  // Estados do formulário de login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (cadastro.senha !== cadastro.confirmar) {
      return alert('As senhas não coincidem.');
    }

    try {
      const resposta = await fetch('http://localhost:3001/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cadastro)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Cadastro realizado com sucesso!');
      } else {
        alert(dados.erro || 'Erro no cadastro');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const resposta = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLogin, senha: senhaLogin })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem('token', dados.token);
        navigate('/dashboard');
      } else {
        alert(dados.erro || 'Erro no login');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', padding: '40px' }}>
      {/* Cadastro */}
      <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column' }}>
        <h2>Cadastrar</h2>
        <input placeholder="Nome" onChange={e => setCadastro({ ...cadastro, nome: e.target.value })} />
        <input placeholder="Email" type="email" onChange={e => setCadastro({ ...cadastro, email: e.target.value })} />
        <input placeholder="Telefone" onChange={e => setCadastro({ ...cadastro, telefone: e.target.value })} />
        <input placeholder="Senha" type="password" onChange={e => setCadastro({ ...cadastro, senha: e.target.value })} />
        <input placeholder="Confirmação Senha" type="password" onChange={e => setCadastro({ ...cadastro, confirmar: e.target.value })} />
        <button type="submit">Registrar</button>
      </form>

      {/* Login */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
        <h2>Logar</h2>
        <input placeholder="Email" type="email" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} />
        <input placeholder="Senha" type="password" value={senhaLogin} onChange={e => setSenhaLogin(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default CadastroLogin;
