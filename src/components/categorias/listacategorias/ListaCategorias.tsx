import { useContext, useEffect, useState } from 'react';
import { DNA } from 'react-loader-spinner';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import CardCategorias from '../cardcategorias/CardCategorias';
import { buscar } from '../../../services/Service';
import Categoria from '../../../models/Categoria';
import { Link, useNavigate } from 'react-router-dom';
import { ToastAlerta } from '../../../utils/ToastAlerta';
import { AuthContext } from '../../../contexts/AuthContext';

function ListaCategorias() {
	const navigate = useNavigate();

	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [query, setQuery] = useState('');

	const { usuario, handleLogout } = useContext(AuthContext);
	const token = usuario.token;

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
			ToastAlerta('Você precisa estar logado!', 'info');
			navigate('/');
		} else {
			buscarCategorias();
		}
	}, [token]);

	// useEffect(() => {
	// 	buscarCategorias();
	// }, [categorias.length]);

	const filterCategorias = categorias.filter((categoria) =>
		categoria.nome.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<>
			<div className=" bg-[#1E2729] ">
				<img src="/images/banner-categorias.svg" alt="Banner de cadastro de Categorias" className="w-full" />
			</div>
			<div className="@container flex flex-col gap-12 my-8 justify-center items-center">
				<div className="flex flex-col justify-center items-center h-20 text-lg mx-5 md:mx-0">
					<div className="container flex flex-col md:flex-row justify-center gap-5 mt-15 md:mt-0">
						<div className="flex flex-col gap-2 md:w-[80vw]">
							<form className="flex flex-col justify-center items-center md:flex-row mx-auto w-full gap-4">
								<div className="w-full md:w-[70%]">
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
											placeholder="Pesquisar Categoria"
											value={query}
											onChange={(e) => setQuery(e.target.value)}
										/>
									</div>
								</div>
								<div className="w-full md:w-[20%]">
									<button className="flex items-center justify-center border-2 text-[#FD6101] rounded-lg hover:bg-[#FD6101] hover:text-white hover:border-[#FD6101] duration-500 w-full py-1 px-6">
										<Link
											to="/categorias/store"
											className="flex justify-center items-center gap-3 w-full">
											<Plus size={20} />
											Categoria
										</Link>
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
				{categorias.length === 0 && (
					<DNA
						visible={true}
						height="200"
						width="200"
						ariaLabel="dna-loading"
						wrapperStyle={{}}
						wrapperClass="dna-wrapper mx-auto"
					/>
				)}
				<div className="flex justify-center w-full ">
					<div className="flex flex-col mx-2">
						{filterCategorias.length === 0 && (
							<span className="text-3xl text-center my-8">Nenhum exercício foi encontrado</span>
						)}
						<div className="mx-auto my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:4 gap-6 md:gap-3">
							{filterCategorias.map((categoria) => (
								<CardCategorias key={categoria.id} categoria={categoria} />
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default ListaCategorias;
