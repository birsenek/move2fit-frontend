const { test } = require('node:test');
const assert = require('node:assert/strict');
const { tendencia } = require('../../move2fit-backend/dist/avaliacoes/tendencia');
const dados = (pesos) =>
	pesos.map((peso, i) => ({
		dataColeta: new Date(Date.UTC(2026, 2, 2 + i * 7)).toISOString().slice(0, 10),
		peso,
		altura: 2,
	}));
test('aprende uma tendência linear e prevê semana e IMC sem erro temporal', () => {
	const modelo = tendencia(dados([80, 79, 78, 77, 76, 75]));
	assert.equal(modelo.coeficiente, -1);
	assert.equal(modelo.mae, 0);
	assert.equal(modelo.maeBaseline, 1);
	assert.deepEqual(modelo.previsao, { dataColeta: '2026-04-13', peso: 74, imc: 18.5 });
	assert.equal(modelo.testes, 3);
});
test('usa datas reais, ordena entradas e exige cinco avaliações', () => {
	assert.equal(tendencia(dados([70, 71, 72, 73])), null);
	const irregular = [0, 1, 3, 5, 8].map((i) => ({
		dataColeta: new Date(Date.UTC(2026, 2, 2 + i * 7)).toISOString().slice(0, 10),
		peso: 80 - i,
		altura: 2,
	}));
	assert.equal(tendencia(irregular.reverse()).coeficiente, -1);
	assert.equal(tendencia(irregular).previsao.peso, 71);
});
test('teste posterior não participa do treinamento que o prevê', () => {
	const modelo = tendencia(dados([80, 80, 80, 80, 100]));
	assert.equal(modelo.mae, 10);
	assert.equal(modelo.maeBaseline, 10);
});
