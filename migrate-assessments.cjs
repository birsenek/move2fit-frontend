// Execute antes de iniciar o backend atualizado: preserva medidas antes de remover colunas.
const path = require('node:path');
const { Client } = require(path.resolve(__dirname, '../move2fit-backend/node_modules/pg'));
async function main() {
	const db = new Client({
		host: process.env.DB_HOST || '127.0.0.1',
		port: Number(process.env.DB_PORT || 5432),
		user: process.env.DB_USERNAME || 'movetofit',
		password: process.env.DB_PASSWORD || 'move2fit',
		database: process.env.DB_NAME || 'movetofit',
	});
	await db.connect();
	try {
		await db.query('BEGIN');
		await db.query(`CREATE TABLE IF NOT EXISTS tb_avaliacoes (
 id SERIAL PRIMARY KEY, "alunoId" integer NOT NULL REFERENCES tb_usuarios(id) ON DELETE CASCADE,
 "treinadorId" integer REFERENCES tb_usuarios(id) ON DELETE SET NULL,
 "dataColeta" date NOT NULL, "semanaInicio" date NOT NULL,
 peso numeric(10,2) NOT NULL, altura numeric(10,2) NOT NULL, imc numeric(10,2) NOT NULL,
 classificacao varchar(255) NOT NULL, origem varchar(20) NOT NULL DEFAULT 'MANUAL',
 CONSTRAINT "UQ_avaliacao_semana" UNIQUE("alunoId","semanaInicio"),
 CONSTRAINT "CK_avaliacao_medidas" CHECK(peso>0 AND altura>0 AND imc>0))`);
		const old = await db.query(
			"SELECT 1 FROM information_schema.columns WHERE table_name='tb_usuarios' AND column_name='peso'",
		);
		if (old.rowCount) {
			// Data de migração, não data histórica de coleta: excluída do treinamento do modelo.
			await db.query(`INSERT INTO tb_avaliacoes ("alunoId","dataColeta","semanaInicio",peso,altura,imc,classificacao,origem)
    SELECT id, CURRENT_DATE, date_trunc('week', CURRENT_DATE)::date,peso,altura,ROUND(peso/(altura*altura),2),COALESCE(classificacao,'Não informada'),'MIGRACAO'
    FROM tb_usuarios WHERE tipo='ALUNO' AND peso>0 AND altura>0 ON CONFLICT DO NOTHING`);
			await db.query(
				'ALTER TABLE tb_usuarios DROP COLUMN peso, DROP COLUMN altura, DROP COLUMN imc, DROP COLUMN classificacao',
			);
		}
		await db.query('COMMIT');
		console.log('Migração das avaliações concluída.');
	} catch (error) {
		await db.query('ROLLBACK');
		throw error;
	} finally {
		await db.end();
	}
}
main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
