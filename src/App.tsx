import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Sobre from './pages/sobre/Sobre';
import Equipe from './pages/equipe/Equipe';
import Perfil from './pages/perfil/Perfil';
import HomePage from './pages/homepage/HomePage';
import LoginCadastroForm from './pages/logincadastro/LoginCadastroForm';
import ListaCategorias from './components/categorias/listacategorias/ListaCategorias';
import FormCategoria from './components/categorias/formcategoria/FormCategoria';
import DeletarCategoria from './components/categorias/deletarcategoria/DeletarCategoria';
import ListaExercicios from './components/exercicios/listaexercicios/ListaExercicios';
import FormExercicio from './components/exercicios/formexercicio/FormExercicio';
import DeletarExercicio from './components/exercicios/deletarexercicio/DeletarExercicio';
import ListaAluno from './components/aluno/listaaluno/ListaAluno';
import FormAluno from './components/aluno/formaluno/FormAluno';
import DeletarAluno from './components/aluno/deletaraluno/DeletarAluno';
import PerfilAluno from './pages/perfilaluno/PerfilAluno';

import 'react-toastify/dist/ReactToastify.css';
// import useHealthCheck from './hooks/useHealthCheck';

function App() {

	// useHealthCheck();

	return (
		<>
			<AuthProvider>
				<ToastContainer />
				<BrowserRouter basename="/">
					<Navbar />
					<div className="min-h-[80vh]">
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/login" element={<LoginCadastroForm />} />
							<Route path="/cadastro" element={<LoginCadastroForm />} />
							<Route path="/home" element={<Home />} />
							<Route path="/sobre" element={<Sobre />} />
							<Route path="/equipe" element={<Equipe />} />
							<Route path="/perfil" element={<Perfil />} />
							<Route path="/categorias" element={<ListaCategorias />} />
							<Route path="/categorias/store" element={<FormCategoria />} />
							<Route path="/categorias/edit/:id" element={<FormCategoria />} />
							<Route path="/categorias/detroy/:id" element={<DeletarCategoria />} />
							<Route path="/exercicios" element={<ListaExercicios />} />
							<Route path="/exercicios/store" element={<FormExercicio />} />
							<Route path="/exercicios/edit/:id" element={<FormExercicio />} />
							<Route path="/exercicios/detroy/:id" element={<DeletarExercicio />} />
							<Route path="/alunos" element={<ListaAluno />} />
							<Route path="/alunos/store" element={<FormAluno />} />
							<Route path="/alunos/edit/:id" element={<FormAluno />} />
							<Route path="/alunos/destroy/:id" element={<DeletarAluno />} />
							<Route path="/alunos/perfil/:id" element={<PerfilAluno />} />
						</Routes>
					</div>
					<Footer />
				</BrowserRouter>
			</AuthProvider>
		</>
	);
}

export default App;
