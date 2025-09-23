import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { IMC_FAIXAS_USUARIO } from './ImcFaixas';

function Perfil() {
	const navigate = useNavigate();

	const { usuario } = useContext(AuthContext);

	const [imcImagem, setImcImagem] = useState<string>('');
	const [imcDescricao, setImcDescricao] = useState<string>('');
	const [imcStyle, setImcStyle] = useState<string>('bg-yellow-500');

	// useEffect(() => {
	// 	if (usuario.token === '') {
	// 		ToastAlerta('Você precisa estar logado', 'erro');
	// 		navigate('/login');
	// 	}
	// }, [usuario.token]);

	useEffect(() => {
		const imcData = IMC_FAIXAS_USUARIO.find((range) => usuario.imc <= range.max);
		if (imcData) {
			setImcImagem(imcData.imagem);
			setImcDescricao(imcData.descricao);
			setImcStyle(imcData.cor);
		}
	}, [usuario.imc]);

	return (
		<div className="max-w-[1440px] mx-4 xl:mx-auto m-2 rounded-2xl overflow-hidden mt-15 max-sm:px-1">
			<div>
				<img
					className="w-full h-80 object-cover max-sm:h-40 max-lg:h-50"
					src="/images/image-orange.jpg"
					alt="Capa do Perfil"
				/>

				<img
					className="rounded-full border-12 border-[#F0F0F0] w-100 mx-21 mt-[-10rem] top-[-30px] relative z-10 max-sm:w-50 max-sm:top-[60px] max-sm:mx-auto max-sm:border-10 max-lg:w-65 max-lg:top-[50px] max-lg:mx-15"
					src={usuario.foto}
					alt={`Foto de perfil de ${usuario.nome}`}
				/>

				<div className="relative mt-[-13rem] h-50 flex flex-col bg-[#1E2729] text-white text-2xl rounded-bl-lg rounded-br-lg items-center justify-center max-sm:mt-[-1rem] max-lg:mt-[-4rem]">
					<div className="absolute ml-20 top-10 max-sm:ml-0 max-sm:top-22 max-sm:flex-col max-sm:items-center max-sm:text-center max-lg:top-12 max-lg:ml-50">
						<div className="">
							<h2 className="font-bold text-3xl pb-2">{usuario.nome}</h2>
							<h2>{usuario.usuario}</h2>
						</div>
					</div>
				</div>

				<div className="flex p-4 bg-white rounded-lg shadow-2xl w-full mx-auto mt-4 flex-col md:flex-row gap-4">
					<div className="flex flex-col md:flex-row sm:justify-around justify-center items-center mb-2 text-center sm:text-start w-full">
						<div className="flex flex-col gap-4">
							<p className="text-gray-700 font-medium">
								Peso: <span className="font-semibold">{usuario.peso}</span> kg
							</p>
							<p className="text-gray-700 font-medium">
								Altura: <span className="font-semibold">{usuario.altura}</span>m
							</p>
							<p className="text-gray-700 font-medium">
								IMC: <span className="font-semibold">{usuario.imc}</span>
							</p>
							<p className="text-gray-700 font-medium ">
								Classificação:{' '}
								<span className={`font-semibold p-2 rounded-lg ${imcStyle}`}>
									{usuario.classificacao}
								</span>
							</p>
						</div>
					</div>
					<div className="flex md:flex-row justify-start items-start mb-2 text-center w-full">
						<div className="md:w-[80%]">
							<div className="flex flex-col lg:flex-row justify-center items-center gap-4">
								<img
									className={`h-30 object-contain border-0 bg-white drop-shadow-lg p-4 px-10 rounded-[100%]`}
									src={imcImagem}
									alt="Classificação do IMC"
								/>
								<div>
									<h2 className="text-xl font-bold text-center my-2">Indicações IMC</h2>
									<p className="px-4">{imcDescricao}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Perfil;
