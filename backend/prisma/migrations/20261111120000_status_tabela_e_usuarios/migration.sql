-- CreateTable: status passa a ser uma tabela
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "status_nome_key" ON "status"("nome");

-- Valores iniciais
INSERT INTO "status" ("nome") VALUES
    ('PENDENTE'),
    ('CONFIRMADO'),
    ('CONCLUIDO'),
    ('CANCELADO');

-- Migra os agendamentos existentes (coluna de texto -> chave estrangeira)
ALTER TABLE "agendamentos" ADD COLUMN "statusId" INTEGER;

UPDATE "agendamentos" a
SET "statusId" = s."id"
FROM "status" s
WHERE s."nome" = a."status";

UPDATE "agendamentos"
SET "statusId" = (SELECT "id" FROM "status" WHERE "nome" = 'PENDENTE')
WHERE "statusId" IS NULL;

ALTER TABLE "agendamentos" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "agendamentos" DROP COLUMN "status";

CREATE INDEX "agendamentos_statusId_idx" ON "agendamentos"("statusId");

ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_statusId_fkey"
    FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: usuários do sistema (login)
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
