import { useEffect } from 'react';

const useHealthCheck = (): void => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(import.meta.env.VITE_API_URL) // Inserir o link da API, com a rota de Health Check
        .then((response) => {
          if (response.ok) {
            console.log('API está ativa');
          } else {
            console.error('Erro ao verificar API:', response.statusText);
          }
        })
        .catch((error) => {
          console.error('Erro ao verificar API:', error.message);
        });
    }, 300000); // 5 minutos

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, []);
};

export default useHealthCheck;