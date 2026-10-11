import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { api } from '../../services/Service';
import Avaliacao from '../../models/Avaliacao';

interface Tendencia {
	coeficiente: number;
	mae: number;
	maeBaseline: number;
	testes: number;
	ajuste: { dataColeta: string; peso: number }[];
	previsao: { dataColeta: string; peso: number; imc: number } | null;
}
interface Dados {
	historico: Avaliacao[];
	tendencia: Tendencia | null;
}
const dataBR = (data: string) => data.split('-').reverse().join('/');
const hoje = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const numero = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function Grafico({ dados, campo }: { dados: Dados; campo: 'peso' | 'imc' }) {
	const pontos = dados.historico.filter((registro) => registro.origem !== 'MIGRACAO');
	if (!pontos.length) return null;
	const previstos = campo === 'peso' ? (dados.tendencia?.ajuste ?? []) : [];
	const previsao = dados.tendencia?.previsao;
	const valores = [
		...pontos.map((p) => Number(p[campo])),
		...previstos.map((p) => p.peso),
		...(previsao ? [previsao[campo]] : []),
	];
	const min = Math.min(...valores),
		max = Math.max(...valores),
		margem = Math.max((max - min) * 0.15, 0.5);
	const inicio = Date.parse(pontos[0].dataColeta),
		fim = Date.parse(previsao?.dataColeta ?? pontos[pontos.length - 1].dataColeta);
	const x = (data: string) => 65 + ((Date.parse(data) - inicio) / Math.max(fim - inicio, 604800000)) * 610;
	const y = (v: number) => 220 - ((v - min + margem) / (max - min + 2 * margem)) * 180;
	return (
		<figure className="min-w-0 rounded-xl border border-gray-200 p-4 bg-white">
			<figcaption className="font-semibold mb-3">{campo === 'peso' ? 'Peso (kg)' : 'IMC (kg/m²)'}</figcaption>
			<svg
				viewBox="0 0 720 280"
				role="img"
				aria-label={`Histórico de ${campo}, com ${pontos.length} avaliações`}
				className="w-full">
				{[0, 1, 2, 3, 4].map((i) => {
					const v = min - margem + ((max - min + 2 * margem) * i) / 4;
					return (
						<g key={i}>
							<line x1="65" x2="680" y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
							<text x="56" y={y(v) + 4} textAnchor="end" fontSize="13">
								{numero(v)}
							</text>
						</g>
					);
				})}
				<polyline
					points={pontos.map((p) => `${x(p.dataColeta)},${y(Number(p[campo]))}`).join(' ')}
					fill="none"
					stroke="#ea580c"
					strokeWidth="3"
				/>
				{previstos.length > 0 && (
					<polyline
						points={previstos.map((p) => `${x(p.dataColeta)},${y(p.peso)}`).join(' ')}
						fill="none"
						stroke="#0369a1"
						strokeWidth="2"
						strokeDasharray="6 4"
					/>
				)}
				{pontos.map((p, i) => (
					<g key={p.id}>
						<circle cx={x(p.dataColeta)} cy={y(Number(p[campo]))} r="4" fill="#ea580c">
							<title>
								{dataBR(p.dataColeta)}: {numero(Number(p[campo]))}
							</title>
						</circle>
						{(i === 0 || i === pontos.length - 1 || i === Math.floor(pontos.length / 2)) && (
							<text x={x(p.dataColeta)} y="248" textAnchor="middle" fontSize="12">
								{dataBR(p.dataColeta)}
							</text>
						)}
					</g>
				))}
				{previsao && (
					<circle
						cx={x(previsao.dataColeta)}
						cy={y(previsao[campo])}
						r="6"
						fill="white"
						stroke="#0369a1"
						strokeWidth="2">
						<title>
							Estimativa {dataBR(previsao.dataColeta)}: {numero(previsao[campo])}
						</title>
					</circle>
				)}
			</svg>
			<p className="text-xs text-gray-600">
				Laranja: medições. {campo === 'peso' && dados.tendencia && 'Azul tracejado: tendência aprendida. '}{' '}
				{previsao && 'Círculo azul: estimativa da próxima semana.'}
			</p>
		</figure>
	);
}

export default function AvaliacoesAluno({ alunoId, onSaved }: { alunoId: number; onSaved: () => void }) {
	const { usuario } = useContext(AuthContext);
	const [dados, setDados] = useState<Dados>({ historico: [], tendencia: null });
	const [erro, setErro] = useState('');
	const [carregando, setCarregando] = useState(true);
	const [salvando, setSalvando] = useState(false);
	const [erroModal, setErroModal] = useState('');
	const [form, setForm] = useState({ dataColeta: hoje(), peso: '', altura: '' });
	const dialog = useRef<HTMLDialogElement>(null);
	const headers = { Authorization: usuario.token };
	async function carregar() {
		setCarregando(true);
		setErro('');
		try {
			const response = await api.get<Dados>(`/alunos/${alunoId}/avaliacoes`, { headers });
			setDados(response.data);
		} catch {
			setErro('Não foi possível carregar as avaliações.');
		} finally {
			setCarregando(false);
		}
	}
	useEffect(() => {
		if (alunoId) void carregar();
	}, [alunoId, usuario.token]);
	async function salvar(event: React.FormEvent) {
		event.preventDefault();
		setSalvando(true);
		setErroModal('');
		try {
			await api.post(
				`/alunos/${alunoId}/avaliacoes`,
				{ dataColeta: form.dataColeta, peso: Number(form.peso), altura: Number(form.altura) },
				{ headers },
			);
			dialog.current?.close();
			await carregar();
			onSaved();
		} catch (error) {
			const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
			setErroModal(
				Array.isArray(message) ? message.join(' ') : message || 'Não foi possível salvar a avaliação.',
			);
		} finally {
			setSalvando(false);
		}
	}
	const modelo = dados.tendencia;
	return (
		<section className="my-8 rounded-2xl bg-gray-50 p-4 md:p-6" aria-labelledby="avaliacoes-title">
			<div className="flex flex-wrap justify-between items-center gap-4 mb-5">
				<div>
					<h2 id="avaliacoes-title" className="text-2xl font-bold">
						Histórico de avaliações
					</h2>
					<p className="text-gray-600">Peso, altura e IMC ao longo das semanas.</p>
				</div>
				<button
					className="bg-[#FD6101] text-white rounded-xl px-5 py-3 font-semibold"
					onClick={() => {
						const ultima = dados.historico.at(-1);
						setForm({ dataColeta: hoje(), peso: '', altura: ultima ? String(ultima.altura) : '' });
						setErroModal('');
						dialog.current?.showModal();
					}}>
					+ Registrar avaliação
				</button>
			</div>
			{carregando ? (
				<p role="status">Carregando avaliações…</p>
			) : erro ? (
				<p role="alert">
					{erro}{' '}
					<button onClick={() => void carregar()} className="underline">
						Tentar novamente
					</button>
				</p>
			) : (
				<>
					{!dados.historico.length ? (
						<p>Nenhuma avaliação registrada. Registre a primeira para acompanhar a evolução.</p>
					) : (
						<div className="grid md:grid-cols-2 gap-4">
							<Grafico dados={dados} campo="peso" />
							<Grafico dados={dados} campo="imc" />
						</div>
					)}
					<div className="my-5 p-4 bg-white border border-gray-200 rounded-xl">
						<h3 className="font-semibold">Machine learning · Regressão linear</h3>
						{modelo ? (
							<>
								<p className="mt-2">
									Tendência de peso: <strong>{numero(modelo.coeficiente)} kg/semana</strong>.{' '}
									{modelo.previsao && (
										<>
											Estimativa para {dataBR(modelo.previsao.dataColeta)}:{' '}
											<strong>{numero(modelo.previsao.peso)} kg</strong> e IMC{' '}
											<strong>{numero(modelo.previsao.imc)}</strong>.
										</>
									)}
								</p>
								<p className="text-sm mt-2">
									Erro médio absoluto: {numero(modelo.mae)} kg. Referência (repetir o último peso):{' '}
									{numero(modelo.maeBaseline)} kg. Validação em {modelo.testes} avaliações, usando
									somente dados anteriores em cada previsão.
								</p>
								<p className="text-sm mt-2">
									{modelo.mae <= modelo.maeBaseline
										? 'O modelo apresentou erro igual ou menor que a referência neste histórico.'
										: 'Neste histórico, repetir o último peso apresentou menor erro que o modelo.'}{' '}
									O IMC estimado usa a última altura registrada.
								</p>
							</>
						) : (
							<p className="mt-2">
								A tendência precisa de pelo menos 5 avaliações com data de coleta conhecida.
							</p>
						)}
						<p className="text-xs text-gray-600 mt-2">
							Estimativa acadêmica, sem indicação de meta ou avaliação clínica. Registros migrados sem
							data de coleta conhecida não entram no modelo.
						</p>
					</div>
					{dados.historico.some((a) => a.origem === 'SEED') && (
						<p className="text-sm mb-3 text-gray-600">
							Este histórico contém dados fictícios de demonstração gerados pelo seed.
						</p>
					)}
					{!!dados.historico.length && (
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-left">
								<caption className="text-left font-semibold mb-2">Avaliações registradas</caption>
								<thead>
									<tr>
										{['Data', 'Peso (kg)', 'Altura (m)', 'IMC', 'Origem'].map((t) => (
											<th key={t} className="p-3 border-b">
												{t}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{[...dados.historico].reverse().map((a) => (
										<tr key={a.id}>
											<td className="p-3">{dataBR(a.dataColeta)}</td>
											<td className="p-3">{numero(a.peso)}</td>
											<td className="p-3">{numero(a.altura)}</td>
											<td className="p-3">{numero(a.imc)}</td>
											<td className="p-3">
												{a.origem === 'SEED'
													? 'Demonstração'
													: a.origem === 'MIGRACAO'
														? 'Migração (data desconhecida)'
														: 'Registro do treinador'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</>
			)}
			<dialog
				ref={dialog}
				aria-labelledby="modal-avaliacao-title"
				className="m-auto w-[min(92vw,480px)] p-6 rounded-2xl shadow-xl backdrop:bg-black/50">
				<form onSubmit={salvar} className="flex flex-col gap-4">
					<h2 id="modal-avaliacao-title" className="text-xl font-bold">
						Registrar avaliação semanal
					</h2>
					<p className="text-sm text-gray-600">
						Uma avaliação por semana (segunda a domingo). O IMC é calculado automaticamente.
					</p>
					<label className="flex flex-col gap-1">
						Data de coleta
						<input
							autoFocus
							required
							type="date"
							max={hoje()}
							value={form.dataColeta}
							onChange={(e) => setForm({ ...form, dataColeta: e.target.value })}
							className="border rounded-lg p-2"
						/>
					</label>
					<label className="flex flex-col gap-1">
						Peso (kg)
						<input
							required
							type="number"
							step="0.01"
							min="1"
							max="500"
							value={form.peso}
							onChange={(e) => setForm({ ...form, peso: e.target.value })}
							className="border rounded-lg p-2"
						/>
					</label>
					<label className="flex flex-col gap-1">
						Altura (m)
						<input
							required
							type="number"
							step="0.01"
							min="0.3"
							max="2.7"
							value={form.altura}
							onChange={(e) => setForm({ ...form, altura: e.target.value })}
							className="border rounded-lg p-2"
						/>
					</label>
					{Number(form.peso) > 0 && Number(form.altura) > 0 && (
						<p>IMC calculado: {numero(Number(form.peso) / Number(form.altura) ** 2)}</p>
					)}
					{erroModal && (
						<p role="alert" className="text-red-700">
							{erroModal}
						</p>
					)}
					<div className="flex justify-end gap-3">
						<button
							type="button"
							disabled={salvando}
							onClick={() => dialog.current?.close()}
							className="border rounded-lg px-4 py-2">
							Cancelar
						</button>
						<button
							disabled={salvando}
							className="bg-[#FD6101] text-white rounded-lg px-4 py-2 disabled:opacity-50">
							{salvando ? 'Salvando…' : 'Salvar avaliação'}
						</button>
					</div>
				</form>
			</dialog>
		</section>
	);
}
