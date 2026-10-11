import Exercicio from './Exercicio';
import Avaliacao from './Avaliacao';

export default interface Aluno {
	id: number;
	nome: string;
	usuario: string;
	senha?: string;
	foto: string;
	tipo?: string;
	// Resumo calculado a partir da última avaliação; não são colunas do usuário.
	ultimaAvaliacao?: Avaliacao | null;
	peso: number | null;
	altura: number | null;
	imc: number | null;
	classificacao?: string;
	exercicios?: Exercicio[] | null;
	exercicio?: Exercicio[];
}
