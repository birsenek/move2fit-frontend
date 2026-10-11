import { KeyboardEvent, useEffect, useState } from 'react';
import { api } from '../../../services/Service';

export interface AlunoEncontrado {
	id: number;
	nome: string;
	usuario: string;
	vinculado: boolean;
}

interface BuscaAlunoProps {
	token: string;
	onSelecionar(aluno: AlunoEncontrado): void;
}

export default function BuscaAluno({ token, onSelecionar }: BuscaAlunoProps) {
	const [consulta, setConsulta] = useState('');
	const [resultados, setResultados] = useState<AlunoEncontrado[]>([]);
	const [buscando, setBuscando] = useState(false);
	const [erro, setErro] = useState('');
	const [aberta, setAberta] = useState(false);
	const [indice, setIndice] = useState(-1);

	useEffect(() => {
		setResultados([]);
		setIndice(-1);
		setErro('');
		if (consulta.trim().length < 2 || !token) {
			setBuscando(false);
			return;
		}
		const controller = new AbortController();
		setBuscando(true);
		const timer = setTimeout(() => {
			api.get<AlunoEncontrado[]>('/alunos/buscar', {
				params: { q: consulta.trim() },
				headers: { Authorization: token },
				signal: controller.signal,
			})
				.then(({ data }) => setResultados(data))
				.catch(() => {
					if (!controller.signal.aborted) setErro('Não foi possível buscar alunos. Tente novamente.');
				})
				.finally(() => {
					if (!controller.signal.aborted) setBuscando(false);
				});
		}, 300);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [consulta, token]);

	function selecionar(aluno: AlunoEncontrado) {
		onSelecionar(aluno);
		setAberta(false);
		setConsulta('');
	}

	function navegar(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			setAberta(true);
			setIndice((atual) =>
				event.key === 'ArrowDown' ? Math.min(atual + 1, resultados.length - 1) : Math.max(atual - 1, 0),
			);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (aberta && resultados[indice]) selecionar(resultados[indice]);
		} else if (event.key === 'Escape') setAberta(false);
	}

	return (
		<div className="relative w-full mb-6">
			<label htmlFor="buscar-aluno" className="block font-semibold mb-2">
				Buscar aluno por nome ou e-mail
			</label>
			<input
				id="buscar-aluno"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={aberta}
				aria-controls={aberta ? 'resultados-alunos' : undefined}
				aria-activedescendant={aberta && resultados[indice] ? `aluno-opcao-${indice}` : undefined}
				className="w-full rounded-lg p-3 bg-[#D9D9D9] text-[#1E2729] focus:outline-2 focus:outline-[#FD6101]"
				placeholder="Digite pelo menos 2 caracteres"
				autoComplete="off"
				maxLength={100}
				value={consulta}
				onChange={(event) => {
					setConsulta(event.target.value);
					setAberta(true);
				}}
				onFocus={() => setAberta(true)}
				onBlur={() => setAberta(false)}
				onKeyDown={navegar}
			/>
			<p className="text-sm text-gray-600 mt-2">
				Selecione um aluno existente ou preencha os dados abaixo para cadastrar um novo.
			</p>
			{aberta && (
				<div className="absolute z-10 w-full rounded-lg border bg-white shadow-lg mt-1">
					{consulta.trim().length < 2 && <p className="p-3">Digite pelo menos 2 caracteres.</p>}
					{buscando && (
						<p role="status" className="p-3">
							Buscando...
						</p>
					)}
					{erro && (
						<p role="alert" className="p-3 text-red-700">
							{erro}
						</p>
					)}
					{!buscando && !erro && consulta.trim().length >= 2 && resultados.length === 0 && (
						<p role="status" className="p-3">
							Nenhum aluno encontrado. Cadastre um novo abaixo.
						</p>
					)}
					<ul id="resultados-alunos" role="listbox" aria-label="Alunos encontrados">
						{resultados.map((item, index) => (
							<li
								key={item.id}
								id={`aluno-opcao-${index}`}
								role="option"
								aria-selected={index === indice}>
								<button
									type="button"
									tabIndex={-1}
									className={`w-full text-left p-3 hover:bg-orange-50 ${index === indice ? 'bg-orange-50' : ''}`}
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => selecionar(item)}>
									<span className="block font-semibold">{item.nome}</span>
									<span className="block text-sm">{item.usuario}</span>
									{item.vinculado && (
										<span className="text-sm text-green-700">Já está na sua lista</span>
									)}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
