import { UserCircle, List } from '@phosphor-icons/react';
import { ReactNode, useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastAlerta } from '../../utils/ToastAlerta';

function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const { usuario, handleLogout } = useContext(AuthContext);
	const navigate = useNavigate();
	const menuRef = useRef<HTMLDivElement | null>(null);

	function logout() {
		handleLogout();
		ToastAlerta('O Usuário foi desconectado com sucesso!', 'success');
		navigate('/');
		setIsOpen(false); // Fecha o menu ao clicar em "Sair"
	}

	// Fecha o menu se o usuário clicar fora
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	let component: ReactNode;
	if (usuario.token !== '') {
		component = (
			<nav className="bg-[#1E2729] w-full border-b-2 border-[#FD6101] h-20 flex items-center">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
					<div className="flex items-center justify-between h-full flex-wrap">
						<div className="flex items-center">
							<Link to="/home">
								<img src="/images/Logo.svg" alt="Move2Fit" className="h-10" />
							</Link>
						</div>

						{/* Menu desktop */}
						<div className="hidden md:flex items-center space-x-4 sm:space-x-6">
							<Link to="/home" className="text-white hover:text-orange-500 transition-colors">
								Home
							</Link>
							<Link to="/sobre" className="text-white hover:text-orange-500 transition-colors">
								Sobre
							</Link>
							<Link to="/exercicios" className="text-white hover:text-orange-500 transition-colors">
								Exercícios
							</Link>
							<Link to="/categorias" className="text-white hover:text-orange-500 transition-colors">
								Categorias
							</Link>
							<Link to="/alunos" className="text-white hover:text-orange-500 transition-colors">
								Alunos
							</Link>
							<Link to="/perfil">
								{usuario.foto ? (
									<img
										src={usuario.foto}
										alt={`Foto de perfil de ${usuario.nome}`}
										className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-orange-500"
									/>
								) : (
									<UserCircle
										size={40}
										className="text-gray-300 cursor-pointer hover:text-white flex-shrink-0"
									/>
								)}
							</Link>

							<Link
								to="#"
								onClick={logout}
								className="text-white hover:text-orange-500 transition-colors">
								Sair
							</Link>
						</div>

						<div className="md:hidden flex gap-4 items-center">
							<Link to="/perfil">
								{usuario.foto ? (
									<img
										src={usuario.foto}
										alt={`Foto de perfil de ${usuario.nome}`}
										className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-orange-500"
									/>
								) : (
									<UserCircle
										size={40}
										className="text-gray-300 cursor-pointer hover:text-white flex-shrink-0"
									/>
								)}
							</Link>
							{/* Ícone do menu mobile */}
							<button className="text-white" onClick={() => setIsOpen(!isOpen)}>
								<List size={32} />
							</button>
						</div>
					</div>
				</div>

				{/* Menu mobile */}
				{isOpen && (
					<div
						ref={menuRef}
						className="md:hidden z-50 bg-[#1A1D1F] border-t border-gray-800 absolute w-full left-0 top-20">
						<div className="px-4 py-3 space-y-2">
							<Link
								to="/home"
								className="block px-3 py-2 text-white hover:text-orange-500 border-b"
								onClick={() => setIsOpen(false)}>
								Home
							</Link>
							<Link
								to="/sobre"
								className="block px-3 py-2 text-white hover:text-orange-500"
								onClick={() => setIsOpen(false)}>
								Sobre
							</Link>
							<Link
								to="/exercicios"
								className="block px-3 py-2 text-white hover:text-orange-500"
								onClick={() => setIsOpen(false)}>
								Exercícios
							</Link>
							<Link
								to="/categorias"
								className="block px-3 py-2 text-white hover:text-orange-500"
								onClick={() => setIsOpen(false)}>
								Categorias
							</Link>
							<Link 
								to="/alunos" 
								className="block px-3 py-2 text-white hover:text-orange-500"
								onClick={() => setIsOpen(false)}>
								Alunos
							</Link>
							<Link to="#" onClick={logout} className="block px-3 py-2 text-white hover:text-orange-500">
								Sair
							</Link>
						</div>
					</div>
				)}
			</nav>
		);
	}

	return <>{component}</>;
}
export default Navbar;
