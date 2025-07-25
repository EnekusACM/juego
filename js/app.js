function startNewAdventure() {
    // Redirigir a la pantalla de selección de héroes
    window.location.href = "heroes.html";
}

function continueGame() {
  alert("Continuar aún no implementado.");
}

function showCredits() {
  document.querySelector('.menu').classList.add('hidden');
  document.getElementById('credits').classList.remove('hidden');
}

function hideCredits() {
  document.getElementById('credits').classList.add('hidden');
  document.querySelector('.menu').classList.remove('hidden');
}

function selectHero(radio) {
  const nameInput = document.getElementById("heroName");
  nameInput.disabled = false;
  nameInput.placeholder = `Nombre del ${radio.value}`;
  checkStartButton();
}

const heroNameInput = document.getElementById("heroName");
if (heroNameInput) {
  heroNameInput.addEventListener("input", checkStartButton);
}
function checkStartButton() {
  const selected = document.querySelector('input[name="hero"]:checked');
  const name = document.getElementById("heroName").value.trim();
  document.getElementById("startButton").disabled = !selected || name === "";
}

function startMission() {
  const selected = document.querySelector('input[name="hero"]:checked');
  const name = document.getElementById("heroName").value.trim();

  if (!selected || name === "") {
    alert("Debes seleccionar un héroe y escribir su nombre.");
    return false;
  }

  const hero = {
    clase: selected.value,
    nombre: name
  };

localStorage.setItem("heroeSeleccionado", JSON.stringify(hero));
window.location.href = "narrativa.html";

  // Redirección a narrativa/misión futura
  return false;
}


// Mostrar narrativa en narrativa.html
if (window.location.pathname.endsWith("narrativa.html")) {
  const data = localStorage.getItem("heroeSeleccionado");
  const intro = document.getElementById("introText");

  if (data && intro) {
    const { clase, nombre } = JSON.parse(data);
    intro.innerHTML = `
      En los reinos antiguos, donde la oscuridad se cierne sobre las tierras olvidadas, 
      un héroe solitario se alza con valentía.<br><br>
      <strong>${nombre}</strong>, el valiente <strong>${clase}</strong>, ha sido convocado 
      por el Rey para adentrarse en las profundidades de una antigua mazmorra 
      donde se ocultan horrores y secretos prohibidos.<br><br>
      La misión: recuperar el Amuleto de Fuego antes de que caiga en manos del caos.
    `;
  }
}

function startGame() {
  alert("Aquí comenzaría la misión real.");
window.location.href = "juego.html";
}


// Pantalla de juego: carga de héroe e interacción
if (window.location.pathname.endsWith("juego.html")) {
  const heroData = localStorage.getItem("heroeSeleccionado");
  const heroStats = document.getElementById("heroStats");
  const gameText = document.getElementById("gameText");

  if (heroData && heroStats && gameText) {
    const { clase, nombre } = JSON.parse(heroData);

    // Inicializar estadísticas según clase
    let hero;
    if (clase === "Guerrero") {
      hero = {
        nombre,
        clase,
        vida: 10,
        vidaMax: 10,
        ataqueMax: 5,
        defensaMax: 2,
        habilidad: "Golpe poderoso",
        golpePoderosoDisponible: true,
        habilidadUsada: false,
        objetos: ["Poción de curación", "Antorcha"],
      };
    } else if (clase === "Enano") {
      hero = {
        nombre,
        clase,
        vida: 8,
        vidaMax: 8,
        ataqueMax: 4,
        defensaMax: 3,
        habilidad: "Resistencia a trampas",
        objetos: ["Poción de curación", "Antorcha"],
      };
    } else if (clase === "Elfo") {
      hero = {
        nombre,
        clase,
        vida: 6,
        vidaMax: 6,
        ataqueMax: 5,
        defensaMax: 3,
        habilidad: "Renacer",
        renacerDisponible: true,
        objetos: ["Poción de curación", "Antorcha"],
      };
    } else if (clase === "Mago") {
      hero = {
        nombre,
        clase,
        vida: 4,
        vidaMax: 4,
        ataqueMax: 6,
        defensaMax: 3,
        habilidad: "Escudo mágico",
        escudoMagicoDisponible: true,
        escudoMagicoActivo: false,
        objetos: ["Poción de curación", "Antorcha"],
      };
    }

    localStorage.setItem("estadoHeroe", JSON.stringify(hero));

    renderStats(hero);
    gameText.innerHTML = `<p>${nombre}, estás en una cripta antigua. Hay olor a humedad y escuchas pasos lejanos...</p>`;
  }
}

function renderStats(hero) {
  const heroStats = document.getElementById("heroStats");
  heroStats.innerHTML = `
    <strong>${hero.nombre} el ${hero.clase}</strong><br>
    Vida: ${hero.vida} / ${hero.vidaMax}<br>
    Ataque máximo: ${hero.ataqueMax}<br>
    Defensa máxima: ${hero.defensaMax}<br>
    Habilidad especial: ${hero.habilidad}<br>
    Objetos: ${hero.objetos.join(", ") || "Ninguno"}<br>
    Oro: ${hero.oro || 0}
  `;
}

function explore() {
  const gameText = document.getElementById("gameText");
  gameText.innerHTML = `<p>Exploras la habitación... encuentras una puerta cerrada al norte y una palanca oxidada en la pared.</p>`;
}
function exploreMap() {
  window.location.href = "./tablero.html";
}

function useItem() {
  const hero = JSON.parse(localStorage.getItem("estadoHeroe"));
  const gameText = document.getElementById("gameText");

  if (hero.objetos.includes("Poción de curación")) {
    hero.vida = Math.min(hero.vida + 5, 10);
    hero.objetos = hero.objetos.filter(obj => obj !== "Poción de curación");
    localStorage.setItem("estadoHeroe", JSON.stringify(hero));
    renderStats(hero);
    gameText.innerHTML = `<p>Usas una poción de curación. Tu vida se restaura a ${hero.vida}.</p>`;
  } else {
    gameText.innerHTML = `<p>No tienes objetos utilizables.</p>`;
  }
}

function showStatus() {
  const hero = JSON.parse(localStorage.getItem("estadoHeroe"));
  const gameText = document.getElementById("gameText");
  gameText.innerHTML = `<p>Estado actual:<br>Vida: ${hero.vida}<br>Objetos: ${hero.objetos.join(", ")}</p>`;
}

function exitGame() {
  alert("Gracias por jugar esta demo narrativa de HeroQuest.");
  window.location.href = "index.html";
}
