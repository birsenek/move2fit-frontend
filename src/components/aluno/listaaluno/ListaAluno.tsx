import { MagnifyingGlass } from '@phosphor-icons/react';
import CardAluno from '../cardaluno/CardAluno';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Aluno from '../../../models/Aluno';
import { AuthContext } from '../../../contexts/AuthContext';
import { buscar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { DNA } from 'react-loader-spinner';

function ListaAluno() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [alunos, setAlunos] = useState<Aluno[]>([]);

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	async function buscarAlunos() {
		try {
			await buscar('/alunos', setAlunos, {
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
			ToastAlerta('Você precisa estar logado', 'info');
			navigate('/');
		} else {
			buscarAlunos();
		}
	}, [token]);

	const filterAlunos = alunos.filter((aluno) => aluno.nome.toLowerCase().includes(query.toLowerCase()));

	return (
		<>
			<div className="flex justify-center items-center bg-[#1E2729] flex-col ">
				<Link to="/alunos/store">
					<img
						src="https://ik.imagekit.io/q5tv5x3k8/Move2Fit/Banner.svg?updatedAt=1741287556502"
						alt="Mulher Fitness"
						className="lg:h-full object-cover"
					/>
				</Link>
			</div>

			<div className="flex flex-col justify-center items-center h-20 text-lg mx-5 md:mx-0">
				<div className="container flex justify-center flex-col md:flex-row gap-5 mt-15 md:mt-0">
					<div className="flex flex-col gap-2 md:w-[80vw] ">
						<form className="flex justify-center items-center mx-auto w-full gap-4 ">
							<label htmlFor="search" className="sr-only">
								Search
							</label>
							<div className="flex gap-4 items-center bg-white w-full rounded-lg drop-shadow-lg">
								<div className="flex justify-center items-center bg-[#dbdada] w-15 h-11 rounded-l-lg">
									<MagnifyingGlass size={25} className="text-white" />
								</div>

								<input
									type="text"
									id="simple-search"
									className="w-full border-0 focus:ring-0 focus:outline-none py-2 px-4"
									placeholder="Pesquisar Aluno"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</div>
						</form>
					</div>
				</div>
			</div>

			{alunos.length === 0 && (
				<DNA
					visible={true}
					height="200"
					width="200"
					ariaLabel="dna-loading"
					wrapperStyle={{}}
					wrapperClass="dna-wrapper mx-auto"
				/>
			)}

			<div className="flex justify-center w-full my-4 mt-15 md:mt-0">
				<div className="flex flex-col mx-2">
					{filterAlunos.length === 0 && (
						<span className="text-3xl text-center my-8">Nenhum exercício foi encontrado</span>
					)}
					<div
						className="mx-auto my-4 
                        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filterAlunos.map((aluno) => (
							<CardAluno key={aluno.id} aluno={aluno} />
						))}
					</div>
				</div>
			</div>
		</>
	);
}

export default ListaAluno;
