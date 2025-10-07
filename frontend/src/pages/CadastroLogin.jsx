import './CadastroLogin.css';
import logo from '../assets/LOGO.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CadastroLogin() {
  const navigate = useNavigate();

  const [cadastro, setCadastro] = useState({
    nome: '',
    email: '',
    telefone: '',
    descricao: '',
    senha: '',
    confirmar: ''
  });

  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (cadastro.senha !== cadastro.confirmar) {
      return alert('As senhas não coincidem.');
    }

    try {
      const resposta = await fetch(`http://localhost:3001/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cadastro)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        if (dados?.token) {
          localStorage.setItem('token', dados.token);
          navigate('/dashboard');
        } else {
          alert('Cadastro realizado! Faça login para continuar.');
        }
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
      const resposta = await fetch(`http://localhost:3001/login`, {
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
    <>
      <div className="top-bar"></div>
      <div className="container">
        <div className="form-container">
          <form onSubmit={handleCadastro} className="form-box">
            <h2>Cadastrar</h2>
            <input placeholder="Nome" onChange={e => setCadastro({ ...cadastro, nome: e.target.value })} />
            <input placeholder="Email" type="email" onChange={e => setCadastro({ ...cadastro, email: e.target.value })} />
            <input placeholder="Telefone" onChange={e => setCadastro({ ...cadastro, telefone: e.target.value })} />
            <input placeholder="Descrição" onChange={e => setCadastro({ ...cadastro, descricao: e.target.value })} />
            <input placeholder="Senha" type="password" onChange={e => setCadastro({ ...cadastro, senha: e.target.value })} />
            <input placeholder="Confirmação Senha" type="password" onChange={e => setCadastro({ ...cadastro, confirmar: e.target.value })} />
            <button type="submit" className="btn-primary">Registrar</button>
          </form>

          <form onSubmit={handleLogin} className="form-box">
            <h2>Logar</h2>
            <input placeholder="Email" type="email" value={emailLogin} onChange={e => setEmailLogin(e.target.value)} />
            <input placeholder="Senha" type="password" value={senhaLogin} onChange={e => setSenhaLogin(e.target.value)} />
            <div className="link">Esqueceu sua senha?</div>
            <button type="submit" className="btn-primary">Entrar</button>
            <div className="checkbox-line">
              <input type="checkbox" id="lembrar" />
              <label htmlFor="lembrar">Lembre-me</label>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CadastroLogin;
