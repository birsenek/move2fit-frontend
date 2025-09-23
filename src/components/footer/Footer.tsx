import { GithubLogo } from '@phosphor-icons/react';
import { ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

function Footer() {
	const { usuario } = useContext(AuthContext);
	let data = new Date().getFullYear();
	let component: ReactNode;
	if (usuario.token !== '') {
		component = (
			<footer className=" w-full bg-[#1E2729] text-[#FFFFFF] py-8 border-t-2 border-[#FD6101]">
				<div className="flex flex-col justify-center items-center mx-5 px-4 lg:px-8">
					<div className="flex flex-col md:flex-row gap-5 md:gap-15">
						<div className="flex items-center">
							<img src="/images/logo-transparente-branca-footer.svg" alt="Move2Fit" className="h-20" />
						</div>

						<div className="flex flex-col items-center text-center">
							<h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
							<ul className="space-y-2">
								<li>
									<Link to="/equipe" className="hover:text-[#FD6101]">
										Equipe
									</Link>
								</li>
								<li>
									<Link to="/sobre" className="hover:text-[#FD6101]">
										Sobre nós
									</Link>
								</li>
							</ul>
						</div>

						<div className="flex flex-col items-center text-center">
							<h3 className="text-white text-lg font-semibold mb-4">Veja agora</h3>
							<ul className="space-y-2">
								<li>
									<Link to="/exercicios" className="hover:text-[#FD6101]">
										Exercícios
									</Link>
								</li>
								<li>
									<Link to="/categorias" className="hover:text-[#FD6101]">
										Categorias
									</Link>
								</li>
							</ul>
						</div>

						<div className="flex flex-col items-center text-center">
							<h3 className="text-white text-lg font-semibold mb-4">Contate-nos</h3>
							<a
								href="https://github.com/grupo-02-turma-javascript-06/fitness-frontend"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-[#FD6101] flex items-center gap-2">
								<GithubLogo size={28} weight="regular" />
								GitHub
							</a>
						</div>
					</div>

					<div className="text-center text-base text-[#F0F0F0] mt-8">
						<p className="text-l">Move2Fit | Copyright: {data}</p>
					</div>
				</div>
			</footer>
		);
	}

	return <>{component}</>;
}
export default Footer;
