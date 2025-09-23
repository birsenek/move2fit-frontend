import { Link } from 'react-router-dom';

function HomePage() {
	return (
		<div className="relative min-h-screen flex items-center justify-center">
			<div
				className="absolute top-0 left-0 w-full h-full"
				style={{
					backgroundImage: `url('/images/imagemlogin.svg')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}></div>

			<div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>

			<div className="relative z-10 text-white text-center p-8 flex flex-col items-center justify-center">
				<img src="/images/logo-transparente-branca.svg" alt="Ilustração" className="mb-6 max-w-full h-auto" />

				<p className="text-3xl mb-4">
					Treinos organizados, resultados reais! Conectando alunos e
					<span className="block">personal trainers para uma jornada fitness mais eficaz.</span>
				</p>

				<div className="flex sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
					<Link to="/login">
						<button className="bg-[#FD6101] text-white px-8 py-3 rounded-md hover:bg-[#ff7a33] transition-colors duration-300 font-medium w-52 text-xl uppercase">
							continuar
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default HomePage;
