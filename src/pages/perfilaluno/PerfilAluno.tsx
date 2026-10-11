import AvaliacoesAluno from '../../components/aluno/AvaliacoesAluno';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { buscar, deletar } from '../../services/Service';
import { IMC_FAIXAS } from './ImcFaixasAluno';
import Aluno from '../../models/Aluno';
import Exercicio from '../../models/Exercicio';
import { RotatingLines } from 'react-loader-spinner';

function PerfilAluno() {
	const navigate = useNavigate();
	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	const { id } = useParams<{ id: string }>();
	const [aluno, setAluno] = useState<Aluno>({} as Aluno);
	const [imcStyle, setImcStyle] = useState<string>('bg-yellow-500');
	const [removendoId, setRemovendoId] = useState<number | null>(null);

	async function buscarPorId(id: string) {
		try {
			await buscar(`/alunos/${id}`, setAluno, {
				headers: { Authorization: token },
			});
		} catch (error: any) {
			if (error.toString().includes('401')) {
				handleLogout();
			}
			ToastAlerta(error.response?.data?.message || 'Aluno não encontrado na sua lista.', 'erro');
			navigate('/alunos');
		}
	}

	useEffect(() => {
		if (token === '') {
			ToastAlerta('Você precisa estar logado', 'erro');
			navigate('/login');
		}
	}, [token]);

	useEffect(() => {
		if (id !== undefined) {
			buscarPorId(id);
		}
	}, [id, token]);

	useEffect(() => {
		if (!aluno.imc) return;
		const imc = aluno.imc;
		const imcData = IMC_FAIXAS.find((range) => imc <= range.max);
		if (imcData) {
			setImcStyle(imcData.cor);
		}
	}, [aluno.imc]);

	const exerciciosDoAluno = aluno.exercicios || aluno.exercicio || [];

	async function removerExercicio(exercicio: Exercicio) {
		setRemovendoId(exercicio.id);
		try {
			await deletar(`/alunos/${id}/exercicios/${exercicio.id}`, {
				headers: { Authorization: token },
			});

			ToastAlerta('Exercício removido do aluno!', 'sucesso');
			if (id) buscarPorId(id);
		} catch (error: any) {
			if (error.toString().includes('403')) {
				handleLogout();
			} else {
				ToastAlerta('Erro ao remover exercício', 'erro');
			}
		}
		setRemovendoId(null);
	}

	return (
		<div className="max-w-[1440px] mx-4 xl:mx-auto m-2 rounded-2xl overflow-hidden mt-15 max-sm:px-1">
			<div>
				<img
					className="w-full h-80 object-cover max-sm:h-40 max-lg:h-50"
					src="/images/image-orange.jpg"
					alt="Capa do Perfil"
				/>

				<img
					className="rounded-full border-12 border-[#F0F0F0] w-100 mx-21 mt-[-10rem] top-[-30px] relative z-10 max-sm:w-50 max-sm:top-[60px] max-sm:mx-auto max-sm:border-10 max-lg:w-65 max-lg:top-[50px] max-lg:mx-15"
					src={aluno.foto}
					alt={`Foto de perfil de ${aluno.nome}`}
				/>

				<div className="relative mt-[-13rem] h-50 flex flex-col bg-[#1E2729] text-white text-2xl rounded-bl-lg rounded-br-lg items-center justify-center max-sm:mt-[-1rem] max-lg:mt-[-4rem]">
					<div className="absolute ml-20 top-10 max-sm:ml-0 max-sm:top-22 max-sm:flex-col max-sm:items-center max-sm:text-center max-lg:top-12 max-lg:ml-50">
						<div className="">
							<h2 className="font-bold text-3xl pb-2">{aluno.nome}</h2>
							<h2>{aluno.usuario}</h2>
						</div>
					</div>
				</div>

				<div className="flex p-4 bg-white rounded-lg shadow-2xl w-full mx-auto mt-4 flex-col md:flex-row gap-4">
					<div className="flex flex-col md:flex-row sm:justify-around justify-center items-center mb-2 text-center sm:text-start w-full">
						<div className="flex flex-col gap-4">
							<p className="text-sm text-gray-600">
								{aluno.ultimaAvaliacao
									? `Última avaliação: ${aluno.ultimaAvaliacao.dataColeta.split('-').reverse().join('/')}`
									: 'Nenhuma avaliação registrada.'}
							</p>
							<p className="text-gray-700 font-medium">
								Peso: <span className="font-semibold">{aluno.peso ?? '—'}</span> kg
							</p>
							<p className="text-gray-700 font-medium">
								Altura: <span className="font-semibold">{aluno.altura ?? '—'}</span>m
							</p>
							<p className="text-gray-700 font-medium">
								IMC: <span className="font-semibold">{aluno.imc ?? '—'}</span>
							</p>
							<p className="text-gray-700 font-medium ">
								Classificação:{' '}
								<span className={`font-semibold p-2 rounded-lg ${imcStyle}`}>
									{aluno.classificacao}
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			{aluno.id && (
				<AvaliacoesAluno
					alunoId={aluno.id}
					onSaved={() => {
						if (id) void buscarPorId(id);
					}}
				/>
			)}
			<div className="my-10">
				<div className="flex justify-between items-center py-6 mb-4 px-2">
					<h1 className="text-4xl font-semibold">Lista de treino</h1>
					<Link
						to={`/alunos/${id}/exercicios`}
						className="bg-[#FD6101] hover:bg-[#B63700] text-white font-semibold px-5 py-2 rounded-xl transition-colors">
						+ Adicionar Exercício
					</Link>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{exerciciosDoAluno && exerciciosDoAluno.length > 0 ? (
						exerciciosDoAluno.map((exercicio: Exercicio) => (
							<div key={exercicio.id} className="bg-white rounded-lg shadow-md overflow-hidden">
								<img src={exercicio.foto} alt={exercicio.nome} className="w-full h-48 object-cover" />
								<div className="p-4">
									<h3 className="font-bold text-lg text-gray-800">{exercicio.nome}</h3>
									<p className="text-gray-600 mt-1">{exercicio.descricao}</p>
									<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
										{exercicio.carga > 0 && (
											<p className="text-gray-700">
												<span className="font-medium">Carga:</span> {exercicio.carga} kg
											</p>
										)}
										{exercicio.repeticao > 0 && (
											<p className="text-gray-700">
												<span className="font-medium">Repetições:</span> {exercicio.repeticao}
											</p>
										)}
										{exercicio.tempo && (
											<p className="text-gray-700">
												<span className="font-medium">Tempo:</span> {exercicio.tempo}
											</p>
										)}
										{exercicio.categoria && (
											<p className="text-gray-700 col-span-2">
												<span className="font-medium">Categoria:</span>{' '}
												{exercicio.categoria.nome}
											</p>
										)}
									</div>
									<button
										onClick={() => removerExercicio(exercicio)}
										disabled={removendoId === exercicio.id}
										className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold py-2 rounded-xl transition-colors disabled:opacity-60">
										{removendoId === exercicio.id ? (
											<RotatingLines
												strokeColor="currentColor"
												strokeWidth="5"
												animationDuration="0.75"
												width="18"
												visible={true}
											/>
										) : (
											'Remover'
										)}
									</button>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full text-center py-8">
							<p className="text-gray-500">Nenhum exercício atribuído a este aluno.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default PerfilAluno;
