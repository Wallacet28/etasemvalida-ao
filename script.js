const STORAGE_KEY = "cadastro_plantao";
const AUTH_KEY = "usuario_autenticado";
let dadosPorDia = {};
let editandoRegistro = null;

window.onload = () => {
  const usuarioAutenticado = localStorage.getItem(AUTH_KEY);
  if (!usuarioAutenticado) {
    window.location.href = "login.html";
    return;
  }

  const data = new Date();
  const nomeMes = data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  document.getElementById("mesAtual").textContent =
    nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo) dadosPorDia = JSON.parse(salvo);

  preencherDias();
  atualizarTabela();
};

document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault();

  const agora = new Date();
  const dia = agora.getDate().toString().padStart(2, "0");
  const nomeAba = "Dia " + dia;

  const registro = {
    Data: agora.toLocaleDateString(),
    HF: document.getElementById("hf").value,
    Insumos: {
      Sulfato: document.getElementById("insumoSulfato").value,
      Hipoclorito: document.getElementById("insumoHipoclorito").value,
      Cal: document.getElementById("insumoCal").value,
      Fluossilicato: document.getElementById("insumoFluossilicato").value,
    },
    Lavagem: {
      Hora: document.getElementById("horaLavagem").value,
      Filtro1: document.getElementById("filtro1Lavagem").value,
      Filtro2: document.getElementById("filtro2Lavagem").value,
    },
    Observacao: document.getElementById("observacao").value,
    Assinatura: document.getElementById("assinatura").value,
  };

  if (editandoRegistro !== null) {
    dadosPorDia[editandoRegistro.dia][editandoRegistro.index] = registro;
    editandoRegistro = null;
  } else {
    if (!dadosPorDia[nomeAba]) dadosPorDia[nomeAba] = [];
    dadosPorDia[nomeAba].push(registro);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosPorDia));
  alert("Registro salvo com sucesso!");

  this.reset();
  document.querySelector('button[type="submit"]').textContent = "Salvar";
  preencherDias();
  atualizarTabela(document.getElementById("selecionarDia").value || nomeAba);
});

function preencherDias() {
  const select = document.getElementById("selecionarDia");
  select.innerHTML = "";

  const hoje = new Date();
  const diaHoje = "Dia " + hoje.getDate().toString().padStart(2, "0");
  const diasOrdenados = Object.keys(dadosPorDia).sort(
    (a, b) => parseInt(a.replace("Dia ", "")) - parseInt(b.replace("Dia ", ""))
  );

  for (const dia of diasOrdenados) {
    const opt = document.createElement("option");
    opt.value = dia;
    opt.textContent = dia;
    select.appendChild(opt);
  }

  if (!select.value) {
    const optHoje = document.createElement("option");
    optHoje.value = diaHoje;
    optHoje.textContent = diaHoje;
    select.appendChild(optHoje);
  }

  select.value = diaHoje;
}

function atualizarTabela(diaSelecionado = null) {
  const hoje = new Date();
  const nomeAba = diaSelecionado || "Dia " + hoje.getDate().toString().padStart(2, '0');

  const tbody = document.querySelector("#tabela-registros tbody");
  tbody.innerHTML = "";

  if (!dadosPorDia[nomeAba]) return;

  dadosPorDia[nomeAba].forEach((reg, index) => {
    const tr = document.createElement("tr");

    const td = (text) => {
      const td = document.createElement("td");
      td.textContent = text || "";
      return td;
    };

    tr.appendChild(td(reg.Data));
    tr.appendChild(td(reg.HF));
    tr.appendChild(td(reg.Insumos.Sulfato));
    tr.appendChild(td(reg.Insumos.Hipoclorito));
    tr.appendChild(td(reg.Insumos.Cal));
    tr.appendChild(td(reg.Insumos.Fluossilicato));
    tr.appendChild(td(reg.Lavagem.Hora));
    tr.appendChild(td(reg.Lavagem.Filtro1));
    tr.appendChild(td(reg.Lavagem.Filtro2));
    tr.appendChild(td(reg.Observacao));
    tr.appendChild(td(reg.Assinatura));

    const tdAcoes = document.createElement("td");
    tdAcoes.className = "acoes";
    tdAcoes.innerHTML = `
      <button onclick="editarRegistro('${nomeAba}', ${index})">✏️</button>
      <button onclick="deletarRegistro('${nomeAba}', ${index})">❌</button>`;
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  });
}

function editarRegistro(dia, index) {
  const registro = dadosPorDia[dia][index];
  if (!registro) return;

  document.getElementById("hf").value = registro.HF;
  document.getElementById("insumoSulfato").value = registro.Insumos.Sulfato;
  document.getElementById("insumoHipoclorito").value = registro.Insumos.Hipoclorito;
  document.getElementById("insumoCal").value = registro.Insumos.Cal;
  document.getElementById("insumoFluossilicato").value = registro.Insumos.Fluossilicato;
  document.getElementById("horaLavagem").value = registro.Lavagem.Hora;
  document.getElementById("filtro1Lavagem").value = registro.Lavagem.Filtro1;
  document.getElementById("filtro2Lavagem").value = registro.Lavagem.Filtro2;
  document.getElementById("observacao").value = registro.Observacao;
  document.getElementById("assinatura").value = registro.Assinatura;

  editandoRegistro = { dia, index };
  document.querySelector('button[type="submit"]').textContent = "Atualizar";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deletarRegistro(dia, index) {
  if (confirm("Deseja realmente excluir este registro?")) {
    dadosPorDia[dia].splice(index, 1);
    if (dadosPorDia[dia].length === 0) delete dadosPorDia[dia];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosPorDia));
    alert("Registro excluído com sucesso!");
    preencherDias();
    atualizarTabela(document.getElementById("selecionarDia").value);
  }
}

function exportarExcel() {
  const wb = XLSX.utils.book_new();
  const diasOrdenados = Object.keys(dadosPorDia).sort(
    (a, b) => parseInt(a.replace("Dia ", "")) - parseInt(b.replace("Dia ", ""))
  );

  for (const dia of diasOrdenados) {
    const registrosFormatados = dadosPorDia[dia].map((reg) => ({
      "Data": reg.Data,
      "Horário Funcionamento": reg.HF,
      "Sulfato": reg.Insumos.Sulfato,
      "Hipoclorito": reg.Insumos.Hipoclorito,
      "Cal": reg.Insumos.Cal,
      "Fluossilicato": reg.Insumos.Fluossilicato,
      "Hora da Lavagem": reg.Lavagem.Hora,
      "Filtro 1 - Lavagem": reg.Lavagem.Filtro1,
      "Filtro 2 - Lavagem": reg.Lavagem.Filtro2,
      "Observação": reg.Observacao,
      "Assinatura": reg.Assinatura,
    }));

    const ws = XLSX.utils.json_to_sheet(registrosFormatados);
    XLSX.utils.book_append_sheet(wb, ws, dia);
  }

  XLSX.writeFile(wb, "cadastro_ETA_mensal.xlsx");
}

function fazerLogout() {
  if (confirm("Deseja realmente sair?")) {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  }
}

