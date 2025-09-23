import Aluno from './Aluno';
import Categoria from './Categoria';

export default interface Exercicio {
	id: number;
	nome: string;
	descricao: string;
	carga: number;
	repeticao: number;
	tempo: string;
	foto: string;
	categoria: Categoria | null;
	aluno?: Aluno[] | null;
}
