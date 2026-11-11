const BASE = import.meta.env.VITE_API_URL || "/api";

// Rotas de login/cadastro devolvem 401 para credenciais erradas;
// nessas o 401 é só uma mensagem de erro, não "sessão expirada".
const rotasPublicas = ["/auth/login", "/auth/registro"];

async function request(method, rota, corpo) {
  let res;
  try {
    res = await fetch(`${BASE}${rota}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // envia e recebe o cookie de sessão
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error("Não foi possível conectar à API. O backend está rodando?");
  }
  const dados = await res.json().catch(() => ({}));

  if (res.status === 401 && !rotasPublicas.includes(rota)) {
    // Sessão expirou ou foi invalidada: o App volta para a tela de login.
    window.dispatchEvent(new Event("sessao-expirada"));
  }

  if (!res.ok) throw new Error(dados.erro || `Erro ${res.status}`);
  return dados;
}

export const api = {
  get: (rota) => request("GET", rota),
  post: (rota, corpo) => request("POST", rota, corpo),
  put: (rota, corpo) => request("PUT", rota, corpo),
  del: (rota) => request("DELETE", rota),
};

export const moeda = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataHoraBR = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const rotuloStatus = (nome) => nome.charAt(0) + nome.slice(1).toLowerCase();
