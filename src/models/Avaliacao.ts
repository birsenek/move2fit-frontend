export default interface Avaliacao {
	id: number;
	alunoId: number;
	treinadorId: number | null;
	dataColeta: string;
	semanaInicio: string;
	peso: number;
	altura: number;
	imc: number;
	classificacao: string;
	origem: 'MANUAL' | 'SEED' | 'MIGRACAO';
}
