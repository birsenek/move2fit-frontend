// Executar com API e PostgreSQL locais iniciados: node --test tests/trainer-students.integration.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { Client } = require(path.resolve(__dirname, '../../move2fit-backend/node_modules/pg'));
const base = process.env.TEST_API_URL || 'http://localhost:3000';
const suffix = `${Date.now()}-${process.pid}`;
const password = 'Integration@123';
const email = (name) => `${name}-${suffix}@move2fit.local`;

async function call(method, route, token, body, expected) {
	const response = await fetch(base + route, {
		method,
		headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
		...(body ? { body: JSON.stringify(body) } : {}),
		signal: AbortSignal.timeout(10000),
	});
	const content = await response.text();
	assert.equal(response.status, expected, `${method} ${route}: ${content}`);
	return content ? JSON.parse(content) : undefined;
}

test('isolamento, autocomplete, cadastro sem duplicação e aluno com vários treinadores', async (t) => {
	const db = new Client({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 5432),
		user: process.env.DB_USERNAME || 'movetofit',
		password: process.env.DB_PASSWORD || 'move2fit',
		database: process.env.DB_NAME || 'movetofit',
	});
	await db.connect();
	try {
		const makeTrainer = async (name) => {
			await call(
				'POST',
				'/usuarios/cadastrar',
				null,
				{ nome: name, usuario: email(name), senha: password, tipo: 'PERSONAL_TRAINER' },
				201,
			);
			return call('POST', '/usuarios/logar', null, { usuario: email(name), senha: password }, 200);
		};
		const trainerA = await makeTrainer('trainer-a');
		const trainerB = await makeTrainer('trainer-b');
		const record = {
			nome: `Aluno de teste ${suffix}`,
			usuario: email('student'),
			senha: password,
			peso: 70,
			altura: 1.75,
			foto: '',
		};
		let student;
		let studentToken;
		const exercises = await call('GET', '/exercicios', trainerA.token, null, 200);
		const exerciseId = exercises[0].id;

		await t.test(
			'novo aluno pertence somente ao treinador autenticado; relação enviada no corpo é ignorada',
			async () => {
				student = await call(
					'POST',
					'/alunos',
					trainerA.token,
					{ ...record, treinadores: [{ id: trainerB.id }], tipo: 'PERSONAL_TRAINER' },
					201,
				);
				assert.equal(student.tipo, 'ALUNO');
				assert.equal(student.senha, undefined);
				const a = await call('GET', '/alunos', trainerA.token, null, 200);
				const b = await call('GET', '/alunos', trainerB.token, null, 200);
				assert.deepEqual(
					a.map((row) => row.id),
					[student.id],
				);
				assert.deepEqual(b, []);
			},
		);

		await t.test(
			'outro treinador não pode ler, editar, remover vínculo nem alterar exercícios por ID',
			async () => {
				await call('GET', `/alunos/${student.id}`, trainerB.token, null, 404);
				await call('PUT', '/alunos', trainerB.token, { id: student.id, nome: 'Não permitido' }, 404);
				await call('DELETE', `/alunos/${student.id}`, trainerB.token, null, 404);
				await call('POST', `/alunos/${student.id}/exercicios/${exerciseId}`, trainerB.token, {}, 404);
				await call('DELETE', `/alunos/${student.id}/exercicios/${exerciseId}`, trainerB.token, null, 404);
				await call('GET', '/usuarios/all', trainerB.token, null, 401);
			},
		);

		await t.test('autocomplete por nome e email revela apenas identidade e estado do vínculo', async () => {
			for (const query of [record.nome, record.usuario.toUpperCase()]) {
				const results = await call(
					'GET',
					`/alunos/buscar?q=${encodeURIComponent(query)}`,
					trainerB.token,
					null,
					200,
				);
				assert.equal(results.length, 1);
				assert.deepEqual(Object.keys(results[0]).sort(), ['id', 'nome', 'usuario', 'vinculado']);
				assert.equal(results[0].vinculado, false);
			}
			assert.deepEqual(await call('GET', '/alunos/buscar?q=a', trainerA.token, null, 200), []);
			assert.deepEqual(await call('GET', '/alunos/buscar?q=%25%25', trainerA.token, null, 200), []);
			await call('GET', '/alunos/buscar?q=one&q=two', trainerA.token, null, 400);
		});

		await t.test('aluno existente é vinculado a um segundo treinador sem alterar dados ou senha', async () => {
			const before = await db.query(
				'SELECT u.senha, u.nome, a.peso, a.altura FROM tb_usuarios u LEFT JOIN tb_avaliacoes a ON a."alunoId"=u.id WHERE u.id=$1 ORDER BY a.id',
				[student.id],
			);
			const linked = await call(
				'POST',
				'/alunos',
				trainerB.token,
				{
					...record,
					usuario: ` ${record.usuario.toUpperCase()} `,
					nome: 'Não sobrescrever',
					senha: 'OutraSenha@123',
					peso: 90,
				},
				201,
			);
			assert.equal(linked.id, student.id);
			assert.deepEqual(
				(
					await db.query(
						'SELECT u.senha, u.nome, a.peso, a.altura FROM tb_usuarios u LEFT JOIN tb_avaliacoes a ON a."alunoId"=u.id WHERE u.id=$1 ORDER BY a.id',
						[student.id],
					)
				).rows,
				before.rows,
			);
			const count = await db.query('SELECT count(*)::int AS total FROM tb_usuarios WHERE LOWER(usuario)=$1', [
				record.usuario,
			]);
			assert.equal(count.rows[0].total, 1);
			for (const trainer of [trainerA, trainerB])
				assert.equal((await call('GET', '/alunos', trainer.token, null, 200))[0].id, student.id);
			await call('POST', `/alunos/${student.id}/vincular`, trainerB.token, {}, 200);
			await call('POST', `/alunos/${student.id}/vincular`, trainerB.token, {}, 200);
			const links = await db.query('SELECT count(*)::int AS total FROM tb_treinador_aluno WHERE "alunoId"=$1', [
				student.id,
			]);
			assert.equal(links.rows[0].total, 2);
			studentToken = (
				await call('POST', '/usuarios/logar', null, { usuario: record.usuario, senha: password }, 200)
			).token;
		});

		await t.test('conta de aluno não pode administrar alunos nem criar vínculos', async () => {
			await call('GET', '/alunos', studentToken, null, 403);
			await call('GET', '/alunos/buscar?q=Aluno', studentToken, null, 403);
			await call('GET', `/alunos/${student.id}`, studentToken, null, 403);
			await call('POST', `/alunos/${student.id}/vincular`, studentToken, {}, 403);
			await call('POST', '/alunos', studentToken, record, 403);
		});

		await t.test('catálogo não expõe alunos e não aceita alterações aninhadas', async () => {
			const exercise = await call('GET', `/exercicios/${exerciseId}`, trainerA.token, null, 200);
			assert.equal(exercise.aluno, undefined);
			await call('PUT', '/exercicios', trainerB.token, { ...exercise, aluno: [{ id: student.id }] }, 400);
		});

		await t.test(
			'treinador vinculado pode editar dados e exercícios, sem mudar email, perfil, senha ou outros vínculos',
			async () => {
				const before = await db.query('SELECT senha FROM tb_usuarios WHERE id=$1', [student.id]);
				const updated = await call(
					'PUT',
					'/alunos',
					trainerA.token,
					{
						id: student.id,
						nome: record.nome,
						peso: 80,
						altura: 1.8,
						usuario: email('hijack'),
						senha: 'OutraSenha@123',
						tipo: 'PERSONAL_TRAINER',
						treinadores: [],
					},
					200,
				);
				assert.equal(updated.usuario, record.usuario);
				assert.equal(updated.peso, record.peso);
				assert.equal(updated.altura, record.altura);
				assert.equal(updated.tipo, 'ALUNO');
				assert.equal(updated.senha, undefined);
				assert.deepEqual(
					(await db.query('SELECT senha FROM tb_usuarios WHERE id=$1', [student.id])).rows,
					before.rows,
				);
				await call('POST', `/alunos/${student.id}/exercicios/${exerciseId}`, trainerA.token, {}, 200);
				const visible = await call('GET', `/alunos/${student.id}`, trainerB.token, null, 200);
				assert.equal(visible.exercicio.length, 1);
				await call('DELETE', `/alunos/${student.id}/exercicios/${exerciseId}`, trainerB.token, null, 204);
				assert.equal(
					(await call('GET', `/alunos/${student.id}`, trainerA.token, null, 200)).exercicio.length,
					0,
				);
			},
		);

		await t.test('avaliações respeitam vínculos, validam dados e mantêm um registro por semana', async () => {
			const rota = '/alunos/' + student.id + '/avaliacoes';
			const inicial = await call('GET', rota, trainerA.token, null, 200);
			assert.equal(inicial.historico.length, 1);
			assert.equal(inicial.historico[0].treinadorId, trainerA.id);
			await call('GET', rota, studentToken, null, 403);
			const medida = { dataColeta: '2026-03-02', peso: 80, altura: 2 };
			await call('POST', rota, studentToken, medida, 403);
			await call('POST', rota, trainerA.token, { ...medida, peso: -1 }, 400);
			await call('POST', rota, trainerA.token, { ...medida, altura: 0 }, 400);
			await call('POST', rota, trainerA.token, { ...medida, dataColeta: '2026-02-30' }, 400);
			await call('POST', rota, trainerA.token, { ...medida, dataColeta: '2099-01-01' }, 400);
			await call('POST', rota, trainerA.token, { ...medida, imc: 999, alunoId: trainerB.id }, 400);
			const criado = await call('POST', rota, trainerA.token, medida, 201);
			assert.equal(criado.imc, 20);
			assert.equal(criado.treinadorId, trainerA.id);
			await call('POST', rota, trainerB.token, { ...medida, dataColeta: '2026-03-08' }, 409);
			assert.equal((await call('GET', rota, trainerB.token, null, 200)).historico.length, 2);
			const resultados = await Promise.all(
				[trainerA, trainerB].map(async (trainer, index) => {
					const r = await fetch(base + rota, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', Authorization: trainer.token },
						body: JSON.stringify({ ...medida, dataColeta: index ? '2026-03-10' : '2026-03-09' }),
						signal: AbortSignal.timeout(10000),
					});
					return r.status;
				}),
			);
			// Uma das requisições ganha o bloqueio; a outra não duplica a semana.
			assert.deepEqual(resultados.sort(), [201, 409]);
			await call('DELETE', '/alunos/' + student.id, trainerA.token, null, 204);
			await call('GET', rota, trainerA.token, null, 404);
			await call('POST', rota, trainerA.token, { ...medida, dataColeta: '2026-03-16' }, 404);
			await call('POST', '/alunos/' + student.id + '/vincular', trainerA.token, {}, 200);
		});

		await t.test('remover vínculo preserva o aluno e o acesso do outro treinador', async () => {
			await call('DELETE', `/alunos/${student.id}`, trainerA.token, null, 204);
			await call('GET', `/alunos/${student.id}`, trainerA.token, null, 404);
			assert.equal((await call('GET', `/alunos/${student.id}`, trainerB.token, null, 200)).id, student.id);
			assert.equal(
				(await db.query('SELECT count(*)::int AS total FROM tb_usuarios WHERE id=$1', [student.id])).rows[0]
					.total,
				1,
			);
		});

		await t.test('cadastros simultâneos criam um aluno com dois vínculos', async () => {
			const concurrent = { ...record, usuario: email('concurrent') };
			const [first, second] = await Promise.all([
				call('POST', '/alunos', trainerA.token, concurrent, 201),
				call(
					'POST',
					'/alunos',
					trainerB.token,
					{ ...concurrent, usuario: concurrent.usuario.toUpperCase() },
					201,
				),
			]);
			assert.equal(first.id, second.id);
			assert.equal(
				(
					await db.query('SELECT count(*)::int AS total FROM tb_usuarios WHERE LOWER(usuario)=$1', [
						concurrent.usuario,
					])
				).rows[0].total,
				1,
			);
			assert.equal(
				(await db.query('SELECT count(*)::int AS total FROM tb_treinador_aluno WHERE "alunoId"=$1', [first.id]))
					.rows[0].total,
				2,
			);
		});

		await t.test(
			'email de treinador não pode ser reutilizado como aluno; cadastro incompleto não cria registros',
			async () => {
				await call('POST', '/alunos', trainerA.token, { usuario: email('trainer-b') }, 409);
				await call('POST', '/alunos', trainerA.token, { usuario: email('incomplete') }, 400);
				await call('POST', `/alunos/${trainerB.id}/vincular`, trainerA.token, {}, 404);
				assert.equal(
					(
						await db.query('SELECT count(*)::int AS total FROM tb_usuarios WHERE usuario=$1', [
							email('incomplete'),
						])
					).rows[0].total,
					0,
				);
			},
		);
	} finally {
		// Limpa somente as contas temporárias desta execução, mesmo se um teste falhar.
		try {
			await db.query('BEGIN');
			const ids = (
				await db.query('SELECT id FROM tb_usuarios WHERE usuario LIKE $1', [`%-${suffix}@move2fit.local`])
			).rows.map((row) => row.id);
			await db.query(
				'DELETE FROM tb_treinador_aluno WHERE "alunoId" = ANY($1::int[]) OR "treinadorId" = ANY($1::int[])',
				[ids],
			);
			await db.query('DELETE FROM tb_usuarios_exercicio_tb_exercicios WHERE "tbUsuariosId" = ANY($1::int[])', [
				ids,
			]);
			await db.query('DELETE FROM tb_usuarios WHERE id = ANY($1::int[])', [ids]);
			await db.query('COMMIT');
		} catch (error) {
			await db.query('ROLLBACK');
			throw error;
		} finally {
			await db.end();
		}
	}
});
