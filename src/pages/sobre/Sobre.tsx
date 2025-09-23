import { useState } from 'react';

function Sobre() {
	const [formData, setFormData] = useState({ nome: '', assunto: '' });

	const handleChange = (e: { target: { name: any; value: any } }) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		const mailtoLink = `mailto:grupo02turmajavascript06@gmail.com?subject=${encodeURIComponent(
			formData.assunto,
		)}&body=Nome: ${encodeURIComponent(formData.nome)}`;
		window.location.href = mailtoLink;
	};

	return (
		<div className="relative min-h-screen bg-black">
			<div
				className="absolute inset-0 z-10"
				style={{
					backgroundImage: 'url(/images/Rectangle-shadow.svg)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					mixBlendMode: 'multiply',
				}}
			/>

			<div
				className="absolute inset-0"
				style={{
					backgroundImage: 'url(/images/man-exercise.jpg)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					opacity: '0.8',
				}}
			/>

			<div className="relative z-20 mx-auto px-6 md:px-12 pt-45 py-85">
				<div className="max-w-2xl">
					<h2 className="text-[#FD6101] text-2xl mb-4 block">Sobre nós |</h2>
					<h1 className="text-white text-5xl font-bold mb-6">Move2Fit</h1>
					<p className="text-gray-300 text-lg leading-relaxed mb-8">
						Transforma a gestão de treinos, facilitando a vida de personal trainers e alunos. Treinadores
						podem criar treinos personalizados, acompanhar o progresso e se comunicar de forma prática.
						Alunos têm acompanhamento claro e motivador, com foco no desempenho e resultados rápidos. O
						aplicativo otimiza a rotina fitness, aumenta a motivação e reduz a desistência. Com o Move 2
						Fit, sua jornada fitness nunca foi tão simples, organizada e eficaz.
					</p>

					<form onSubmit={handleSubmit} className="bg-[#1E2729]/50 p-6 rounded-lg shadow-lg space-y-2">
						<label className="block text-white">Nome:</label>
						<input
							type="text"
							name="nome"
							value={formData.nome}
							onChange={handleChange}
							placeholder="Nome"
							className="w-full p-2 rounded bg-white text-black border focus:border-[#FD6101] focus:outline-none"
							required
						/>
						<label className="block text-white">Assunto:</label>
						<input
							type="text"
							name="assunto"
							value={formData.assunto}
							onChange={handleChange}
							placeholder="Assunto"
							className="w-full p-2 rounded bg-white text-black border focus:border-[#FD6101] focus:outline-none"
							required
						/>
						<button
							type="submit"
							className="mt-4 bg-[#FD6101] text-white px-8 py-3 rounded-md hover:bg-[#ff7a33] transition-colors duration-300 font-medium cursor-pointer">
							CONTATE-NOS
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Sobre;
