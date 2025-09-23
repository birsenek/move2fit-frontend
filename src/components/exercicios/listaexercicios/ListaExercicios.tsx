import { MagnifyingGlass } from '@phosphor-icons/react';
import CardExercicios from '../cardexercicios/CardExercicios';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Exercicio from '../../../models/Exercicio';
import { AuthContext } from '../../../contexts/AuthContext';
import { buscar } from '../../../services/Service';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { DNA } from 'react-loader-spinner';

function ListaExercicios() {
	const navigate = useNavigate();

	const [exercicios, setExercicios] = useState<Exercicio[]>([]);
	const [query, setQuery] = useState('');
	const [categoriaId, setCategoriaId] = useState('');

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

	async function buscarExercicios() {
		try {
			await buscar('/exercicios', setExercicios, {
				headers: {
					Authorization: token,
				},
			});
		} catch (error: any) {
			if (error.toString().includes('403')) {
				handleLogout();
			}
		}
	}

	useEffect(() => {
		if (token === '') {
			ToastAlerta('Você precisa estar logado!', 'erro');
			navigate('/');
		} else {
			buscarExercicios();
		}
	}, [token]);

	const filterExercicios = exercicios.filter(
		(exercicio) =>
			exercicio.nome.toLowerCase().includes(query.toLowerCase()) &&
			(categoriaId === '' || String(exercicio.categoria?.id) === categoriaId),
	);

	return (
		<>
			<div className="bg-[#1E2729]">
				<Link to="/exercicios/store">
					<img src="/images/banner-exercicios.svg" alt="Banner de cadastro de exercício" className="w-full" />
				</Link>
			</div>

			<div className="flex flex-col justify-center items-center h-20 text-lg mx-5 md:mx-0">
				<div className="container flex flex-col md:flex-row justify-between gap-5 mt-15 md:mt-0">
					<div className="flex flex-col gap-2 md:w-[80vw]">
						<form className="flex justify-center items-center mx-auto w-full gap-4">
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
									placeholder="Pesquisar Exercício"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</div>
						</form>
					</div>
					<div className="flex justify-center bg-white items-center p-1 md:pl-4 rounded-lg drop-shadow-lg border-2 border-[#FD6101]">
						<div className="flex md:max-w-full">
							<select
								name="categoria"
								id="categoria"
								className="border-0 px-4 focus:ring-0 focus:outline-none text-[#FD6101] appearance-none text-center"
								value={categoriaId}
								onChange={(e) => setCategoriaId(e.target.value)}>
								<option value="">Todas as Categorias</option>
								{Array.from(new Set(exercicios.map((exercicio) => exercicio.categoria?.id)))
									.filter((id) => id)
									.map((id) => (
										<option key={id} value={id}>
											{exercicios.find((ex) => ex.categoria?.id === id)?.categoria?.nome}
										</option>
									))}
							</select>
						</div>
					</div>
				</div>
			</div>

			{exercicios.length === 0 && (
				<DNA
					visible={true}
					height="200"
					width="200"
					ariaLabel="dna-loading"
					wrapperStyle={{}}
					wrapperClass="dna-wrapper mx-auto"
				/>
			)}

			<div className="flex justify-center  my-4 mt-15 md:mt-0">
				<div className="flex flex-col mx-2 max-w-[1540px]">
					{filterExercicios.length === 0 && (
						<span className="text-3xl text-center my-8">Nenhum exercício foi encontrado</span>
					)}
					<div className="mx-auto my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{filterExercicios.map((exercicio) => (
							<CardExercicios key={exercicio.id} exercicio={exercicio} />
						))}
					</div>
				</div>
			</div>
		</>
	);
}

export default ListaExercicios;
