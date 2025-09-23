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
			} catch (error: any) {
				if (error.toString().includes('403')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao atualizar o aluno.', 'erro');
				}
			}
		} else {
			try {
				await cadastrar(`/alunos`, aluno, setAluno, {
					headers: { Authorization: token },
				});
				ToastAlerta('Aluno foi cadastrado com sucesso', 'sucesso');
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
							value={aluno.nome}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="email" className="text-[#1E2729]">
							E-mail:
						</label>
						<input
							type="text"
							placeholder="Digite o e-mail do aluno"
							name="email"
							required
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={aluno.email}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="foto" className="text-[#1E2729]">
							Foto
						</label>
						<input
							type="text"
							placeholder="Insira o link da foto do Aluno"
							name="foto"
							required
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={aluno.foto}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>

					<div className="flex justify-between gap-4">
						<div className="flex flex-col gap-2 w-full">
							<label htmlFor="foto" className="text-[#1E2729]">
								Peso
							</label>
							<input
								type="text"
								placeholder="Insira o peso"
								name="peso"
								required
								className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
								value={aluno.peso}
								onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
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
								value={aluno.altura}
								onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
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
