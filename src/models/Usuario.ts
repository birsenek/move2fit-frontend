export default interface Usuario {
	id: number;
	nome: string;
	usuario: string;
	senha: string;
	foto: string;
	peso: number;
	altura: number;
	imc: number;
	classificacao?: string;
}
