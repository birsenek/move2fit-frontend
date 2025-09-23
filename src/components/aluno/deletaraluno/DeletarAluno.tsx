import { useContext, useEffect, useState } from 'react';
import Modal from '../../modal/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import Aluno from '../../../models/Aluno';
import { AuthContext } from '../../../contexts/AuthContext';
import { buscar, deletar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { RotatingLines } from 'react-loader-spinner';

function DeletarAluno() {
	const [isOpen, setIsOpen] = useState<boolean>(true);

	function retornar() {
		setIsOpen(false);
		navigate('/alunos');
	}

	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const [aluno, setAluno] = useState<Aluno>({} as Aluno);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

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

	async function deletarAluno() {
		setIsLoading(true);

		try {
			await deletar(`/alunos/${id}`, {
				headers: { Authorization: token },
			});
			ToastAlerta('Aluno apagado com sucesso!', 'sucesso');
		} catch (error: any) {
			if (error.toString().includes('401')) {
				handleLogout();
			} else {
				ToastAlerta('Erro ao deletar o aluno.', 'erro');
			}
		}

		setIsLoading(false);
		retornar();
	}

	return (
		<>
			<Modal isOpen={isOpen} onClose={retornar}>
				<div className="container w-full mx-auto">
					<h1 className="py-4 text-3xl text-center">Deletar Aluno</h1>
					<p className="mb-4 font-semibold text-center">Você tem certeza de que deseja deletar esse aluno?</p>
					<div className="flex flex-col justify-between overflow-hidden">
						<p className="h-full p-8 text-3xl text-center bg-white">{aluno.nome}</p>
						<div className="flex justify-center gap-5">
							<button
								className="w-30 rounded-lg py-2 bg-[#FD6101] text-white hover:bg-[#B63700] duration-500 "
								onClick={retornar}>
								Não
							</button>
							<button
								className="w-30 rounded-lg border-2 text-[#FD6101] px-4 py-2 hover:bg-[#FD6101] hover:text-white hover:border-[#FD6101] duration-500"
								onClick={deletarAluno}>
								{isLoading ? (
									<RotatingLines
										strokeColor="white"
										strokeWidth="5"
										animationDuration="0.75"
										width="24"
										visible={true}
									/>
								) : (
									<span>Sim</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default DeletarAluno;
