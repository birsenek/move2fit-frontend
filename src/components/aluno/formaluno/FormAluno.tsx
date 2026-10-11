import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import Aluno from '../../../models/Aluno';
import { api, atualizar, buscar, cadastrar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { RotatingLines } from 'react-loader-spinner';
import BuscaAluno, { AlunoEncontrado } from './BuscaAluno';

function FormAluno() {
	const navigate = useNavigate();

	const [aluno, setAluno] = useState<Aluno>({} as Aluno);
	const [confirmaSenha, setConfirmaSenha] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selecionado, setSelecionado] = useState<AlunoEncontrado | null>(null);
	const emailRequest = useRef(0);

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	const { id } = useParams<{ id: string }>();

	async function buscarPorId(id: string) {
		try {
			await buscar(`/alunos/${id}`, setAluno, {
				headers: { Authorization: token },
			});
		} catch (error: any) {
			if (error.toString().includes('403')) {
				handleLogout();
			}
		}
	}

	useEffect(() => {
		if (token === '') {
			ToastAlerta('Você precisa estar logado!', 'info');
			navigate('/');
		}
	}, [token]);

	useEffect(() => {
		if (id !== undefined) {
			buscarPorId(id);
		}
	}, [id]);

	function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.name === 'usuario') emailRequest.current++;
		setAluno({
			...aluno,
			[e.target.name]: e.target.value,
		});
	}

	async function vincularAluno() {
		if (!selecionado || isLoading) return;
		if (selecionado.vinculado) {
			navigate(`/alunos/perfil/${selecionado.id}`);
			return;
		}
		setIsLoading(true);
		try {
			await api.post(`/alunos/${selecionado.id}/vincular`, {}, { headers: { Authorization: token } });
			ToastAlerta('Aluno vinculado à sua lista!', 'sucesso');
			retornar();
		} catch (error: any) {
			if (error.response?.status === 401) handleLogout();
			ToastAlerta(error.response?.data?.message || 'Não foi possível vincular o aluno.', 'erro');
		} finally {
			setIsLoading(false);
		}
	}

	async function verificarEmailExistente(email: string) {
		if (id || !email) return;
		const version = emailRequest.current;
		try {
			const { data } = await api.get<AlunoEncontrado[]>('/alunos/buscar', {
				params: { q: email.trim().toLowerCase() },
				headers: { Authorization: token },
			});
			const existente = data.find((item) => item.usuario.trim().toLowerCase() === email.trim().toLowerCase());
			if (existente && version === emailRequest.current) setSelecionado(existente);
		} catch {
			/* O envio verifica novamente se o e-mail já existe. */
		}
	}

	async function gerarNovoAluno(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (isLoading) return;
		emailRequest.current++;
		setIsLoading(true);

		if (id !== undefined) {
			try {
				await atualizar(`/alunos`, { id: aluno.id, nome: aluno.nome, foto: aluno.foto }, setAluno, {
					headers: { Authorization: token },
				});
				ToastAlerta('Aluno atualizado com sucesso!', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('403')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao atualizar o aluno.', 'erro');
				}
				setIsLoading(false);
				return;
			}
		} else {
			if (!aluno.senha || aluno.senha.length < 8) {
				ToastAlerta('A senha deve ter no mínimo 8 caracteres.', 'erro');
				setIsLoading(false);
				return;
			}
			if (aluno.senha !== confirmaSenha) {
				ToastAlerta('As senhas não coincidem.', 'erro');
				setIsLoading(false);
				return;
			}
			try {
				await cadastrar(
					`/alunos`,
					{ ...aluno, peso: Number(aluno.peso), altura: Number(aluno.altura), tipo: 'ALUNO' },
					setAluno,
					{
						headers: { Authorization: token },
					},
				);
				ToastAlerta('Aluno cadastrado ou vinculado à sua lista!', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('403')) {
					handleLogout();
				} else {
					const mensagem = error.response?.data?.message;
					ToastAlerta(
						Array.isArray(mensagem) ? mensagem.join(' ') : mensagem || 'Erro ao cadastrar o aluno.',
						'erro',
					);
				}
				setIsLoading(false);
				return;
			}
		}

		setIsLoading(false);
		retornar();
	}

	function retornar() {
		navigate('/alunos');
	}

	if (usuario.tipo !== 'PERSONAL_TRAINER')
		return <p className="text-center my-12">Esta área é exclusiva para treinadores.</p>;

	return (
		<>
			<div className="container flex flex-col mx-auto items-center my-8">
				<h1 className="text-4xl text-center my-8">
					{id !== undefined ? 'Editar Aluno' : 'Cadastrar ou vincular aluno'}
				</h1>
				<div className="w-full max-w-2xl px-4">
					{id === undefined && (
						<BuscaAluno
							token={token}
							onSelecionar={(item) => {
								emailRequest.current++;
								setSelecionado(item);
							}}
						/>
					)}
					{selecionado ? (
						<div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
							<p className="text-xl font-semibold">{selecionado.nome}</p>
							<p>{selecionado.usuario}</p>
							<p className="text-sm my-3">
								{selecionado.vinculado
									? 'Este aluno já está na sua lista.'
									: 'Será adicionado apenas o vínculo com você. O cadastro e os outros treinadores serão preservados.'}
							</p>
							<div className="flex gap-4">
								<button
									type="button"
									disabled={isLoading}
									className="underline"
									onClick={() => {
										emailRequest.current++;
										setSelecionado(null);
									}}>
									Cadastrar outro aluno
								</button>
								<button
									type="button"
									disabled={isLoading}
									className="rounded-lg bg-[#FD6101] text-white font-semibold px-4 py-2 disabled:opacity-50"
									onClick={vincularAluno}>
									{isLoading
										? 'Vinculando...'
										: selecionado.vinculado
											? 'Ver aluno'
											: 'Vincular aluno'}
								</button>
							</div>
						</div>
					) : (
						<form className="flex flex-col gap-4" onSubmit={gerarNovoAluno}>
							<div className="flex flex-col gap-2">
								<label htmlFor="nome" className="text-[#1E2729]">
									Nome:
								</label>
								<input
									type="text"
									placeholder="Digite o nome do aluno"
									name="nome"
									id="nome"
									required
									className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
									value={aluno.nome || ''}
									onChange={atualizarEstado}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label htmlFor="usuario" className="text-[#1E2729]">
									E-mail:
								</label>
								<input
									type="email"
									placeholder="Digite o e-mail do aluno"
									name="usuario"
									id="usuario"
									required
									disabled={id !== undefined}
									className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none disabled:opacity-50"
									value={aluno.usuario || ''}
									onChange={atualizarEstado}
									onBlur={(event) => verificarEmailExistente(event.target.value)}
								/>
							</div>
							{id === undefined && (
								<>
									<div className="flex flex-col gap-2">
										<label htmlFor="senha" className="text-[#1E2729]">
											Senha (mínimo 8 caracteres):
										</label>
										<input
											type="password"
											placeholder="Digite a senha do aluno"
											name="senha"
											id="senha"
											minLength={8}
											required
											className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
											value={aluno.senha || ''}
											onChange={atualizarEstado}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<label htmlFor="confirmaSenha" className="text-[#1E2729]">
											Confirmar Senha:
										</label>
										<input
											type="password"
											placeholder="Confirme a senha do aluno"
											name="confirmaSenha"
											id="confirmaSenha"
											minLength={8}
											required
											className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
											value={confirmaSenha}
											onChange={(e) => setConfirmaSenha(e.target.value)}
										/>
									</div>
								</>
							)}
							<div className="flex flex-col gap-2">
								<label htmlFor="foto" className="text-[#1E2729]">
									Foto
								</label>
								<input
									type="text"
									placeholder="Insira o link da foto do Aluno"
									name="foto"
									id="foto"
									className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
									value={aluno.foto || ''}
									onChange={atualizarEstado}
								/>
							</div>

							<div className="flex justify-between gap-4">
								<div className="flex flex-col gap-2 w-full">
									<p className="text-sm text-gray-600">
										{id
											? 'Registre novas medidas no histórico de avaliações do perfil.'
											: 'Estas medidas serão salvas como a primeira avaliação, com a data de hoje.'}
									</p>
									<label htmlFor="peso" className="text-[#1E2729]">
										Peso
									</label>
									<input
										type="number"
										placeholder="Insira o peso"
										name="peso"
										id="peso"
										min="0.01"
										step="0.01"
										required
										className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
										disabled={id !== undefined}
										value={aluno.peso || ''}
										onChange={atualizarEstado}
									/>
								</div>
								<div className="flex flex-col gap-2 w-full">
									<label htmlFor="altura" className="text-[#1E2729]">
										Altura
									</label>
									<input
										type="number"
										placeholder="Insira a altura"
										name="altura"
										id="altura"
										min="0.01"
										step="0.01"
										required
										className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
										disabled={id !== undefined}
										value={aluno.altura || ''}
										onChange={atualizarEstado}
									/>
								</div>
							</div>

							<div className="flex justify-center items-center gap-10">
								<button
									type="button"
									onClick={retornar}
									className="rounded-lg disabled:bg-slate-200 hover:border-3 bg-[#FD6101] hover:bg-[#B63700] text-white font-bold w-1/2 mx-auto py-2 flex justify-center uppercase">
									Cancelar
								</button>
								<button
									type="submit"
									disabled={isLoading}
									className="rounded-lg disabled:bg-slate-200 border-3 border-[#FD6101] hover:bg-[#FD6101] text-[#FD6101] hover:text-white font-bold w-1/2 mx-auto py-2 flex justify-center uppercase">
									{isLoading ? (
										<RotatingLines
											strokeColor="white"
											strokeWidth="5"
											animationDuration="0.75"
											width="24"
											visible={true}
										/>
									) : (
										<span>Salvar</span>
									)}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</>
	);
}

export default FormAluno;
