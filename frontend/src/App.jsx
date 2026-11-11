import { useEffect, useState } from "react";
import Agendamentos from "./Agendamentos.jsx";
import Crud from "./Crud.jsx";
import Login from "./Login.jsx";
import { api, moeda } from "./api.js";

const abas = [
  { id: "agendamentos", rotulo: "Agendamentos" },
  { id: "clientes", rotulo: "Clientes" },
  { id: "barbeiros", rotulo: "Barbeiros" },
  { id: "servicos", rotulo: "Serviços" },
];

const telas = {
  clientes: {
    titulo: "Cliente",
    rota: "/clientes",
    campos: [
      { nome: "nome", rotulo: "Nome", obrigatorio: true },
      { nome: "telefone", rotulo: "Telefone", obrigatorio: true, tipo: "tel" },
      { nome: "email", rotulo: "E-mail", tipo: "email" },
    ],
    colunas: [
      { nome: "nome", rotulo: "Nome" },
      { nome: "telefone", rotulo: "Telefone" },
      { nome: "email", rotulo: "E-mail" },
    ],
  },
  barbeiros: {
    titulo: "Barbeiro",
    rota: "/barbeiros",
    campos: [
      { nome: "nome", rotulo: "Nome", obrigatorio: true },
      { nome: "telefone", rotulo: "Telefone", obrigatorio: true, tipo: "tel" },
      { nome: "email", rotulo: "E-mail", tipo: "email" },
      { nome: "especialidade", rotulo: "Especialidade" },
    ],
    colunas: [
      { nome: "nome", rotulo: "Nome" },
      { nome: "telefone", rotulo: "Telefone" },
      { nome: "especialidade", rotulo: "Especialidade" },
    ],
  },
  servicos: {
    titulo: "Serviço",
    rota: "/servicos",
    rotuloRemover: "Desativar",
    campos: [
      { nome: "nome", rotulo: "Nome", obrigatorio: true },
      { nome: "descricao", rotulo: "Descrição" },
      { nome: "preco", rotulo: "Preço (R$)", tipo: "number", obrigatorio: true, step: "0.01" },
      { nome: "duracao", rotulo: "Duração (min)", tipo: "number", obrigatorio: true, step: "5" },
      { nome: "ativo", rotulo: "Ativo", tipo: "checkbox", padrao: true, soEdicao: true },
    ],
    colunas: [
      { nome: "nome", rotulo: "Nome" },
      { nome: "preco", rotulo: "Preço", formatar: moeda },
      { nome: "duracao", rotulo: "Duração", formatar: (v) => `${v} min` },
      { nome: "ativo", rotulo: "Status", formatar: (v) => (v ? "Ativo" : "Inativo") },
    ],
  },
};

export default function App() {
  const [aba, setAba] = useState("agendamentos");
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Ao abrir o site, pergunta à API se o cookie de sessão ainda é válido.
  useEffect(() => {
    api
      .get("/auth/me")
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false));

    const aoExpirar = () => setUsuario(null);
    window.addEventListener("sessao-expirada", aoExpirar);
    return () => window.removeEventListener("sessao-expirada", aoExpirar);
  }, []);

  const sair = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUsuario(null);
    setAba("agendamentos");
  };

  if (verificando) return null;
  if (!usuario) return <Login onEntrar={setUsuario} />;

  return (
    <div className="app">
      <header className="topo">
        <h1>
          <span aria-hidden>💈</span> Barbearia
        </h1>
        <nav>
          {abas.map((a) => (
            <button
              key={a.id}
              className={aba === a.id ? "aba ativa" : "aba"}
              onClick={() => setAba(a.id)}
            >
              {a.rotulo}
            </button>
          ))}
        </nav>
        <div className="usuario">
          <span>{usuario.nome}</span>
          <button className="fantasma" onClick={sair}>Sair</button>
        </div>
      </header>
      <main>
        {aba === "agendamentos" ? <Agendamentos /> : <Crud key={aba} {...telas[aba]} />}
      </main>
    </div>
  );
}
