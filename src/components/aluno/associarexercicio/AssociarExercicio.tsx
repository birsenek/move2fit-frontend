import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';
import { api, buscar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import Aluno from '../../../models/Aluno';
import Exercicio from '../../../models/Exercicio';
import { RotatingLines } from 'react-loader-spinner';
import { Plus } from '@phosphor-icons/react';

function AssociarExercicio() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	const [aluno, setAluno] = useState<Aluno>({} as Aluno);
	const [exercicios, setExercicios] = useState<Exercicio[]>([]);
	const [loadingId, setLoadingId] = useState<number | null>(null);

	async function buscarAluno() {
		try {
			await buscar(`/alunos/${id}`, setAluno, { headers: { Authorization: token } });
		} catch (error: any) {
			if (error.toString().includes('401')) handleLogout();
			ToastAlerta(error.response?.data?.message || 'Aluno não encontrado na sua lista.', 'erro');
			navigate('/alunos');
		}
	}

	async function buscarExercicios() {
		try {
			await buscar('/exercicios', setExercicios, { headers: { Authorization: token } });
		} catch (error: any) {
			if (error.toString().includes('403')) handleLogout();
		}
	}

	useEffect(() => {
		if (token === '') {
			ToastAlerta('Você precisa estar logado', 'erro');
			navigate('/login');
		}
	}, [token]);

	useEffect(() => {
		if (id) {
			buscarAluno();
			buscarExercicios();
		}
	}, [id]);

	const idsJaAssociados = new Set((aluno.exercicios || aluno.exercicio || []).map((e: Exercicio) => e.id));

	const exerciciosDisponiveis = exercicios.filter((e) => !idsJaAssociados.has(e.id));

	async function associar(exercicio: Exercicio) {
		setLoadingId(exercicio.id);
		try {
			await api.post(
				`/alunos/${id}/exercicios/${exercicio.id}`,
				{},
				{
					headers: { Authorization: token },
				},
			);

			ToastAlerta('Exercício adicionado ao aluno!', 'sucesso');
			await buscarAluno();
		} catch (error: any) {
			if (error.toString().includes('401') || error.toString().includes('403')) {
				handleLogout();
			} else {
				ToastAlerta('Erro ao associar exercício', 'erro');
			}
		}
		setLoadingId(null);
	}

	return (
		<div className="max-w-[1440px] mx-4 xl:mx-auto mt-10 mb-10">
			<div className="flex items-center justify-between mb-8 px-2">
				<h1 className="text-3xl font-semibold">Adicionar Exercício a {aluno.nome || '...'}</h1>
				<button
					onClick={() => navigate(`/alunos/perfil/${id}`)}
					className="bg-[#1E2729] text-white font-semibold px-5 py-2 rounded-xl hover:bg-[#2f3e41] transition-colors">
					Voltar
				</button>
			</div>

			{exerciciosDisponiveis.length === 0 ? (
				<div className="text-center py-16">
					<p className="text-gray-500 text-lg">
						{exercicios.length === 0
							? 'Carregando exercícios...'
							: 'Todos os exercícios já estão associados a este aluno.'}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{exerciciosDisponiveis.map((exercicio) => (
						<div key={exercicio.id} className="bg-white rounded-xl shadow-md overflow-hidden">
							<img src={exercicio.foto} alt={exercicio.nome} className="w-full h-48 object-cover" />
							<div className="p-4">
								<h3 className="font-bold text-lg text-gray-800">{exercicio.nome}</h3>
								<p className="text-gray-600 mt-1 text-sm">{exercicio.descricao}</p>
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
											<span className="font-medium">Categoria:</span> {exercicio.categoria.nome}
										</p>
									)}
								</div>
								<button
									onClick={() => associar(exercicio)}
									disabled={loadingId === exercicio.id}
									className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FD6101] hover:bg-[#B63700] text-white font-semibold py-2 rounded-xl transition-colors disabled:opacity-60">
									{loadingId === exercicio.id ? (
										<RotatingLines
											strokeColor="white"
											strokeWidth="5"
											animationDuration="0.75"
											width="20"
											visible={true}
										/>
									) : (
										<>
											<Plus size={18} weight="bold" />
											Adicionar
										</>
									)}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default AssociarExercicio;
