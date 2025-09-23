import { Envelope, Eye, EyeSlash, FacebookLogo, GithubLogo, GoogleLogo, LinkedinLogo } from '@phosphor-icons/react';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import './LoginCadastroForm.css';
import UsuarioLogin from '../../models/UsuarioLogin';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RotatingLines } from 'react-loader-spinner';

function Login() {
	const [showPassword, setShowPassword] = useState(false);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const navigate = useNavigate();

	const [usuarioLogin, setUsuarioLogin] = useState<UsuarioLogin>({} as UsuarioLogin);

	const { usuario, handleLogin, isLoading } = useContext(AuthContext);

	function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
		setUsuarioLogin({
			...usuarioLogin,
			[e.target.name]: e.target.value,
		});
	}

	useEffect(() => {
		if (usuario.token !== '') {
			navigate('/home');
		}
	}, [usuario]);

	function login(e: ChangeEvent<HTMLFormElement>) {
		e.preventDefault();
		handleLogin(usuarioLogin);
	}

	return (
		<form className="w-full max-w-md mx-auto" onSubmit={login}>
			<h1 className="text-3xl font-semibold pb-8 text-[#1E2729]">Login</h1>
			<div className="relative mb-6">
				<input
					type="text"
					id="usuario"
					name="usuario"
					placeholder="E-mail"
					required
					className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-[#1E2729] font-medium text-base outline-none placeholder-gray-500"
					value={usuarioLogin.usuario}
					onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
				/>
				<Envelope size={25} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
			</div>
			<div className="relative mb-6">
				<input
					type={showPassword ? 'text' : 'password'}
					id="senha"
					name="senha"
					placeholder="Senha"
					required
					className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-[#1E2729] font-medium text-base outline-none placeholder-gray-500"
					value={usuarioLogin.senha}
					onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
				/>
				{showPassword ? (
					<Eye
						size={25}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
						onClick={togglePasswordVisibility}
					/>
				) : (
					<EyeSlash
						size={25}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
						onClick={togglePasswordVisibility}
					/>
				)}
			</div>

			<button
				type="submit"
				className="w-full h-12 bg-[#FD6101] rounded-2xl shadow-md text-white font-semibold text-base cursor-pointer flex items-center justify-center">
				{isLoading ? (
					<RotatingLines
						strokeColor="white"
						strokeWidth="5"
						animationDuration="0.75"
						width="24"
						visible={true}
					/>
				) : (
					<span>Logar</span>
				)}
			</button>

			<p className="text-sm text-[#1E2729] mt-6 mb-6">Conecte-se com suas redes sociais</p>
			<div className="flex justify-center space-x-3">
				<a href="#" className="inline-flex p-2  rounded-2xl text-2xl ">
					<GoogleLogo
						size={35}
						weight="bold"
						className="text-[#1E2729] hover:text-[#FD6101] transition-all duration-130 delay-100"
					/>
				</a>
				<a href="#" className="inline-flex p-2  rounded-2xl text-2xl ">
					<FacebookLogo
						size={35}
						weight="bold"
						className="text-[#1E2729] hover:text-[#FD6101] transition-all duration-130 delay-100"
					/>
				</a>
				<a href="#" className="inline-flex p-2  rounded-2xl text-2xl ">
					<GithubLogo
						size={35}
						weight="bold"
						className="text-[#1E2729] hover:text-[#FD6101] transition-all duration-130 delay-100"
					/>
				</a>
				<a href="#" className="inline-flex p-2  rounded-2xl text-2xl ">
					<LinkedinLogo
						size={35}
						weight="bold"
						className="text-[#1E2729] hover:text-[#FD6101] transition-all duration-130 delay-100"
					/>
				</a>
			</div>
		</form>
	);
}

export default Login;
