import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function Crud({ titulo, rota, campos, colunas, rotuloRemover = "Excluir" }) {
  const vazio = () =>
    Object.fromEntries(campos.map((c) => [c.nome, c.padrao ?? (c.tipo === "checkbox" ? false : "")]));

  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editId, setEditId] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = () =>
    api
      .get(rota)
      .then(setItens)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));

  useEffect(() => {
    carregar();
  }, []);

  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const cancelar = () => {
    setEditId(null);
    setForm(vazio());
  };

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const corpo = { ...form };
      if (editId === null) delete corpo.ativo;
      if (editId === null) await api.post(rota, corpo);
      else await api.put(`${rota}/${editId}`, corpo);
      cancelar();
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  const editar = (item) => {
    setEditId(item.id);
    setForm(Object.fromEntries(campos.map((c) => [c.nome, item[c.nome] ?? (c.tipo === "checkbox" ? false : "")])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remover = async (item) => {
    if (!confirm(`${rotuloRemover} "${item.nome}"?`)) return;
    setErro("");
    try {
      await api.del(`${rota}/${item.id}`);
      carregar();
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <section>
      <form className="cartao form" onSubmit={salvar}>
        <h2>{editId ? `Editar ${titulo.toLowerCase()}` : `Novo ${titulo.toLowerCase()}`}</h2>
        <div className="grade">
          {campos
            .filter((c) => !(c.soEdicao && editId === null))
            .map((c) =>
              c.tipo === "checkbox" ? (
                <label key={c.nome} className="check">
                  <input
                    type="checkbox"
                    checked={!!form[c.nome]}
                    onChange={(e) => mudar(c.nome, e.target.checked)}
                  />
                  {c.rotulo}
                </label>
              ) : (
                <label key={c.nome}>
                  {c.rotulo}
                  <input
                    type={c.tipo || "text"}
                    step={c.step}
                    min={c.tipo === "number" ? 0 : undefined}
                    required={c.obrigatorio}
                    value={form[c.nome]}
                    onChange={(e) => mudar(c.nome, e.target.value)}
                  />
                </label>
              )
            )}
        </div>
        {erro && <p className="erro">{erro}</p>}
        <div className="acoes">
          <button className="primario">{editId ? "Salvar alterações" : "Adicionar"}</button>
          {editId && (
            <button type="button" className="fantasma" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="cartao tabela-wrap">
        <table>
          <thead>
            <tr>
              {colunas.map((c) => (
                <th key={c.nome}>{c.rotulo}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                {colunas.map((c) => (
                  <td key={c.nome} data-label={c.rotulo}>
                    {c.formatar ? c.formatar(item[c.nome]) : item[c.nome] || "—"}
                  </td>
                ))}
                <td className="linha-acoes">
                  <button className="fantasma" onClick={() => editar(item)}>Editar</button>
                  <button className="perigo" onClick={() => remover(item)}>{rotuloRemover}</button>
                </td>
              </tr>
            ))}
            {!carregando && itens.length === 0 && (
              <tr>
                <td colSpan={colunas.length + 1} className="vazio">Nada cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
