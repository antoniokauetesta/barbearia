import { useEffect, useState } from "react";
import { api, dataHoraBR, moeda, rotuloStatus } from "./api.js";

const formVazio = { clienteId: "", barbeiroId: "", servicoId: "", dataHora: "", observacao: "" };

export default function Agendamentos() {
  const [lista, setLista] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [statusLista, setStatusLista] = useState([]);
  const [form, setForm] = useState(formVazio);
  const [filtro, setFiltro] = useState("TODOS"); // "TODOS" ou id do status
  const [erro, setErro] = useState("");

  const carregar = () =>
    api.get("/agendamentos").then(setLista).catch((e) => setErro(e.message));

  useEffect(() => {
    carregar();
    Promise.all([
      api.get("/clientes"),
      api.get("/barbeiros"),
      api.get("/servicos"),
      api.get("/status"),
    ])
      .then(([c, b, s, st]) => {
        setClientes(c);
        setBarbeiros(b);
        setServicos(s.filter((x) => x.ativo));
        setStatusLista(st);
      })
      .catch((e) => setErro(e.message));
  }, []);

  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const criar = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      await api.post("/agendamentos", {
        ...form,
        dataHora: new Date(form.dataHora).toISOString(),
        observacao: form.observacao || undefined,
      });
      setForm(formVazio);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const mudarStatus = async (id, statusId) => {
    setErro("");
    try {
      await api.put(`/agendamentos/${id}`, { statusId: Number(statusId) });
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const excluir = async (id) => {
    if (!confirm("Excluir este agendamento?")) return;
    setErro("");
    try {
      await api.del(`/agendamentos/${id}`);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const visiveis = filtro === "TODOS" ? lista : lista.filter((a) => a.statusId === filtro);
  const semCadastro = !clientes.length || !barbeiros.length || !servicos.length;

  return (
    <section>
      <form className="cartao form" onSubmit={criar}>
        <h2>Novo agendamento</h2>
        {semCadastro && (
          <p className="aviso">
            Cadastre ao menos um cliente, um barbeiro e um serviço ativo antes de agendar.
          </p>
        )}
        <div className="grade">
          <label>
            Cliente
            <select required value={form.clienteId} onChange={(e) => mudar("clienteId", e.target.value)}>
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </label>
          <label>
            Barbeiro
            <select required value={form.barbeiroId} onChange={(e) => mudar("barbeiroId", e.target.value)}>
              <option value="">Selecione…</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </select>
          </label>
          <label>
            Serviço
            <select required value={form.servicoId} onChange={(e) => mudar("servicoId", e.target.value)}>
              <option value="">Selecione…</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} — {moeda(s.preco)}</option>
              ))}
            </select>
          </label>
          <label>
            Data e hora
            <input
              type="datetime-local"
              required
              value={form.dataHora}
              onChange={(e) => mudar("dataHora", e.target.value)}
            />
          </label>
          <label className="largo">
            Observação
            <input value={form.observacao} onChange={(e) => mudar("observacao", e.target.value)} />
          </label>
        </div>
        {erro && <p className="erro">{erro}</p>}
        <div className="acoes">
          <button className="primario" disabled={semCadastro}>Agendar</button>
        </div>
      </form>

      <div className="filtros">
        <button className={filtro === "TODOS" ? "chip ativo" : "chip"} onClick={() => setFiltro("TODOS")}>
          Todos
        </button>
        {statusLista.map((s) => (
          <button key={s.id} className={filtro === s.id ? "chip ativo" : "chip"} onClick={() => setFiltro(s.id)}>
            {rotuloStatus(s.nome)}
          </button>
        ))}
      </div>

      <div className="cartao tabela-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Barbeiro</th>
              <th>Serviço</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visiveis.map((a) => (
              <tr key={a.id}>
                <td data-label="Data">{dataHoraBR(a.dataHora)}</td>
                <td data-label="Cliente">{a.cliente.nome}</td>
                <td data-label="Barbeiro">{a.barbeiro.nome}</td>
                <td data-label="Serviço">
                  {a.servico.nome}
                  {a.observacao && <small className="obs">{a.observacao}</small>}
                </td>
                <td data-label="Status">
                  <select
                    className={`status s-${a.status.nome}`}
                    value={a.statusId}
                    onChange={(e) => mudarStatus(a.id, e.target.value)}
                  >
                    {statusLista.map((s) => (
                      <option key={s.id} value={s.id}>{rotuloStatus(s.nome)}</option>
                    ))}
                  </select>
                </td>
                <td className="linha-acoes">
                  <button className="perigo" onClick={() => excluir(a.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={6} className="vazio">Nenhum agendamento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
