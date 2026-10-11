// Adapta os dados do seed original ao modelo atual, sem limpar o banco.
const fs = require('node:fs');
const path = require('node:path');
const backend = path.resolve(__dirname, '../move2fit-backend');
const { Client } = require(path.join(backend, 'node_modules/pg'));
const bcrypt = require(path.join(backend, 'node_modules/bcrypt'));
const source = fs.readFileSync(path.join(backend, 'sql/seed.sql'), 'utf8');
const trainerEmails = new Set(['carlos.oliveira@email.com', 'ana.lima@email.com']);

function seedAvatar(nome, email) {
	const parts = nome.trim().split(/\s+/);
	const initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
	const escape = (value) =>
		value.replace(
			/[&<>"']/g,
			(character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character],
		);
	const colors = ['#9A3412', '#075985', '#166534', '#6B21A8', '#9F1239', '#115E59'];
	const hash = [...email].reduce((sum, character) => sum + character.charCodeAt(0), 0);
	const file = `${email.split('@')[0].replace(/[^a-z0-9.-]/gi, '-')}.svg`;
	const directory = path.join(__dirname, 'public/images/avatars-seed');
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(
		path.join(directory, file),
		`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-labelledby="title"><title id="title">Avatar de ${escape(nome)}</title><rect width="320" height="320" rx="160" fill="${colors[hash % colors.length]}"/><text x="160" y="164" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="104" font-weight="700" fill="#FFFFFF">${escape(initials)}</text></svg>\n`,
	);
	return `/images/avatars-seed/${file}`;
}

async function main() {
	const db = new Client({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 5432),
		user: process.env.DB_USERNAME || 'movetofit',
		password: process.env.DB_PASSWORD || 'move2fit',
		database: process.env.DB_NAME || 'movetofit',
	});
	await db.connect();
	let transaction = false;
	const added = { categorias: 0, exercicios: 0, treinadores: 0, alunos: 0, vinculos: 0 };
	let changedRoles = 0;
	let trainerLinks = 0;
	let photosUpdated = 0;
	// O PostgreSQL interpreta os VALUES do arquivo; nao usamos IDs fixos no destino.
	async function readRows(table) {
		const escaped = table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const match = source.match(
			new RegExp(`INSERT INTO "?${escaped}"?\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`, 'i'),
		);
		if (!match) throw new Error(`Dados de ${table} ausentes no seed original.`);
		return (await db.query(`SELECT * FROM (VALUES ${match[2]}) AS seed (${match[1]})`)).rows;
	}
	async function ensureUser(row, tipo, hash, syncRole = false) {
		const email = row.usuario || row.email;
		const existing = await db.query('SELECT id, tipo, nome, foto FROM tb_usuarios WHERE usuario = $1', [email]);
		if (existing.rowCount > 1) throw new Error(`Email duplicado no banco: ${email}`);
		if (existing.rowCount) {
			const avatar = seedAvatar(existing.rows[0].nome, email);
			// Trocar somente os retratos originais do seed, preservando fotos personalizadas.
			if (existing.rows[0].foto === row.foto) {
				await db.query('UPDATE tb_usuarios SET foto = $1 WHERE id = $2', [avatar, existing.rows[0].id]);
				photosUpdated++;
			}
			if (existing.rows[0].tipo !== tipo) {
				if (!syncRole) throw new Error(`Tipo diferente para ${email}; nenhum cadastro foi alterado.`);
				await db.query('UPDATE tb_usuarios SET tipo = $1 WHERE id = $2', [tipo, existing.rows[0].id]);
				changedRoles++;
			}
			return existing.rows[0].id;
		}
		const result = await db.query(
			'INSERT INTO tb_usuarios (nome, usuario, senha, foto, tipo) VALUES ($1,$2,$3,$4,$5) RETURNING id',
			[row.nome, email, hash, seedAvatar(row.nome, email), tipo],
		);
		added[tipo === 'ALUNO' ? 'alunos' : 'treinadores']++;
		return result.rows[0].id;
	}
	try {
		await db.query('BEGIN');
		transaction = true;
		await db.query("SELECT pg_advisory_xact_lock(hashtext('move2fit-local-seed'))");
		const hash = await bcrypt.hash('Senha@123', 10);
		const categories = [];
		for (const row of await readRows('tb_categorias')) {
			const existing = await db.query('SELECT id FROM tb_categorias WHERE nome = $1 ORDER BY id LIMIT 1', [
				row.nome,
			]);
			if (existing.rowCount) categories.push(existing.rows[0].id);
			else {
				const result = await db.query(
					'INSERT INTO tb_categorias (nome, descricao, icone) VALUES ($1,$2,$3) RETURNING id',
					[row.nome, row.descricao, row.icone],
				);
				categories.push(result.rows[0].id);
				added.categorias++;
			}
		}
		const exercises = [];
		for (const row of await readRows('tb_exercicios')) {
			const categoria = categories[row.categoriaId - 1];
			if (!categoria) throw new Error(`Categoria ausente para ${row.nome}`);
			const existing = await db.query(
				'SELECT id FROM tb_exercicios WHERE nome = $1 AND "categoriaId" = $2 ORDER BY id LIMIT 1',
				[row.nome, categoria],
			);
			if (existing.rowCount) exercises.push(existing.rows[0].id);
			else {
				const result = await db.query(
					'INSERT INTO tb_exercicios (nome, descricao, carga, repeticao, tempo, foto, "categoriaId") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
					[row.nome, row.descricao, row.carga, row.repeticao, row.tempo, row.foto, categoria],
				);
				exercises.push(result.rows[0].id);
				added.exercicios++;
			}
		}
		const trainers = [];
		const seedStudents = [];
		for (const row of await readRows('tb_usuarios')) {
			const tipo = trainerEmails.has(row.usuario) ? 'PERSONAL_TRAINER' : 'ALUNO';
			const id = await ensureUser(row, tipo, hash, true);
			if (tipo === 'PERSONAL_TRAINER') trainers.push(id);
			else seedStudents.push(id);
		}
		const students = [];
		for (const row of await readRows('tb_alunos')) students.push(await ensureUser(row, 'ALUNO', hash));
		seedStudents.push(...students);
		if (trainers.length !== 2) throw new Error('O seed deve conter exatamente dois treinadores.');
		for (let index = 0; index < seedStudents.length; index++) {
			// Distribuir apenas alunos ainda sem treinador; reexecução preserva vínculos manuais.
			const result = await db.query(
				'INSERT INTO tb_treinador_aluno ("alunoId", "treinadorId") SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM tb_treinador_aluno WHERE "alunoId" = $1) ON CONFLICT DO NOTHING',
				[seedStudents[index], trainers[index % trainers.length]],
			);
			trainerLinks += result.rowCount;
		}
		for (const row of await readRows('tb_alunos_exercicio_tb_exercicios')) {
			const student = students[row.tbAlunosId - 1];
			const exercise = exercises[row.tbExerciciosId - 1];
			if (!student || !exercise) throw new Error('Vinculo do seed sem aluno ou exercicio.');
			const result = await db.query(
				'INSERT INTO tb_usuarios_exercicio_tb_exercicios ("tbUsuariosId", "tbExerciciosId") VALUES ($1,$2) ON CONFLICT DO NOTHING',
				[student, exercise],
			);
			added.vinculos += result.rowCount;
		}
		const linhas = [...(await readRows('tb_usuarios')), ...(await readRows('tb_alunos'))];
		let avaliacoes = 0;
		for (let index = 0; index < linhas.length; index++) {
			const row = linhas[index],
				email = row.usuario || row.email;
			if (trainerEmails.has(email)) continue;
			const conta = await db.query("SELECT id FROM tb_usuarios WHERE usuario=$1 AND tipo='ALUNO'", [email]);
			if (!conta.rowCount) continue;
			const alunoId = conta.rows[0].id;
			const migrado = await db.query(
				'SELECT * FROM tb_avaliacoes WHERE "alunoId"=$1 AND origem=\'MIGRACAO\' ORDER BY id DESC LIMIT 1',
				[alunoId],
			);
			const pesoFinal = Number(migrado.rows[0]?.peso ?? row.peso),
				altura = Number(migrado.rows[0]?.altura ?? row.altura);
			const ritmo = [-0.25, 0.12, -0.08, 0.03][index % 4];
			for (let semana = 0; semana < 10; semana++) {
				const data = new Date(Date.UTC(2026, 7, 9 + 7 * semana));
				const dataColeta = data.toISOString().slice(0, 10);
				data.setUTCDate(data.getUTCDate() - 6);
				const semanaInicio = data.toISOString().slice(0, 10);
				const ruido = semana === 9 ? 0 : (((index + semana * 3) % 7) - 3) * 0.04;
				const peso = Number((pesoFinal + ritmo * (semana - 9) + ruido).toFixed(2));
				const imc = Number((peso / altura ** 2).toFixed(2));
				const classificacao =
					imc < 18.5
						? 'Abaixo do peso'
						: imc < 25
							? 'Peso normal'
							: imc < 30
								? 'Sobrepeso'
								: imc < 35
									? 'Obesidade Grau I'
									: imc < 40
										? 'Obesidade Grau II'
										: 'Obesidade Grau III';
				const result = await db.query(
					`INSERT INTO tb_avaliacoes ("alunoId","dataColeta","semanaInicio",peso,altura,imc,classificacao,origem) VALUES ($1,$2,$3,$4,$5,$6,$7,'SEED') ON CONFLICT ("alunoId","semanaInicio") DO UPDATE SET "dataColeta"=EXCLUDED."dataColeta",peso=EXCLUDED.peso,altura=EXCLUDED.altura,imc=EXCLUDED.imc,classificacao=EXCLUDED.classificacao,origem='SEED' WHERE tb_avaliacoes.origem='MIGRACAO'`,
					[alunoId, dataColeta, semanaInicio, peso, altura, imc, classificacao],
				);
				avaliacoes += result.rowCount;
			}
			// A medida migrada é preservada no último ponto do histórico fictício desta conta do seed.
			if (migrado.rowCount)
				await db.query(
					`DELETE FROM tb_avaliacoes migracao WHERE migracao.id=$1 AND migracao.origem='MIGRACAO' AND EXISTS (SELECT 1 FROM tb_avaliacoes copia WHERE copia."alunoId"=migracao."alunoId" AND copia."dataColeta"='2026-10-11' AND copia.origem='SEED' AND copia.peso=migracao.peso AND copia.altura=migracao.altura)`,
					[migrado.rows[0].id],
				);
		}
		console.log('Avaliações fictícias adicionadas:', avaliacoes);
		await db.query('COMMIT');
		transaction = false;
		console.log('Registros adicionados:', JSON.stringify(added));
		console.log('Perfis do seed atualizados:', changedRoles);
		console.log('Vinculos entre treinadores e alunos adicionados:', trainerLinks);
		console.log('Fotos aleatorias do seed substituidas por avatares:', photosUpdated);
		console.log('Login de exemplo: carlos.oliveira@email.com / Senha@123');
		console.log('Cadastros e senhas existentes foram preservados.');
	} catch (error) {
		if (transaction) await db.query('ROLLBACK');
		throw error;
	} finally {
		await db.end();
	}
}
main().catch((error) => {
	console.error('Seed cancelado:', error.message);
	process.exitCode = 1;
});
