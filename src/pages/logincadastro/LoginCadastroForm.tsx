import React, { useState } from 'react';
import './LoginCadastroForm.css'; // Importe o CSS
import { Link } from 'react-router-dom';
import Login from './Login';
import Cadastro from './Cadastro';

const LoginCadastroForm: React.FC = () => {
	const [isRegisterMode, setIsRegisterMode] = useState(false);

	const handleToggle = () => {
		setIsRegisterMode(!isRegisterMode);
	};

	return (
		<div id="body">
			<div className={`container container-cadastro ${isRegisterMode ? 'active' : ''}`}>
				<div className={`form-box ${isRegisterMode ? '' : 'login'}`}>
					<Login />
				</div>

				<div className={`form-box register ${isRegisterMode ? 'register' : ''}`}>
					<Cadastro />
				</div>

				<div className="toggle-box">
					<div className="toggle-panel toggle-left">
						<h1 className="text-3xl font-semibold">Bem Vindo de volta!</h1>
						<p className="mb-5 text-sm">Não tem uma conta?</p>
						<button onClick={handleToggle} className="btn register-btn">
							<Link to="/cadastro">Cadastre-se</Link>
						</button>
					</div>
					<div className="toggle-panel toggle-right">
						<h1 className="text-3xl font-semibold">Olá, Seja Bem Vindo!</h1>
						<p className="mb-5 text-sm">Já tem uma conta?</p>
						<button onClick={handleToggle} className="btn login-btn">
							<Link to="/login">Login</Link>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginCadastroForm;
