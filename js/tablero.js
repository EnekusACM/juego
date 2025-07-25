// Array de objetos disponibles para HeroQuest
const objetosDisponibles = [
  "Poción de curación",
  "Antorcha",
  "Llave oxidada",
  "Espada oxidada",
  "Escudo de madera",
  "Mapa antiguo",
  "Amuleto misterioso",
  "Pergamino de magia",
  "Botas veloces",
  "Cuerda resistente"
];
// Mostrar inventario en un grid visual
function mostrarInventario() {
  let inventarioDiv = document.getElementById("inventario");
  if (!inventarioDiv) {
    inventarioDiv = document.createElement("div");
    inventarioDiv.id = "inventario";
    inventarioDiv.style.marginTop = "10px";
    const logDiv = document.getElementById("logCombate");
    logDiv.parentNode.insertBefore(inventarioDiv, logDiv.nextSibling);
  }
  inventarioDiv.innerHTML = "<strong>Inventario:</strong>";
  if (!heroe.objetos || heroe.objetos.length === 0) {
    inventarioDiv.innerHTML += "<br><span style='color:#f66'>No tienes objetos.</span>";
    return;
  }
  // Determinar contexto: combate o mapa
  const esCombate = turno === "jugador" || turno === "enemigo";
  inventarioDiv.innerHTML += `<div class='inventario-grid'>${heroe.objetos.map((obj, i) => renderTarjetaInventario(obj, i, esCombate)).join("")}</div>`;
}

// Usar objeto desde el inventario visual
function usarObjetoInventario(idx) {
  if (turno !== null) {
    // Si está en combate, redirigir a función de combate
    usarObjetoCombate(idx);
    return;
  }
  const objeto = heroe.objetos[idx];
  if (objeto === "Poción de curación") {
    heroe.vida = Math.min(heroe.vidaMax || 10, heroe.vida + 5);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    logCombate(`Usas una ${objeto} y recuperas 5 puntos de vida.`);
    mostrarInventario();
  } else if (objeto === "Antorcha") {
    logCombate(`Enciendes una ${objeto} y iluminas el camino.`);
    // Encuentra uno de los objetos raros (probabilidad baja)
    const raros = ["Llave oxidada", "Amuleto misterioso", "Cuerda resistente"];
    const encontrado = raros[Math.floor(Math.random() * raros.length)];
    heroe.objetos.push(encontrado);
    logCombate(`Gracias a la ${objeto} puedes ver mejor a tu alrededor. ¡Encuentras un objeto raro: ${encontrado}!`);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    mostrarInventario();
  } else if (objeto === "Espada oxidada") {
    logCombate(`Solo usable en combate.`);
    logCombate(`Empuñas la ${objeto}, no es muy efectiva pero puede servir para lanzársela al enemigo. Seguro que algún daño harás.`);
  } else if (objeto === "Escudo de madera") {
    logCombate(`Solo usable en combate.`);
    logCombate(`Miras el ${objeto}, está algo deteriorado pero puede servir para protegerte de algún ataque. Sabes que se romperá fácilmente, pero puede ser útil en una pelea.`);
  } else if (objeto === "Botas veloces") {
    logCombate("Te pones las botas veloces y corres por la mazmorra... pero no hay peligro, solo haces ejercicio.");
    logCombate(`Te notas ligero, si las usas en combate tendrás la huída asegurada. Solo usable en combate.`);
  } else if (objeto === "Pergamino de magia") {
    logCombate("Lees el pergamino de magia. Se libera un espíritu, en agradecimiento te da una poción de curación y una antorcha.");
    heroe.objetos.push("Poción de curación");
    heroe.objetos.push("Antorcha");
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    mostrarInventario();
  } else if (objeto === "Amuleto misterioso") {
    logCombate("El amuleto brilla y te transporta mágicamente a la casilla de salida.");
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    heroPos = { row: 0, col: 0 }; // Casilla de salida
    drawBoard();
    actualizarStats();
    mostrarInventario();
  } else if (objeto === "Mapa antiguo") {
    logCombate("Usas el Mapa antiguo y revelas todas las trampas ocultas en el tablero.");
    for (let row = 0; row < boardData.length; row++) {
      for (let col = 0; col < boardData[row].length; col++) {
        if (boardData[row][col] === "T") {
          trampasDescubiertas[`${row},${col}`] = true;
        }
      }
    }
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    drawBoard();
    mostrarInventario();
  } else if (objeto === "Cuerda resistente") {
    // Desactivar la trampa más cercana al jugador
    const { row, col } = heroPos;
    let minDist = Infinity;
    let trampaCercana = null;
    for (let r = 0; r < boardData.length; r++) {
      for (let c = 0; c < boardData[r].length; c++) {
        if (boardData[r][c] === "T" && !trampasDescubiertas[`${r},${c}`]) {
          const dist = Math.abs(row - r) + Math.abs(col - c);
          if (dist < minDist) {
            minDist = dist;
            trampaCercana = { r, c };
          }
        }
      }
    }
    if (trampaCercana) {
      trampasDescubiertas[`${trampaCercana.r},${trampaCercana.c}`] = true;
      logCombate(`Usas la cuerda resistente y desactivas la trampa más cercana (${trampaCercana.r},${trampaCercana.c}). Ya no te afectará.`);
      heroe.objetos.splice(idx, 1);
      localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
      drawBoard();
      mostrarInventario();
    } else {
      logCombate("No hay trampas cercanas para desactivar.");
    }
  } else {
    logCombate(`El objeto \"${objeto}\" no es usable fuera de combate.`);
    mostrarInventario();
  }
}
// Acciones fuera de combate (mapa)
function accionMapa(accion) {
  if (turno !== null) {
    logCombate("No puedes realizar acciones de mapa durante el combate.");
    return;
  }
  if (accion === "descansar") {
    if (heroe.vida < 10) {
      heroe.vida = 10;
      localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
      actualizarStats();
      logCombate("Descansas y recuperas toda tu vida.");
    } else {
      logCombate("Ya tienes la vida al máximo.");
    }
  } else if (accion === "verInventario") {
    // Ya no hace falta mostrarInventario, siempre está visible
    logCombate("Inventario revisado.");
  } else {
    logCombate("Acción de mapa no reconocida.");
  }
  mostrarInventario(); // Actualiza inventario tras acción
}

// Usar objeto fuera de combate
function usarObjetoMapa() {
  if (!heroe.objetos || heroe.objetos.length === 0) {
    logCombate("No tienes objetos para usar.");
    return;
  }
  let listado = "Elige el número del objeto para usar:\n";
  heroe.objetos.forEach((obj, i) => {
    listado += `${i+1}) ${obj}\n`;
  });
  let opcion = prompt(listado);
  if (opcion === null || opcion.trim() === "" || opcion.trim() === "0" || opcion.trim() === "nada") {
    logCombate("No usaste ningún objeto.");
    return;
  }
  opcion = parseInt(opcion);
  if (isNaN(opcion) || opcion < 1 || opcion > heroe.objetos.length) {
    logCombate("Opción no válida.");
    return usarObjetoMapa();
  }
  const objeto = heroe.objetos[opcion - 1];
  if (objeto === "Poción de curación") {
    heroe.vida = Math.min(heroe.vidaMax || 10, heroe.vida + 5);
    heroe.objetos.splice(opcion - 1, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    logCombate(`Usas una ${objeto} y recuperas 5 puntos de vida.`);
  } else {
    logCombate(`El objeto \"${objeto}\" no es usable fuera de combate.`);
    return usarObjetoMapa();
  }
}

// Sugerencia de uso:
// Puedes consultar los objetos disponibles con: objetosDisponibles.forEach(obj => console.log(obj));

// Genera dinámicamente las recompensas de objetos a partir de objetosDisponibles con tres niveles de probabilidad
const recompensas = [
  // Objetos con probabilidad alta
  ...[ "Cuerda resistente","Mapa antiguo"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 1 })),
  // Objetos con probabilidad media
  ...["Botas veloces", "Pergamino de magia", "Mapa antiguo"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 0.3 })),
  // Objetos con probabilidad baja
  ...["Llave oxidada", "Amuleto misterioso", "Cuerda resistente"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 0.2 })),
  // Oro
  { tipo: "oro", cantidad: 10, probabilidad: 0.5 },
  { tipo: "oro", cantidad: 25, probabilidad: 0.2 }
];

const enemigos = {
  "G": { nombre: "Goblin", vida: 6, ataque: 2, ataqueMax: 2, defensaMax: 1 },
  "S": { nombre: "Esqueleto", vida: 8, ataque: 3, ataqueMax: 3, defensaMax: 3 },
  "O": { nombre: "Orco", vida: 12, ataque: 4, ataqueMax: 4, defensaMax: 3 },
};

const boardData = [
  ["S", "",  "",  "",  "E"],
  ["#", "#", "",  "#", "#"],
  ["",  "T",  "H", "G", "S"],
  ["#", "",  "",  "",  "#"],
  ["",  "#", "O", "#", ""]
];

let heroPos = { row: 2, col: 2 };
let heroe = null;  // Estado del héroe cargado
let enemigo = null; // Estado del enemigo actual
let turno = null;   // "jugador" o "enemigo"
const trampasDescubiertas = {};

// DOM referencias (se inicializan en init)
let logDiv, accionesDiv;

function init() {
  logDiv = document.getElementById("logCombate");
  accionesDiv = document.getElementById("accionesCombate");

  // Cargar héroe de localStorage
  heroe = JSON.parse(localStorage.getItem("estadoHeroe"));
  if (!heroe) {
    alert("No se encontró el héroe. Por favor inicia desde la selección.");
    window.location.href = "index.html";
  }

  drawBoard();
  actualizarStats();
  bindKeyboard();
  ocultarAcciones();
  mostrarAccionesMapa();
  mostrarInventario(); // Inventario siempre visible
}

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let row = 0; row < boardData.length; row++) {
    for (let col = 0; col < boardData[row].length; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");

      const value = boardData[row][col];
      // Trampa
      if (value === "T") {
        const key = `${row},${col}`;
        if (trampasDescubiertas[key]) {
          cell.style.background = "#a00"; // Trampa descubierta (rojo)
        } // Si no, color normal
      }
      if (row === heroPos.row && col === heroPos.col) {
        cell.classList.add("hero");
        cell.textContent = "🧙";
      } else if (value === "#") {
        cell.classList.add("wall");
      } else if (value === "S") {
        cell.classList.add("start");
      } else if (value === "E") {
        cell.classList.add("end");
      } else if (enemigos[value]) {
        cell.textContent = "👹";
      }
      board.appendChild(cell);
    }
  }
}

function actualizarStats() {
  const heroStats = document.getElementById("heroStats");
  heroStats.innerHTML = `
    <strong>${heroe.nombre} el ${heroe.clase}</strong><br>
    Vida: ${heroe.vida} / ${heroe.vidaMax || 10}<br>
    Ataque máximo: ${heroe.ataqueMax || 4}<br>
    Defensa máxima: ${heroe.defensaMax || 2}<br>
    Habilidad especial: ${heroe.habilidad || "-"}<br>
    Objetos: ${heroe.objetos.join(", ") || "Ninguno"}<br>
    Oro: ${heroe.oro || 0}
  `;
}

function logCombate(mensaje) {
  if (!logDiv) return;
  logDiv.innerHTML += mensaje + "<br>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

function mover(direction) {
  if (turno === null) { // Solo se puede mover si no está en combate activo
    const { row, col } = heroPos;
    let newRow = row, newCol = col;
    switch (direction) {
      case "up":    newRow--; break;
      case "down":  newRow++; break;
      case "left":  newCol--; break;
      case "right": newCol++; break;
    }
    if (
      newRow >= 0 && newRow < boardData.length &&
      newCol >= 0 && newCol < boardData[0].length &&
      boardData[newRow][newCol] !== "#"
    ) {
      const anterior = { ...heroPos };
      heroPos = { row: newRow, col: newCol };
      drawBoard();
      const casilla = boardData[newRow][newCol];
      if (casilla === "T") {
        const key = `${newRow},${newCol}`;
        if (!trampasDescubiertas[key]) {
          // Trampa no descubierta
          if (heroe.clase === "Enano") {
            heroe.vida -= Math.ceil(7 / 2);
          } else {
            heroe.vida -= 7;
          }
          logCombate("¡Has caído en una trampa! Pierdes 7 puntos de vida.");
          actualizarStats();
          if (heroe.vida <= 0) {
            alert("Has muerto por una trampa... Game Over.");
            window.location.href = "index.html";
            return;
          }
        } else {
          logCombate("Esta trampa ya está desactivada o descubierta, no te afecta.");
        }
      } else if (enemigos[casilla]) {
        localStorage.setItem("casillaAnterior", JSON.stringify(anterior));
        iniciarCombate(casilla);
      } else if (casilla === "E") {
        alert("¡Has llegado al final de la mazmorra!");
      }
    }
  } else {
    logCombate("No puedes moverte durante el combate.");
  }
}

function iniciarCombate(tipoEnemigo) {
  const enemigoBase = enemigos[tipoEnemigo];
  enemigo = {
    nombre: enemigoBase.nombre,
    vida: enemigoBase.vida,
    ataque: enemigoBase.ataque,
    ataqueMax: enemigoBase.ataqueMax,
    defensaMax: enemigoBase.defensaMax
  };
  turno = "jugador";
  logDiv.innerHTML = ""; // limpiar log
  logCombate(`¡Un ${enemigo.nombre} salvaje aparece!`);
  logCombate(`Observas a tu enemigo: Tiene ${enemigo.vida} de vida, Calculas que cada golpe puede hacerte ${enemigo.ataque} de daño`);
  mostrarAcciones();
  ocultarAccionesMapa();
  mostrarInventario(); // Actualiza inventario en combate

  // Mostrar botón de habilidad especial si está disponible
  const habilidadDiv = document.getElementById("habilidadEspecial");
  if (habilidadDiv) habilidadDiv.remove();
  const accionesDiv = document.getElementById("accionesCombate");
  if (accionesDiv) {
    const hero = heroe;
    let btn = null;
    if (hero.clase === "Guerrero" && hero.golpePoderosoDisponible) {
      btn = document.createElement("button");
      btn.id = "habilidadEspecial";
      btn.textContent = "Golpe poderoso";
      btn.onclick = function() {
        enemigo.vida -= 5;
        logCombate("¡Usas Golpe poderoso! Infliges 5 de daño garantizado.");
        hero.golpePoderosoDisponible = false;
        localStorage.setItem("estadoHeroe", JSON.stringify(hero));
        if (enemigo.vida <= 0) {
          logCombate(`¡Has derrotado al ${enemigo.nombre}!`);
          eliminarMonstruo();
          generarRecompensa(hero);
          localStorage.setItem("estadoHeroe", JSON.stringify(hero));
          ocultarAcciones();
          turno = null;
          actualizarStats();
          mostrarAccionesMapa();
          mostrarInventario();
          return;
        }
        turno = "enemigo";
        mostrarAcciones();
        setTimeout(turnoEnemigo, 500);
      };
    } else if (hero.clase === "Elfo" && hero.renacerDisponible) {
      // Elfo revive automáticamente, no botón
    } else if (hero.clase === "Mago" && hero.escudoMagicoDisponible) {
      btn = document.createElement("button");
      btn.id = "habilidadEspecial";
      btn.textContent = "Escudo mágico";
      btn.onclick = function() {
        hero.escudoMagicoActivo = true;
        hero.escudoMagicoDisponible = false;
        logCombate("¡Usas Escudo mágico! El siguiente ataque enemigo no te afectará y los enemigos tienen mitad de probabilidad de fallar el resto del combate.");
        localStorage.setItem("estadoHeroe", JSON.stringify(hero));
        turno = "enemigo";
        mostrarAcciones();
        setTimeout(turnoEnemigo, 500);
      };
    }
    if (btn) accionesDiv.appendChild(btn);
  }
}

function accionCombate(opcion) {
  if (turno !== "jugador") return;

  if (opcion === "atacar") {
    const danoBase = Math.floor(Math.random() * (heroe.ataqueMax)) + 1;
    const defensaEnemigo = Math.floor(Math.random() * (enemigo.defensaMax + 1));
    const dano = Math.max(0, danoBase - defensaEnemigo);
    enemigo.vida -= dano;
    logCombate(`🧙 Atacas al ${enemigo.nombre} (Ataque: ${danoBase}) | Defensa enemiga: ${defensaEnemigo} | Daño infligido: ${dano}`);
    logCombate(`Vida restante del ${enemigo.nombre}: ${Math.max(0, enemigo.vida)}`);
    if (enemigo.vida <= 0) {
      logCombate(`¡Has derrotado al ${enemigo.nombre}!`);
      eliminarMonstruo();
      generarRecompensa(heroe);
      localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
      ocultarAcciones();
      turno = null;
      actualizarStats();
      ocultarInventarioCombate();
      mostrarAccionesMapa();
      mostrarInventario();
      return;
    }
    turno = "enemigo";
    setTimeout(turnoEnemigo, 1000);

  } else if (opcion === "usar") {
    usarObjeto();
    mostrarInventario();
  } else if (opcion === "huir") {
    // Probabilidad de éxito al huir (por ejemplo, 60%)
    if (Math.random() < 0.1) {
      logCombate("¡Huyes del combate y regresas a la casilla anterior! Ves que el enemigo no te persigue. Se cura sus heridas.");
      moverAtras();
      ocultarAcciones();
      turno = null;
      mostrarAccionesMapa();
    } else {
      logCombate("¡Intentas huir pero el enemigo te bloquea! Pierdes el turno.");
      turno = "enemigo";
      setTimeout(turnoEnemigo, 1000);
    }
  } else {
    logCombate("Opción no válida.");
  }
}

function mostrarAcciones() {
  if (!accionesDiv) return;
  accionesDiv.style.display = "block";
}

function ocultarAcciones() {
  if (!accionesDiv) return;
  accionesDiv.style.display = "none";
}

function mostrarAccionesMapa() {
  const accionesMapaDiv = document.getElementById("accionesMapa");
  if (accionesMapaDiv) accionesMapaDiv.style.display = "block";
}

function ocultarAccionesMapa() {
  const accionesMapaDiv = document.getElementById("accionesMapa");
  if (accionesMapaDiv) accionesMapaDiv.style.display = "none";
}

function usarObjeto() {
  // El botón de combate ahora solo actualiza el inventario, que siempre está visible
  mostrarInventario();
}

// Inventario visual en combate
function mostrarInventarioCombate() {
  let inventarioDiv = document.getElementById("inventarioCombate");
  if (!inventarioDiv) {
    inventarioDiv = document.createElement("div");
    inventarioDiv.id = "inventarioCombate";
    inventarioDiv.style.marginTop = "10px";
    const logDiv = document.getElementById("logCombate");
    logDiv.parentNode.insertBefore(inventarioDiv, logDiv.nextSibling);
  }
  inventarioDiv.innerHTML = "<strong>Inventario (modo combate):</strong>";
  if (!heroe.objetos || heroe.objetos.length === 0) {
    inventarioDiv.innerHTML += "<br><span style='color:#f66'>No tienes objetos.</span>";
    return;
  }
  inventarioDiv.innerHTML += `<div class='inventario-grid'>${heroe.objetos.map((obj, i) => renderTarjetaInventario(obj, i, true)).join("")}</div>`;
}

// Descripciones de objetos
const descripcionesObjetos = {
  "Poción de curación": "Recupera 5 puntos de vida al usarla.",
  "Antorcha": "Ilumina el entorno. En combate, deslumbra al enemigo y evita su ataque.",
  "Llave oxidada": "Permite abrir puertas bloqueadas.",
  "Espada oxidada": "En combate, inflige 3 puntos de daño al enemigo.",
  "Escudo de madera": "En combate, puede bloquear un ataque enemigo.",
  "Mapa antiguo": "Puede revelar zonas ocultas del tablero.",
  "Amuleto misterioso": "Su efecto es desconocido...", 
  "Pergamino de magia": "Permite lanzar un hechizo especial.",
  "Botas veloces": "Permiten moverse dos casillas en un turno.",
  "Cuerda resistente": "Útil para sortear obstáculos o trampas."
};

// Renderiza una tarjeta visual para el inventario
function renderTarjetaInventario(obj, i, esCombate) {
  const descripcion = descripcionesObjetos[obj] || "Sin descripción.";
  const usarFn = esCombate ? `usarObjetoCombate(${i})` : `usarObjetoInventario(${i})`;
  return `
    <div class='item'>
      <div class='titulo'>${obj}</div>
      <div class='desc'>${descripcion}</div>
      <button onclick='${usarFn}'>Usar</button>
    </div>
  `;
}


// Usar objeto desde el inventario visual en combate
function usarObjetoCombate(idx) {
  if (turno === null) {
    // Si no está en combate, redirigir a función de inventario normal
    usarObjetoInventario(idx);
    return;
  }
  const objeto = heroe.objetos[idx];
  if (objeto === "Poción de curación") {
    heroe.vida = Math.min(heroe.vidaMax || 10, heroe.vida + 5);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    logCombate(`Usas una ${objeto} y recuperas 5 puntos de vida.`);
    turno = "enemigo";
    mostrarInventario();
    setTimeout(turnoEnemigo, 500);
  } else if (objeto === "Antorcha") {
    logCombate(`Usas una ${objeto}, el enemigo queda deslumbrado. No puede atacar este turno.`);
    enemigo.ataque = 0;
    setTimeout(() => {
        enemigo.ataque = enemigos[enemigo.nombre].ataque;
    }, 2000);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    mostrarInventario();
  } else if (objeto === "Llave oxidada") {
    logCombate(`Usas la ${objeto} para abrir una puerta cercana. ¡Puedes avanzar!`);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    mostrarInventario();
  } else if (objeto === "Espada oxidada") {
    logCombate(`Usas la ${objeto} para atacar al enemigo. ¡Infliges 3 puntos de daño!`);
    enemigo.vida -= 3;
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    if (enemigo.vida <= 0) {
        logCombate(`¡Has derrotado al ${enemigo.nombre}!`);
        eliminarMonstruo();
        generarRecompensa(heroe);
        localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
        ocultarAcciones();
        turno = null;
        actualizarStats();
        mostrarAccionesMapa();
        mostrarInventario();
        return;
    }
    mostrarInventario();
    turno = "enemigo";
    setTimeout(turnoEnemigo, 500);
  } else if (objeto === "Escudo de madera") {
    logCombate(`Usas el ${objeto} y te preparas para bloquear el próximo ataque enemigo.`);
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    heroe.bloqueoActivo = true;
    mostrarInventario();
    turno = "enemigo";
    setTimeout(turnoEnemigo, 500);
  } else if (objeto === "Botas veloces") {
    logCombate("¡Usas las botas veloces y huyes del combate a toda velocidad!");
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    moverAtras();
    ocultarAcciones();
    turno = null;
    mostrarAccionesMapa();
    mostrarInventario();
  } else if (objeto === "Pergamino de magia") {
    logCombate("¡Recitas el pergamino de magia y el enemigo es destruido instantáneamente!");
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    logCombate(`¡Has derrotado al ${enemigo.nombre} con magia!`);
    eliminarMonstruo();
    generarRecompensa(heroe);
    ocultarAcciones();
    turno = null;
    actualizarStats();
    mostrarAccionesMapa();
    mostrarInventario();
  } else if (objeto === "Amuleto misterioso") {
    logCombate("El amuleto brilla y te transporta mágicamente a la casilla de salida. Ya no estás en combate.");
    heroe.objetos.splice(idx, 1);
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    heroPos = { row: 0, col: 0 }; // Casilla de salida
    drawBoard();
    actualizarStats();
    mostrarInventario();
    if (turno !== null) {
      ocultarAcciones();
      turno = null;
      mostrarAccionesMapa();
    }
  } else {
    logCombate(`El objeto \"${objeto}\" no es usable en combate.`);
    mostrarInventario();
  }
}

function ocultarInventarioCombate() {
  const inventarioDiv = document.getElementById("inventarioCombate");
  if (inventarioDiv) inventarioDiv.remove();
}


function addLog(text) {
  const log = document.getElementById("logCombate");
  log.innerHTML += text + "\n";
  log.scrollTop = log.scrollHeight;
}

function turnoEnemigo() {
  let danoBase = Math.floor(Math.random() * enemigo.ataqueMax) + 1;
  const defensaHeroe = Math.floor(Math.random() * (heroe.defensaMax + 1));
  let dano = Math.max(0, danoBase - defensaHeroe);

  // Mago: escudo mágico activo
  if (heroe.clase === "Mago" && heroe.escudoMagicoActivo) {
    logCombate("🛡️ El escudo mágico te protege. No recibes daño.");
    dano = 0;
    heroe.escudoMagicoActivo = false;
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
  } else if (heroe.clase === "Mago" && !heroe.escudoMagicoActivo && !heroe.escudoMagicoDisponible) {
    // Enemigos tienen mitad de probabilidad de fallar
    if (Math.random() < 0.5) {
      logCombate("👹 El enemigo falla su ataque por el efecto del escudo mágico.");
      dano = 0;
    }
  }

  heroe.vida -= dano;
  logCombate(`👹 ${enemigo.nombre} ataca (Ataque: ${danoBase}) | Defensa del héroe: ${defensaHeroe} | Daño recibido: ${dano}`);
  logCombate(`Vida restante del héroe: ${Math.max(0, heroe.vida)}`);
  actualizarStats();

  // Elfo: renacer si vida <= 0 y disponible
  if (heroe.clase === "Elfo" && heroe.vida <= 0 && heroe.renacerDisponible) {
    heroe.vida = heroe.vidaMax;
    heroe.renacerDisponible = false;
    logCombate("🌟 El Elfo renace y recupera toda su vida!");
    actualizarStats();
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
  }

  if (heroe.vida <= 0) {
    alert("Has caído en combate... Game Over.");
    window.location.href = "index.html";
    return;
  }

  turno = "jugador";
}

function eliminarMonstruo() {
  const { row, col } = heroPos;
  boardData[row][col] = "";
  drawBoard();
  mostrarInventario(); // Actualiza inventario tras eliminar monstruo
}

function generarRecompensa(hero) {
  let recompensasObtenidas = [];

  recompensas.forEach(reward => {
    if (Math.random() < reward.probabilidad) {
      if (reward.tipo === "objeto") {
        hero.objetos.push(reward.nombre);
        recompensasObtenidas.push(reward.nombre);
      } else if (reward.tipo === "oro") {
        if (!hero.oro) hero.oro = 0;
        hero.oro += reward.cantidad;
        recompensasObtenidas.push(`${reward.cantidad} monedas de oro`);
      }
    }
  });

  if (recompensasObtenidas.length > 0) {
    logCombate(`¡Has encontrado: ${recompensasObtenidas.join(", ")}!`);
  } else {
    logCombate("No encontraste nada esta vez...");
  }
  actualizarStats();
  mostrarInventario(); // Actualiza inventario tras recompensa
}

function moverAtras() {
  const anterior = JSON.parse(localStorage.getItem("casillaAnterior"));
  if (anterior) {
    heroPos = anterior;
    drawBoard();
  }
}

// Control con flechas teclado
function bindKeyboard() {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp": e.preventDefault(); mover("up"); break;
      case "ArrowDown": e.preventDefault(); mover("down"); break;
      case "ArrowLeft": e.preventDefault(); mover("left"); break;
      case "ArrowRight": e.preventDefault(); mover("right"); break;
    }
  });
}

init();
