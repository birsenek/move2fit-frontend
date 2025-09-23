import { Pencil, Trash } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import Categoria from '../../../models/Categoria';

interface CardCategoriasProps {
	categoria: Categoria;
}

function CardCategorias({ categoria }: CardCategoriasProps) {
	return (
		<div className="flex justify-center">
			<div className="w-90 min-h-50 bg-white rounded-lg shadow-xl p-6 flex flex-col justify-between">
				<div className="flex flex-col text-start items-center gap-3 text-lg text-gray-700">
					<div className="flex w-full items-center gap-3 font-semibold">
						<img className="w-10 h-10" src={categoria.icone} alt={categoria.nome} />
						<h2>{categoria.nome}</h2>
					</div>

					<p className="text-base text-gray-600">{categoria.descricao || 'Descrição não disponível'}</p>
				</div>

				<div className="flex justify-end gap-3">
					<Link to={`/categorias/detroy/${categoria.id}`}>
						<Trash className="text-gray-400 hover:text-[#FD6101] cursor-pointer" size={20} />
					</Link>
					<Link to={`/categorias/edit/${categoria.id}`}>
						<Pencil className="text-gray-400 hover:text-[#1E2729] cursor-pointer" size={20} />
					</Link>
				</div>
			</div>
		</div>
	);
}

export default CardCategorias;
