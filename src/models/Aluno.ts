import Exercicio from './Exercicio';

export default interface Aluno {
	id: number;
	nome: string;
	email: string;
	foto: string;
	peso: number;
	altura: number;
	imc: number;
	classificacao?: string;
	exercicios?: Exercicio[] | null;
}
