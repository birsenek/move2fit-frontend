import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './LoginCadastroForm.css';
import Usuario from '../../models/Usuario';
import { cadastrarUsuario } from '../../services/Service';
import { FacebookLogo, GithubLogo, GoogleLogo, LinkedinLogo, Eye, EyeSlash } from '@phosphor-icons/react';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { RotatingLines } from 'react-loader-spinner';

const Cadastro: React.FC = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [confirmaSenha, setConfirmaSenha] = useState<string>('');
	const [usuario, setUsuario] = useState<Usuario>({
		id: 0,
		nome: '',
		usuario: '',
		senha: '',
		foto: '',
		peso: 0,
		altura: 0,
		imc: 0,
	});

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		if (showPassword) {
			timer = setTimeout(() => {
				setShowPassword(false);
			}, 2000);
		}
		return () => clearTimeout(timer);
	}, [showPassword]);

	// const navigate = useNavigate();

	// useEffect(() => {
	// 	if (usuario.id !== 0) {
	// 		retornar();
	// 	}
	// }, [usuario]);

	// function retornar() {
	// 	navigate('/login');
	// }

	function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
		setUsuario({
			...usuario,
			[e.target.name]: e.target.value,
		});
	}

	function handleConfirmarSenha(e: ChangeEvent<HTMLInputElement>) {
		setConfirmaSenha(e.target.value);
	}

	const handleNumericInput = (e: ChangeEvent<HTMLInputElement>, field: keyof Usuario) => {
		let value = e.target.value.replace(/[^0-9,.]/g, ''); // Permitir números, vírgulas e pontos

		value = value.replace(',', '.'); // Substituir vírgulas por pontos

		if (field === 'altura' && value.length > 2) {
			value = value.slice(0, value.length - 2) + '.' + value.slice(value.length - 2);
			if (parseFloat(value) > 3) {
				value = '3.00';
			}
		} else if (field === 'peso' && value.length > 2) {
			value = value.slice(0, value.length - 2) + '.' + value.slice(value.length - 2);
		}

		setUsuario((prev) => ({
			...prev,
			[field]: parseFloat(value),
		}));
	};

	async function cadastrarNovoUsuario(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (confirmaSenha === usuario.senha && usuario.senha.length >= 8) {
			setIsLoading(true);

			try {
				await cadastrarUsuario(`/usuarios/cadastrar`, usuario, setUsuario);
				ToastAlerta('Usuário cadastrado com sucesso!', 'sucesso');
				// setTimeout(() => {
				// 	navigate('/login');
				// 	window.location.reload();
				// }, 100); // Aguarda 2 segundos antes de redirecionar e recarregar a página
			} catch (error) {
				ToastAlerta('Erro ao cadastrar o usuário!', 'erro');
			}
		} else {
			ToastAlerta('Dados estão inconsistentes. Verifique as informações do cadastro', 'erro');
			setUsuario({ ...usuario, senha: '' });
			setConfirmaSenha('');
		}

		setIsLoading(false);
	}

	return (
		<>
			<form className="w-full max-w-md mx-auto p-6" onSubmit={cadastrarNovoUsuario}>
				<h1 className="text-3xl font-semibold mb-6 text-gray-700">Cadastro</h1>
				<div className="relative mb-3">
					<input
						type="text"
						name="nome"
						placeholder="Username"
						className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
						value={usuario.nome}
						onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
					/>
					<i className="bx bxs-user absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
				</div>
				<div className="relative mb-3">
					<input
						type="email"
						name="usuario"
						placeholder="Email"
						className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
						value={usuario.usuario}
						onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
					/>
					<i className="bx bxs-envelope absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
				</div>
				<div className="relative mb-3">
					<input
						type={showPassword ? 'text' : 'password'}
						id="senha"
						name="senha"
						placeholder="Senha"
						className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
						value={usuario.senha}
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
					<i className="bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
				</div>
				<div className="relative mb-3">
					<input
						type={showPassword ? 'text' : 'password'}
						id="confirmarSenha"
						name="confirmarSenha"
						placeholder="Confirmar Senha"
						className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
						value={confirmaSenha}
						onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfirmarSenha(e)}
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
					<i className="bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
				</div>
				<div className="relative mb-3">
					<input
						id="foto"
						name="foto"
						type="text"
						placeholder="Foto"
						className="w-full py-3 pl-5 pr-12 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
						value={usuario.foto}
						onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
					/>
					<i className="bx bxs-image absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
				</div>
				<div className="flex w-auto justify-between items-center space-x-4">
					<div className="w-full relative mb-3">
						<input
							id="peso"
							name="peso"
							type="number"
							placeholder="Peso (kg)"
							className="appearance-none peer w-full py-3 pl-5 pr-5 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
							value={usuario.peso ? `${usuario.peso}` : ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumericInput(e, 'peso')}
						/>
						<i className="bx bxs-weight absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
					</div>
					<div className="w-full relative mb-3">
						<input
							id="altura"
							name="altura"
							type="number"
							placeholder="Altura (m)"
							className="appearance-none peer w-full py-3 pl-5 pr-5 bg-gray-200 rounded-2xl text-gray-700 font-medium text-base outline-none placeholder-gray-500"
							value={usuario.altura ? `${usuario.altura}` : ''}
							onChange={(e: ChangeEvent<HTMLInputElement>) => handleNumericInput(e, 'altura')}
						/>
						<i className="bx bxs-ruler absolute right-5 top-1/2 transform -translate-y-1/2 text-2xl text-gray-700"></i>
					</div>
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
						<span>Cadastrar</span>
					)}
				</button>
				<div className="@container">
					<p className="text-sm text-gray-700 mt-1 mb-3 sm:hidden max-lg:hidden">
						cadastre-se com redes sociais
					</p>
					<div className="flex justify-center space-x-4 sm:hidden max-lg:hidden">
						<a href="#" className="inline-flex p-2 ">
							<GoogleLogo size={35} weight="bold" className="hover:text-[#FD6101]" />
						</a>
						<a href="#" className="inline-flex p-2 ">
							<FacebookLogo size={35} weight="bold" className="hover:text-[#FD6101]" />
						</a>
						<a href="#" className="inline-flex p-2 ">
							<GithubLogo size={35} weight="bold" className="hover:text-[#FD6101]" />
						</a>
						<a href="#" className="inline-flex p-2 ">
							<LinkedinLogo size={35} weight="bold" className="hover:text-[#FD6101]" />
						</a>
					</div>
				</div>
			</form>
		</>
	);
};

export default Cadastro;
