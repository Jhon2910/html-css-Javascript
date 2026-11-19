const feedback = document.getElementById("feedback");
let requestInProgress = false;
let currentQuote = null;

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = "feedback";
  if (type) {
    feedback.classList.add(type);
  }
  feedback.hidden = false;
}

async function request(url, data, message) {
  if (requestInProgress) {
    return null;
  }

  requestInProgress = true;
  const buttons = document.querySelectorAll("button");
  buttons.forEach(button => button.disabled = true);
  showFeedback(message, "loading");

  const options = { cache: "no-store" };
  if (data) {
    options.method = "POST";
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.erro || "Não foi possível concluir a operação.");
    }
    return result;
  } catch (error) {
    showFeedback(error.message || "Falha de comunicação com o servidor.", "error");
    return null;
  } finally {
    requestInProgress = false;
    buttons.forEach(button => button.disabled = false);
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatMoney(cents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

function minutesSince(entry, now) {
  return Math.max(0, Math.floor((now - new Date(entry).getTime()) / 60000));
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return rest + " min";
  }
  return hours + "h " + String(rest).padStart(2, "0") + "min";
}

async function updateAvailability(showMessage = true) {
  const data = await request("/api/vagas", null, "Atualizando vagas...");
  if (!data) {
    return;
  }

  document.getElementById("available-spaces").textContent = data.disponiveis;
  document.getElementById("current-datetime").textContent =
    "Servidor · " + formatDate(data.agora);

  if (showMessage) {
    const word = data.disponiveis === 1 ? "vaga disponível" : "vagas disponíveis";
    showFeedback(data.disponiveis + " " + word + ".");
  }
}

const refreshButton = document.getElementById("refresh-spaces");
if (refreshButton) {
  refreshButton.addEventListener("click", () => updateAvailability());
  updateAvailability();

  document.getElementById("entry-form").addEventListener("submit", async event => {
    event.preventDefault();
    const model = document.getElementById("model").value;
    const plate = document.getElementById("plate").value;
    const data = await request(
      "/api/entradas",
      { modelo: model, placa: plate },
      "Registrando entrada..."
    );
    if (!data) {
      return;
    }

    document.getElementById("entry-form").reset();
    await updateAvailability(false);
    showFeedback("Entrada de " + data.placa + " registrada às " + formatDate(data.entrada) + ".");
  });
}

const lookupForm = document.getElementById("lookup-form");
if (lookupForm) {
  let vehicles = [];
  const quote = document.getElementById("quote");

  function renderVehicles() {
    const now = Date.now();
    const sortedVehicles = vehicles.slice();
    sortedVehicles.sort((first, second) =>
      minutesSince(second.entrada, now) - minutesSince(first.entrada, now)
    );

    const list = document.getElementById("vehicle-list");
    document.getElementById("vehicle-count").textContent = sortedVehicles.length;
    list.innerHTML = "";

    if (sortedVehicles.length === 0) {
      list.innerHTML = '<tr><td class="empty-state" colspan="4">Nenhum veículo estacionado no momento.</td></tr>';
      return;
    }

    sortedVehicles.forEach(vehicle => {
      const row = document.createElement("tr");
      const values = [
        vehicle.modelo,
        vehicle.placa,
        formatDate(vehicle.entrada),
        formatDuration(minutesSince(vehicle.entrada, now))
      ];

      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      list.appendChild(row);
    });
  }

  async function updateVehicles(showMessage = true) {
    const data = await request("/api/veiculos", null, "Atualizando veículos...");
    if (!data) {
      return;
    }

    vehicles = data.veiculos;
    renderVehicles();
    if (showMessage) {
      const word = vehicles.length === 1 ? "veículo estacionado" : "veículos estacionados";
      showFeedback(vehicles.length + " " + word + ".");
    }
  }

  function showQuote(data) {
    currentQuote = data;
    document.getElementById("quote-model").textContent = data.modelo;
    document.getElementById("quote-plate").textContent = data.placa;
    document.getElementById("quote-entry").textContent = formatDate(data.entrada);
    document.getElementById("quote-duration").textContent =
      formatDuration(data.permanenciaMinutos);
    document.getElementById("quote-amount").textContent = formatMoney(data.valorCentavos);
    quote.hidden = false;
  }

  lookupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const plate = document.getElementById("exit-plate").value.trim();
    quote.hidden = true;
    currentQuote = null;

    const data = await request(
      "/api/saida?placa=" + encodeURIComponent(plate),
      null,
      "Consultando veículo e valor..."
    );
    if (data) {
      showQuote(data);
    }
  });

  document.getElementById("confirm-exit").addEventListener("click", async () => {
    if (!currentQuote) {
      return;
    }

    const data = await request(
      "/api/saidas",
      { placa: currentQuote.placa },
      "Registrando saída..."
    );
    if (!data) {
      return;
    }

    currentQuote = null;
    quote.hidden = true;
    lookupForm.reset();
    await updateVehicles(false);
    showFeedback("Saída de " + data.placa + " registrada. Total: " + formatMoney(data.valorCentavos) + ".");
  });

  updateVehicles();
  setInterval(renderVehicles, 60000);
}
