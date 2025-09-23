import { createContext, ReactNode, useState } from 'react';
import UsuarioLogin from '../models/UsuarioLogin';
import { login } from '../services/Service';
import { ToastAlerta } from '../utils/ToastAlerta';

interface AuthContextProps {
	usuario: UsuarioLogin;
	handleLogout(): void;
	handleLogin(usuario: UsuarioLogin): Promise<void>;
	isLoading: boolean;
}

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: AuthProviderProps) {
	const [usuario, setUsuario] = useState<UsuarioLogin>({
		id: 0,
		usuario: '',
		senha: '',
		token: '',
		nome: '',
		foto: '',
		peso: 0,
		altura: 0,
		imc: 0,
		classificacao: '',
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleLogin(usuarioLogin: UsuarioLogin) {
		setIsLoading(true);

		try {
			await login('/usuarios/logar', usuarioLogin, setUsuario);
			ToastAlerta('Usuário foi autenticado com sucesso!', 'sucesso');
		} catch (error) {
			ToastAlerta('Os dados do Usuário estão inconsistentes!', 'erro');
		}

		setIsLoading(false);
	}

	function handleLogout() {
		setUsuario({
			id: 0,
			usuario: '',
			senha: '',
			token: '',
			nome: '',
			foto: '',
			peso: 0,
			altura: 0,
			imc: 0,
			classificacao: '',
		});
	}

	return (
		<AuthContext.Provider value={{ usuario, handleLogin, handleLogout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}
