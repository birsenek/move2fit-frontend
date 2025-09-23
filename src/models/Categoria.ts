import Exercicio from './Exercicio';

export default interface Categoria {
	id: number;
	nome: string;
	descricao: string;
	icone: string;
	exercicio?: Exercicio[] | null;
}
