import { PencilSimpleLine, Plus, Trash } from '@phosphor-icons/react';
import Exercicio from '../../../models/Exercicio';
import { Link } from 'react-router-dom';

interface CardExerciciosProps {
	exercicio: Exercicio;
}

function CardExercicios({ exercicio }: CardExerciciosProps) {
	return (
		<>
			<div className="md:min-h-50 drop-shadow-lg flex flex-col rounded-lg overflow-hidden bg-white text-[#1E2729] ">
				<div className="w-full  items-center">
					<img src={exercicio.foto} alt={exercicio.nome} className="w-full h-[270px] object-cover" />
				</div>

				<div className="flex flex-col py-6 gap-4 px-8">
					<div className="flex flex-col gap-2">
						<h2 className="text-xl font-semibold">{exercicio.nome}</h2>
						<div className="flex justify-start gap-8">
							<div className="flex items-center gap-3 text-lg">
								<img src="/images/icon-carga.svg" alt="" className="h-7" />
								<p className="text-lg">{exercicio.carga}</p>
							</div>
							<div className="flex items-center gap-3">
								<img src="/images/icon-repeticao.svg" alt="" className="h-7" />
								<p className="text-lg">{exercicio.repeticao}</p>
							</div>
							<div className="flex items-center gap-3">
								<img src="/images/icon-tempo.svg" alt="" className="h-7" />
								<p className="text-lg">{exercicio.tempo}</p>
							</div>
						</div>
						<div>
							<p className="text-lg">{exercicio.descricao}</p>
						</div>

						<div className="flex justify-start items-center gap-4">
							<img src={exercicio.categoria?.icone} alt={exercicio.categoria?.nome} className="h-10" />
							<p>{exercicio.categoria?.nome}</p>
						</div>
					</div>
					<div className="flex justify-end gap-6 text-[#1E2729]">
						<Link to={`/exercicios/edit/${exercicio.id}`}>
							<PencilSimpleLine
								size={25}
								className="transition-transform duration-300 hover:scale-120 hover:text-[#B63700]"
							/>
						</Link>
						<Link to={`/exercicios/detroy/${exercicio.id}`}>
							<Trash
								size={25}
								className="transition-transform duration-300 hover:scale-120 hover:text-[#B63700]"
							/>
						</Link>
						<Link to="">
							<Plus
								size={25}
								className="transition-transform duration-300 hover:scale-120 hover:text-[#B63700]"
							/>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

export default CardExercicios;
