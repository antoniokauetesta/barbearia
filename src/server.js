import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.ts";
const app = express();

app.use(express.json());

const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const idValido = (id) =>
  Number.isInteger(Number(id)) && Number(id) > 0;

const statusPermitidos = [
  "PENDENTE",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
];

const relacionamentos = {
  include: {
    cliente: true,
    barbeiro: true,
    servico: true,
  },
};

app.get("/", (req, res) => {
  res.json({ mensagem: "API da Barbearia funcionando!" });
});

app.get("/clientes", asyncRoute(async (req, res) => {
  const clientes = await prisma.cliente.findMany({
    orderBy: { id: "asc" },
  });
  res.json(clientes);
}));

app.get("/clientes/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(req.params.id) },
    include: { agendamentos: true },
  });

  if (!cliente) {
    return res.status(404).json({ erro: "Cliente não encontrado" });
  }

  res.json(cliente);
}));

app.post("/clientes", asyncRoute(async (req, res) => {
  const { nome, telefone, email } = req.body;

  if (
    typeof nome !== "string" || !nome.trim() ||
    typeof telefone !== "string" || !telefone.trim()
  ) {
    return res.status(400).json({
      erro: "Nome e telefone são obrigatórios",
    });
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email || null,
    },
  });

  res.status(201).json(cliente);
}));

app.put("/clientes/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const { nome, telefone, email } = req.body;
  const data = {};

  if (nome !== undefined) data.nome = nome;
  if (telefone !== undefined) data.telefone = telefone;
  if (email !== undefined) data.email = email || null;

  const cliente = await prisma.cliente.update({
    where: { id: Number(req.params.id) },
    data,
  });

  res.json(cliente);
}));

app.delete("/clientes/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  await prisma.cliente.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ mensagem: "Cliente excluído com sucesso" });
}));

app.get("/barbeiros", asyncRoute(async (req, res) => {
  const barbeiros = await prisma.barbeiro.findMany({
    orderBy: { id: "asc" },
  });
  res.json(barbeiros);
}));

app.get("/barbeiros/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const barbeiro = await prisma.barbeiro.findUnique({
    where: { id: Number(req.params.id) },
    include: { agendamentos: true },
  });

  if (!barbeiro) {
    return res.status(404).json({ erro: "Barbeiro não encontrado" });
  }

  res.json(barbeiro);
}));

app.post("/barbeiros", asyncRoute(async (req, res) => {
  const { nome, telefone, email, especialidade } = req.body;

  if (
    typeof nome !== "string" || !nome.trim() ||
    typeof telefone !== "string" || !telefone.trim()
  ) {
    return res.status(400).json({
      erro: "Nome e telefone são obrigatórios",
    });
  }

  const barbeiro = await prisma.barbeiro.create({
    data: {
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email || null,
      especialidade,
    },
  });

  res.status(201).json(barbeiro);
}));

app.put("/barbeiros/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const { nome, telefone, email, especialidade } = req.body;
  const data = {};

  if (nome !== undefined) data.nome = nome;
  if (telefone !== undefined) data.telefone = telefone;
  if (email !== undefined) data.email = email || null;
  if (especialidade !== undefined) data.especialidade = especialidade;

  const barbeiro = await prisma.barbeiro.update({
    where: { id: Number(req.params.id) },
    data,
  });

  res.json(barbeiro);
}));

app.delete("/barbeiros/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  await prisma.barbeiro.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ mensagem: "Barbeiro excluído com sucesso" });
}));

app.get("/servicos", asyncRoute(async (req, res) => {
  const servicos = await prisma.servico.findMany({
    orderBy: { id: "asc" },
  });
  res.json(servicos);
}));

app.get("/servicos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const servico = await prisma.servico.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!servico) {
    return res.status(404).json({ erro: "Serviço não encontrado" });
  }

  res.json(servico);
}));

app.post("/servicos", asyncRoute(async (req, res) => {
  const { nome, descricao, preco, duracao } = req.body;

  if (
    typeof nome !== "string" || !nome.trim() ||
    preco === undefined ||
    !Number.isFinite(Number(preco)) ||
    Number(preco) < 0 ||
    !Number.isInteger(Number(duracao)) ||
    Number(duracao) <= 0
  ) {
    return res.status(400).json({
      erro: "Informe nome, preço válido e duração em minutos",
    });
  }

  const servico = await prisma.servico.create({
    data: {
      nome: nome.trim(),
      descricao,
      preco: Number(preco),
      duracao: Number(duracao),
    },
  });

  res.status(201).json(servico);
}));

app.put("/servicos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const { nome, descricao, preco, duracao, ativo } = req.body;
  const data = {};

  if (nome !== undefined) data.nome = nome;
  if (descricao !== undefined) data.descricao = descricao;

  if (preco !== undefined) {
    if (!Number.isFinite(Number(preco)) || Number(preco) < 0) {
      return res.status(400).json({ erro: "Preço inválido" });
    }
    data.preco = Number(preco);
  }

  if (duracao !== undefined) {
    if (!Number.isInteger(Number(duracao)) || Number(duracao) <= 0) {
      return res.status(400).json({ erro: "Duração inválida" });
    }
    data.duracao = Number(duracao);
  }

  if (ativo !== undefined) data.ativo = ativo;

  const servico = await prisma.servico.update({
    where: { id: Number(req.params.id) },
    data,
  });

  res.json(servico);
}));

app.delete("/servicos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const servico = await prisma.servico.update({
    where: { id: Number(req.params.id) },
    data: { ativo: false },
  });

  res.json({
    mensagem: "Serviço desativado com sucesso",
    servico,
  });
}));

app.get("/agendamentos", asyncRoute(async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    ...relacionamentos,
    orderBy: { dataHora: "asc" },
  });

  res.json(agendamentos);
}));

app.get("/agendamentos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: Number(req.params.id) },
    ...relacionamentos,
  });

  if (!agendamento) {
    return res.status(404).json({
      erro: "Agendamento não encontrado",
    });
  }

  res.json(agendamento);
}));

app.post("/agendamentos", asyncRoute(async (req, res) => {
  const { dataHora, clienteId, barbeiroId, servicoId, observacao } = req.body;

  if (
    !dataHora ||
    !idValido(clienteId) ||
    !idValido(barbeiroId) ||
    !idValido(servicoId)
  ) {
    return res.status(400).json({
      erro: "Informe dataHora, clienteId, barbeiroId e servicoId válidos",
    });
  }

  const data = new Date(dataHora);

  if (Number.isNaN(data.getTime()) || data <= new Date()) {
    return res.status(400).json({
      erro: "Informe uma data e horário futuros válidos",
    });
  }

  const [cliente, barbeiro, servico] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: Number(clienteId) } }),
    prisma.barbeiro.findUnique({ where: { id: Number(barbeiroId) } }),
    prisma.servico.findUnique({ where: { id: Number(servicoId) } }),
  ]);

  if (!cliente || !barbeiro || !servico || !servico.ativo) {
    return res.status(400).json({
      erro: "Cliente, barbeiro ou serviço inválido ou indisponível",
    });
  }

  const agendamento = await prisma.agendamento.create({
    data: {
      dataHora: data,
      clienteId: Number(clienteId),
      barbeiroId: Number(barbeiroId),
      servicoId: Number(servicoId),
      observacao,
    },
    ...relacionamentos,
  });

  res.status(201).json(agendamento);
}));

app.put("/agendamentos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  const {
    dataHora,
    clienteId,
    barbeiroId,
    servicoId,
    observacao,
    status,
  } = req.body;

  const data = {};

  if (dataHora !== undefined) {
    const dataValida = new Date(dataHora);

    if (Number.isNaN(dataValida.getTime())) {
      return res.status(400).json({ erro: "Data e horário inválidos" });
    }

    data.dataHora = dataValida;
  }

  for (const [campo, valor] of Object.entries({
    clienteId,
    barbeiroId,
    servicoId,
  })) {
    if (valor !== undefined) {
      if (!idValido(valor)) {
        return res.status(400).json({ erro: `${campo} inválido` });
      }
      data[campo] = Number(valor);
    }
  }

  if (observacao !== undefined) data.observacao = observacao;

  if (status !== undefined) {
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ erro: "Status inválido" });
    }
    data.status = status;
  }

  const agendamento = await prisma.agendamento.update({
    where: { id: Number(req.params.id) },
    data,
    ...relacionamentos,
  });

  res.json(agendamento);
}));

app.delete("/agendamentos/:id", asyncRoute(async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  await prisma.agendamento.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ mensagem: "Agendamento excluído com sucesso" });
}));

app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.code === "P2002") {
    return res.status(409).json({
      erro: "Telefone ou email já cadastrado",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      erro: "Registro não encontrado",
    });
  }

  if (error.code === "P2003") {
    return res.status(400).json({
      erro: "Não é possível excluir o registro porque existem agendamentos relacionados",
    });
  }

  console.error(error);

  res.status(500).json({
    erro: "Erro interno do servidor",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
