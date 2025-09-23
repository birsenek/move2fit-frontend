import { PencilSimpleLine, Trash } from '@phosphor-icons/react';
import Aluno from '../../../models/Aluno';
import { Link } from 'react-router-dom';

interface CardAlunoProps {
	aluno: Aluno;
}

function CardAluno({ aluno }: CardAlunoProps) {
	return (
		<>
			<div className="drop-shadow-lg flex rounded-2xl max-w-95 bg-white text-[#1E2729]">
				<div className='flex flex-col'>
					<div className="flex w-[80%] p-3 justify-center items-center gap-4 mx-auto">
						<img src={aluno.foto} alt="Imagem relacionada ao exercício" />
					</div>
					<div className="flex flex-col py-6 gap-6 px-8">
						<div className="flex flex-col gap-6">
							<h2 className="text-xl font-semibold">{aluno.nome}</h2>
							<div className="flex justify-between gap-6">
								<div className="flex gap-3 items-center">
									<img src="/images/peso.png" alt="" className="w-7 h-7" />
									<p>{aluno.peso} kg</p>
								</div>
								<div className="flex gap-3 items-center">
									<img src="/images/altura.png" alt="" className="w-7 h-7" />
									<p>{aluno.altura}</p>
								</div>
								<div className="flex gap-3 items-center">
									<img src="/images/imc.png" alt="" className="w-7 h-7" />
									<p>{aluno.imc}</p>
								</div>
							</div>

							<div className="flex flex-col gap-4">
								<p>
									Email: <span>{aluno.email}</span>
								</p>
								<p>
									Classificação: <span>{aluno.classificacao}</span>
								</p>
							</div>
						</div>
						<div className="flex justify-between items-center">
							<button className="rounded-lg disabled:bg-slate-200 border-3 border-[#FD6101] hover:bg-[#FD6101] text-[#FD6101] hover:text-white font-bold  py-1 px-4 flex uppercase text-sm">
								<Link to={`/alunos/perfil/${aluno.id}`}>Ver Mais</Link>
							</button>
							<div className="flex justify-end gap-6 text-[#1E2729]">
								<Link to={`/alunos/edit/${aluno.id}`}>
									<PencilSimpleLine
										size={25}
										className="transition-transform duration-300 hover:scale-120 hover:text-[#B63700]"
									/>
								</Link>
								<Link to={`/alunos/destroy/${aluno.id}`}>
									<Trash
										size={25}
										className="transition-transform duration-300 hover:scale-120 hover:text-[#B63700]"
									/>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default CardAluno;
