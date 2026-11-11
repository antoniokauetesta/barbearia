import { useState } from "react";
import { api } from "./api.js";

export default function Login({ onEntrar }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));
  const registrando = modo === "registro";

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const corpo = registrando
        ? form
        : { email: form.email, senha: form.senha };
      const usuario = await api.post(registrando ? "/auth/registro" : "/auth/login", corpo);
      onEntrar(usuario);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="cartao form login" onSubmit={enviar}>
        <h1>
          <span aria-hidden>💈</span> Barbearia
        </h1>
        <h2>{registrando ? "Criar conta" : "Entrar"}</h2>

        {registrando && (
          <label>
            Nome
            <input
              required
              autoComplete="name"
              value={form.nome}
              onChange={(e) => mudar("nome", e.target.value)}
            />
          </label>
        )}
        <label>
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => mudar("email", e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            minLength={registrando ? 6 : undefined}
            autoComplete={registrando ? "new-password" : "current-password"}
            value={form.senha}
            onChange={(e) => mudar("senha", e.target.value)}
          />
        </label>

        {erro && <p className="erro">{erro}</p>}

        <div className="acoes">
          <button className="primario" disabled={enviando}>
            {registrando ? "Cadastrar" : "Entrar"}
          </button>
          <button
            type="button"
            className="fantasma"
            onClick={() => {
              setModo(registrando ? "login" : "registro");
              setErro("");
            }}
          >
            {registrando ? "Já tenho conta" : "Criar conta"}
          </button>
        </div>
      </form>
    </div>
  );
}
