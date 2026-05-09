import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import Aluno from '../../../models/Aluno';
import { atualizar, buscar, cadastrar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { RotatingLines } from 'react-loader-spinner';

function FormAluno() {
	const navigate = useNavigate();

	const [aluno, setAluno] = useState<Aluno>({} as Aluno);
	const [confirmaSenha, setConfirmaSenha] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

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
		setAluno({
			...aluno,
			[e.target.name]: e.target.value,
		});
	}

	async function gerarNovoAluno(e: ChangeEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		if (id !== undefined) {
			try {
				await atualizar(`/alunos`, aluno, setAluno, {
					headers: { Authorization: token },
				});
				ToastAlerta('Aluno atualizado com sucesso!', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('403')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao atualizar o aluno.', 'erro');
				}
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
				await cadastrar(`/alunos`, { ...aluno, tipo: 'ALUNO' }, setAluno, {
					headers: { Authorization: token },
				});
				ToastAlerta('Aluno cadastrado com sucesso!', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('403')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao cadastrar o aluno.', 'erro');
				}
			}
		}

		setIsLoading(false);
		retornar();
	}

	function retornar() {
		navigate('/alunos');
	}

	return (
		<>
			<div className="container flex flex-col mx-auto items-center my-8">
				<h1 className="text-4xl text-center my-8">{id !== undefined ? 'Editar Aluno' : 'Cadastrar Aluno'}</h1>
				<form className="flex flex-col w-1/2 gap-4" onSubmit={gerarNovoAluno}>
					<div className="flex flex-col gap-2">
						<label htmlFor="nome" className="text-[#1E2729]">
							Nome:
						</label>
						<input
							type="text"
							placeholder="Digite o nome do aluno"
							name="nome"
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
							required
							disabled={id !== undefined}
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none disabled:opacity-50"
							value={aluno.usuario || ''}
							onChange={atualizarEstado}
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
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={aluno.foto || ''}
							onChange={atualizarEstado}
						/>
					</div>

					<div className="flex justify-between gap-4">
						<div className="flex flex-col gap-2 w-full">
							<label htmlFor="peso" className="text-[#1E2729]">
								Peso
							</label>
							<input
								type="text"
								placeholder="Insira o peso"
								name="peso"
								required
								className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
								value={aluno.peso || ''}
								onChange={atualizarEstado}
							/>
						</div>
						<div className="flex flex-col gap-2 w-full">
							<label htmlFor="altura" className="text-[#1E2729]">
								Altura
							</label>
							<input
								type="text"
								placeholder="Insira a altura"
								name="altura"
								required
								className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
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
			</div>
		</>
	);
}

export default FormAluno;
