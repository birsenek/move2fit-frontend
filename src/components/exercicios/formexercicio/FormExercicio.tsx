import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Categoria from '../../../models/Categoria';
import Exercicio from '../../../models/Exercicio';
import { AuthContext } from '../../../contexts/AuthContext';
import { atualizar, buscar, cadastrar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { RotatingLines } from 'react-loader-spinner';

function FormExercicio() {
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [categorias, setCategorias] = useState<Categoria[]>([]);

	const [categoria, setCategoria] = useState<Categoria>({ id: 0, nome: '', descricao: '', icone: '' });
	const [exercicio, setExercicio] = useState<Exercicio>({} as Exercicio);

	const { id } = useParams<{ id: string }>();

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	async function buscarExercicioPorId(id: string) {
		try {
			await buscar(`/exercicios/${id}`, setExercicio, {
				headers: { Authorization: token },
			});
		} catch (error: any) {
			if (error.toString().includes('401')) {
				handleLogout();
			}
		}
	}

	async function buscarCategoriaPorId(id: string) {
		try {
			await buscar(`/categorias/${id}`, setCategoria, {
				headers: { Authorization: token },
			});
		} catch (error: any) {
			if (error.toString().includes('401')) {
				handleLogout();
			}
		}
	}

	async function buscarCategorias() {
		try {
			await buscar('/categorias', setCategorias, {
				headers: { Authorization: token },
			});
		} catch (error: any) {
			if (error.toString().includes('401')) {
				handleLogout();
			}
		}
	}

	useEffect(() => {
		if (token === '') {
			ToastAlerta('Você precisa estar logado!', 'erro');

			navigate('/');
		}
	}, [token]);

	useEffect(() => {
		buscarCategorias();

		if (id !== undefined) {
			buscarExercicioPorId(id);
		}
	}, [id]);

	useEffect(() => {
		setExercicio({
			...exercicio,
			categoria: categoria,
		});
	}, [categoria]);

	function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
		setExercicio({
			...exercicio,
			[e.target.name]: e.target.value,
			categoria: categoria,
		});
	}

	function retornar() {
		navigate('/exercicios');
	}

	async function gerarNovoExercicio(e: ChangeEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		if (id !== undefined) {
			try {
				await atualizar(`/exercicios`, exercicio, setExercicio, {
					headers: {
						Authorization: token,
					},
				});

				ToastAlerta('O exercício foi atualizado com sucesso', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('401')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao atualizar exercício!', 'erro');
				}
			}
		} else {
			try {
				await cadastrar(`/exercicios`, exercicio, setExercicio, {
					headers: {
						Authorization: token,
					},
				});

				ToastAlerta('O exercicio foi cadastrado com sucesso', 'sucesso');
			} catch (error: any) {
				if (error.toString().includes('401')) {
					handleLogout();
				} else {
					ToastAlerta('Erro ao cadastrar exercicio!', 'erro');
				}
			}
		}

		setIsLoading(false);
		retornar();
	}

	const carregandoCategoria = categoria.nome === '';

	return (
		<>
			<div className="container flex flex-col mx-auto items-center my-8 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl h-auto ">
				<h1 className="text-4xl text-center my-8">
					{id !== undefined ? 'Editar Exercício' : 'Cadastrar Exercício'}
				</h1>
				<form className="flex flex-col w-1/2 gap-4 " onSubmit={gerarNovoExercicio}>
					<div className="flex flex-col gap-2">
						<label htmlFor="nome" className="text-[#1E2729]">
							Nome
						</label>
						<input
							type="text"
							placeholder="Digite o nome do Exercício"
							name="nome"
							required
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={exercicio.nome}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="descricao" className="text-[#1E2729]">
							Descrição
						</label>
						<input
							type="text"
							placeholder="Digite a descrição do Exercício"
							name="descricao"
							required
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={exercicio.descricao}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="foto" className="text-[#1E2729]">
							Foto
						</label>
						<input
							type="text"
							placeholder="insira o link da foto"
							name="foto"
							required
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={exercicio.foto}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="carga" className="text-[#1E2729]">
							Carga
						</label>
						<input
							type="text"
							placeholder="Digite o peso necessário"
							name="carga"
							className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
							value={exercicio.carga}
							onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
						/>
					</div>
					<div className="flex justify-between gap-4">
						<div className="flex flex-col gap-2 w-full">
							<label htmlFor="foto" className="text-[#1E2729]">
								Repetição
							</label>
							<input
								type="text"
								placeholder="insira repetições"
								name="repeticao"
								className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
								value={exercicio.repeticao}
								onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
							/>
						</div>
						<div className="flex flex-col gap-2 w-full">
							<label htmlFor="tempo" className="text-[#1E2729]">
								Tempo
							</label>
							<input
								type="text"
								placeholder="insira o tempo"
								name="tempo"
								className="rounded-lg p-2 bg-[#D9D9D9] text-[#808080] border-0 focus:ring-0 focus:outline-none"
								value={exercicio.tempo}
								onChange={(e: ChangeEvent<HTMLInputElement>) => atualizarEstado(e)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-[#1E2729]">Categoria</p>
						<select
							name="categoria"
							id="categoria"
							className="bg-[#D9D9D9] p-2  rounded-lg border-0 focus:ring-0 focus:outline-none text-[#808080]"
							onChange={(e) => buscarCategoriaPorId(e.currentTarget.value)}>
							<option value="" selected disabled>
								Selecione uma categoria
							</option>

							{categorias.map((categoria) => (
								<>
									<option key={categoria.id} value={categoria.id}>
										{categoria.nome}
									</option>
								</>
							))}
						</select>
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
							className="rounded-lg disabled:bg-slate-200 border-3 border-[#FD6101] hover:bg-[#FD6101] text-[#FD6101] hover:text-white font-bold w-1/2 mx-auto py-2 flex justify-center uppercase"
							disabled={carregandoCategoria}>
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

export default FormExercicio;
