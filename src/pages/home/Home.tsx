import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para navegação
import { AuthContext } from '../../contexts/AuthContext';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { Barbell, Heart, User, Users } from '@phosphor-icons/react';

export default function Home() {
	const navigate = useNavigate();
	const { usuario } = useContext(AuthContext);

	// useEffect(() => {
	// 	if (!usuario.token) {
	// 		navigate('/login');
	// 		ToastAlerta('Você precisa estar logado!', 'info');
	// 	}
	// }, [usuario, navigate]);

	return (
		
		<div>
			<div className="relative min-h-screen flex items-center justify-center">
				<div
					className="absolute top-0 left-0 w-full h-full bg-fixed"
					style={{
						backgroundImage: `url('/images/woman-two-men.jpg')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundColor: 'transparent',
						filter: 'blur(3px)',
					}}></div>

				<div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>

				<div className="flex max-w-[1440px] flex-col justify-center items-center lg:items-start ml-4 z-10 text-left w-full">
					<div className='lg:ml-15 mx-4 md:mx-0 text-center md:text-start'>
						<h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#FD6101]">Seja bem vindo!</h1>
						<p className="text-xl md:text-xl max-w-xl mb-8 text-white">
							Treinos organizados, resultados reais! Conectando alunos e personal trainers para uma jornada
							fitness mais eficaz.
						</p>
						<Link to="/perfil">
							<button className="bg-[#FD6101] hover:bg-[#b44d00] text-white w-[180px] h-[50px] rounded-[5px] text-[20px] font-medium cursor-pointer">
								PERFIL
							</button>
						</Link>
					</div>
				</div>
			</div>
			<div className='bg-fixed bg-cover bg-center' style={{ backgroundImage: "url('/images/parallax-bg.jpg')" }}>
				<div className="flex justify-center items-center py-20 bg-[#1E2729]">
					<div className="mx-auto px-6">
						<h2 className="text-3xl font-bold mb-12 text-center text-white">
							Diferenciais da Move2Fit
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1440px]">
							<div className="bg-[#6A6F75] hover:bg-orange-500 p-6 rounded-lg text-center">
								<User className="w-8 h-8 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white">Treinamento Personalizado</h3>
								<p className="text-gray-300 mt-2">Planos adaptados às suas necessidades e objetivos, com acompanhamento profissional.</p>
							</div>
							<div className="bg-[#6A6F75] hover:bg-orange-500 p-6 rounded-lg text-center">
								<Heart className="w-8 h-8 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white">Bem-Estar e Saúde</h3>
								<p className="text-gray-300 mt-2">Foco na sua saúde física e mental para uma vida equilibrada e saudável.</p>
							</div>
							<div className="bg-[#6A6F75] hover:bg-orange-500 p-6 rounded-lg text-center">
								<Barbell className="w-8 h-8 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white">Equipamentos versáteis</h3>
								<p className="text-gray-300 mt-2">Treine com equipamentos que você encontra em casa para alcançar resultados eficientes.</p>
							</div>
							<div className="bg-[#6A6F75] hover:bg-orange-500 p-6 rounded-lg text-center">
								<Users className="w-8 h-8 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-white">Comunidade Motivadora</h3>
								<p className="text-gray-300 mt-2">Ambiente acolhedor e motivador para você se manter firme na sua jornada fitness.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="py-20 bg-[#1E2729] flex justify-center items-center">
				<div className="mx-auto px-6 text-center max-w-4xl flex flex-col justify-center items-center">
					<h2 className="text-3xl font-bold mb-6 text-white">Assista ao Nosso Vídeo</h2>
					<p className="text-gray-300 mb-6">
					Conheça mais sobre a Move2Fit e como podemos transformar sua jornada fitness.
					</p>
					<div className="w-full 2xl:w-[1440px] xl:w-[1100px] md:w-[600px] aspect-video ">
						<iframe
							className="w-full h-full"
							src="https://www.youtube.com/embed/JCtXqpLUFxM?si=Yx6o9kcd-kUfJsrV"
							title="YouTube video player"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						></iframe>
					</div>
				</div>
			</div>
		</div>

	);
}
