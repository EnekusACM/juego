// Datos de ejemplo para los lugareños y sus diálogos ampliados
const lugarenos = [
  {
    nombre: "Posadero",
    dialogos: [
      "¡Bienvenido a la posada, viajero! ¿Deseas descansar?",
      "Dicen que en la mazmorra hay un amuleto muy valioso.",
      "¡Cuídate de los goblins si sales del pueblo!"
    ]
  },
  {
    nombre: "Herrero",
    dialogos: [
      "¿Buscas mejorar tu equipo? Puedo forjar armas y armaduras.",
      "Las trampas de la mazmorra son letales, lleva una cuerda.",
      "Si encuentras mineral, tráemelo y te haré algo especial."
    ]
  },
  {
    nombre: "Anciana",
    dialogos: [
      "He vivido aquí toda mi vida. La mazmorra es peligrosa.",
      "Mi nieto desapareció hace días... ¿lo ayudarás?",
      "Las leyendas hablan de un héroe que salvará el pueblo."
    ]
  },
  {
    nombre: "Mercader",
    dialogos: [
      "¡Bienvenido a mi tienda! Tengo objetos raros y útiles.",
      "¿Te interesa comprar una poción o una cuerda resistente?",
      "Vuelve cuando quieras, siempre hay algo nuevo."
    ]
  },
  {
    nombre: "Niño",
    dialogos: [
      "¿Has visto a mi perro? Se perdió cerca del pozo.",
      "Dicen que hay un tesoro escondido en el bosque.",
      "¡Quiero ser aventurero como tú algún día!"
    ]
  },
  {
    nombre: "Guardia",
    dialogos: [
      "No salgas del pueblo sin estar preparado.",
      "La seguridad es lo más importante. ¡Mantente alerta!",
      "Si ves algo sospechoso, avísame."
    ]
  },
  {
    nombre: "Pozo",
    dialogos: [
      "El pozo es profundo y oscuro. ¿Te atreves a mirar dentro?",
      "Escuchas un eco extraño desde el fondo.",
      "Quizá puedas lanzar una cuerda para explorar."
    ]
  },
  {
    nombre: "Estatua",
    dialogos: [
      "La estatua representa a un antiguo héroe del pueblo.",
      "Parece que sus ojos te siguen al pasar.",
      "Hay una inscripción: 'El valor abre todos los caminos'."
    ]
  }
];

// Estado del diálogo
let dialogoActual = null;
let indiceDialogo = 0;

// Referencias DOM
const dialogoTexto = document.getElementById("dialogoTexto");
const dialogoOpciones = document.getElementById("dialogoOpciones");
const heroStats = document.getElementById("heroStats");
const inventarioDiv = document.getElementById("inventario");

// Cargar héroe desde localStorage o valores por defecto
let heroe = (() => {
  let base = null;
  // 1. Intenta cargar el estado completo
  const guardado = localStorage.getItem("estadoHeroe");
  if (guardado) {
    base = JSON.parse(guardado);
  } else {
    // 2. Si no existe, intenta crear desde heroeSeleccionado
    const seleccionado = localStorage.getItem("heroeSeleccionado");
    if (seleccionado) {
      const { clase, nombre } = JSON.parse(seleccionado);
      // Crea el objeto completo según la clase
      if (clase === "Guerrero") {
        base = {
          nombre, clase, vida: 10, vidaMax: 10, ataqueMax: 5, defensaMax: 2,
          habilidad: "Golpe poderoso", golpePoderosoDisponible: true, habilidadUsada: false,
          objetos: ["Poción de curación", "Antorcha"], oro: 0
        };
      } else if (clase === "Enano") {
        base = {
          nombre, clase, vida: 8, vidaMax: 8, ataqueMax: 4, defensaMax: 3,
          habilidad: "Resistencia a trampas", objetos: ["Poción de curación", "Antorcha"], oro: 0
        };
      } else if (clase === "Elfo") {
        base = {
          nombre, clase, vida: 6, vidaMax: 6, ataqueMax: 5, defensaMax: 3,
          habilidad: "Renacer", renacerDisponible: true, objetos: ["Poción de curación", "Antorcha"], oro: 0
        };
      } else if (clase === "Mago") {
        base = {
          nombre, clase, vida: 4, vidaMax: 4, ataqueMax: 6, defensaMax: 3,
          habilidad: "Escudo mágico", escudoMagicoDisponible: true, escudoMagicoActivo: false,
          objetos: ["Poción de curación", "Antorcha"], oro: 0
        };
      }
      localStorage.setItem("estadoHeroe", JSON.stringify(base));
    }
  }
  // 3. Si por alguna razón no hay objetos, inicializa
  if (!base) {
    base = {
      nombre: "Arthos", clase: "Guerrero", vida: 10, vidaMax: 10, ataqueMax: 4, defensaMax: 2,
      habilidad: "Golpe poderoso", objetos: ["Poción de curación", "Antorcha"], oro: 0
    };
    localStorage.setItem("estadoHeroe", JSON.stringify(base));
  }
  // 4. Asegura que siempre haya objetos y oro
  if (!Array.isArray(base.objetos)) base.objetos = [];
  if (typeof base.oro !== "number") base.oro = 0;
  return base;
})();

// --- MAPA DEL PUEBLO 10x10 ---
const puebloData = [
  ["", "", "", "", "H", "", "", "", "M", ""],
  ["", "#", "#", "", "", "", "#", "#", "", ""],
  ["A", "", "", "", "E", "", "", "", "S", ""],
  ["", "#", "", "#", "", "#", "", "#", "", ""],
  ["", "", "", "N", "P", "", "", "", "", ""],
  ["", "#", "", "#", "", "#", "", "#", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "#", "#", "", "", "", "#", "#", "", ""],
  ["", "", "", "", "G", "", "", "Z", "", ""],
  ["", "", "", "", "W", "", "", "", "", ""]
];
// Leyenda: H=Herrero, P=Posadero, A=Anciana, S=Salida, E=Entrada, #=muro
// M=Mercader, N=Niño, G=Guardia, W=Pozo, Z=Estatua

let puebloPos = { row: 2, col: 4 }; // Posición inicial (en la entrada)

// Renderiza el mapa del pueblo (ajustado a 10x10)
function drawPueblo() {
  const filas = puebloData.length;
  const columnas = puebloData[0].length;
  let html = `<div id="board" style="
    display: grid;
    grid-template-columns: repeat(${columnas}, 40px);
    grid-template-rows: repeat(${filas}, 40px);
    gap: 3px;
    margin-bottom: 15px;
    justify-content: center;
  ">`;
  for (let row = 0; row < filas; row++) {
    for (let col = 0; col < columnas; col++) {
      let cellClass = "cell";
      let content = "";
      const value = puebloData[row][col];
      if (row === puebloPos.row && col === puebloPos.col) {
        cellClass += " hero";
        content = "🧙";
      } else if (value === "#") {
        cellClass += " wall";
      } else if (value === "H") {
        content = "⚒️";
      } else if (value === "P") {
        content = "🍺";
      } else if (value === "A") {
        content = "👵";
      } else if (value === "S") {
        content = "🚪";
      } else if (value === "E") {
        content = "🏠";
      } else if (value === "M") {
        content = "🛒";
      } else if (value === "N") {
        content = "🧒";
      } else if (value === "G") {
        content = "🛡️";
      } else if (value === "W") {
        content = "🕳️";
      } else if (value === "Z") {
        content = "🗿";
      }
      html += `<div class="${cellClass}">${content}</div>`;
    }
  }
  html += `</div>`;
  document.getElementById("puebloEscenario").innerHTML = html;
}

// Movimiento del héroe en el pueblo
function moverPueblo(direction) {
  const { row, col } = puebloPos;
  let newRow = row, newCol = col;
  switch (direction) {
    case "up":
    case "arriba":
      newRow--;
      break;
    case "down":
    case "abajo":
      newRow++;
      break;
    case "left":
    case "izquierda":
      newCol--;
      break;
    case "right":
    case "derecha":
      newCol++;
      break;
  }
  if (
    newRow >= 0 && newRow < puebloData.length &&
    newCol >= 0 && newCol < puebloData[0].length &&
    puebloData[newRow][newCol] !== "#"
  ) {
    puebloPos = { row: newRow, col: newCol };
    drawPueblo();
    mostrarEventoPueblo();
  }
}

// Evento al llegar a una casilla especial
function mostrarEventoPueblo() {
  const value = puebloData[puebloPos.row][puebloPos.col];
  if (value === "H") {
    iniciarDialogo(1); // Herrero
  } else if (value === "P") {
    iniciarDialogo(0); // Posadero
  } else if (value === "A") {
    iniciarDialogo(2); // Anciana
  } else if (value === "M") {
    iniciarDialogo(3); // Mercader
  } else if (value === "N") {
    iniciarDialogo(4); // Niño
  } else if (value === "G") {
    iniciarDialogo(5); // Guardia
  } else if (value === "W") {
    iniciarDialogo(6); // Pozo
  } else if (value === "Z") {
    iniciarDialogo(7); // Estatua
  } else if (value === "S") {
    dialogoTexto.textContent = "¿Quieres salir del pueblo e ir a la mazmorra?";
    dialogoOpciones.innerHTML = `<button onclick="salirMazmorra()">Sí, salir</button>
      <button onclick="mostrarOpcionesLugarenos()">No, quedarme</button>`;
  } else if (value === "E") {
    dialogoTexto.textContent = "Estás en la entrada de tu casa. ¿Quieres descansar?";
    dialogoOpciones.innerHTML = `<button onclick="descansar()">Descansar</button>
      <button onclick="mostrarOpcionesLugarenos()">Salir</button>`;
  } else {
    mostrarOpcionesLugarenos();
  }
}

// Mostrar stats del héroe
function actualizarStats() {
  heroStats.innerHTML = `
    <strong>${heroe.nombre} el ${heroe.clase}</strong><br>
    Vida: ${heroe.vida} / ${heroe.vidaMax}<br>
    Ataque máximo: ${heroe.ataqueMax}<br>
    Defensa máxima: ${heroe.defensaMax}<br>
    Habilidad especial: ${heroe.habilidad}<br>
    Oro: ${heroe.oro || 0}
  `;
}

// Mostrar inventario
function abrirInventario() {
  inventarioDiv.style.display = "block";
  const objetos = Array.isArray(heroe.objetos) ? heroe.objetos : [];
  inventarioDiv.innerHTML = `
    <div class="inventario-grid">
      ${objetos.length === 0 ? "<div>No tienes objetos.</div>" : objetos.map((obj, idx) => `
        <div class="item">
          <div class="titulo">${obj}</div>
          <button onclick="usarObjetoInventario(${idx})">Usar</button>
        </div>
      `).join("")}
    </div>
    <button onclick="cerrarInventario()" style="margin-top:10px;">Cerrar</button>
  `;
}

function cerrarInventario() {
  inventarioDiv.style.display = "none";
}

// Usar objeto del inventario (ejemplo simple)
function usarObjetoInventario(idx) {
  const objetos = Array.isArray(heroe.objetos) ? heroe.objetos : [];
  const objeto = objetos[idx];
  if (objeto === "Poción de curación") {
    heroe.vida = Math.min(heroe.vida + 5, heroe.vidaMax);
    alert("¡Te curas 5 puntos de vida!");
    objetos.splice(idx, 1);
    heroe.objetos = objetos;
    localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
    actualizarStats();
    abrirInventario();
  } else {
    alert(`Usas ${objeto}, pero no pasa nada especial.`);
  }
}

// Acciones del pueblo
function descansar() {
  heroe.vida = heroe.vidaMax;
  localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
  actualizarStats();
  alert("Descansas y recuperas toda tu vida.");
}

function salirMazmorra() {
  localStorage.setItem("estadoHeroe", JSON.stringify(heroe));
  window.location.href = "tablero.html";
}

// Sistema de diálogo
function mostrarOpcionesLugarenos() {
  dialogoTexto.textContent = "¿Con quién quieres hablar?";
  dialogoOpciones.innerHTML = lugarenos.map((l, idx) =>
    `<button onclick="iniciarDialogo(${idx})">${l.nombre}</button>`
  ).join("");
  dialogoActual = null;
  indiceDialogo = 0;
}

function iniciarDialogo(idx) {
  dialogoActual = lugarenos[idx];
  indiceDialogo = 0;
  mostrarDialogoActual();
}

function mostrarDialogoActual() {
  if (!dialogoActual) return;
  dialogoTexto.textContent = dialogoActual.dialogos[indiceDialogo];
  dialogoOpciones.innerHTML = `
    ${indiceDialogo < dialogoActual.dialogos.length - 1
      ? `<button onclick="siguienteDialogo()">Siguiente</button>`
      : `<button onclick="mostrarOpcionesLugarenos()">Volver</button>`
    }
  `;
}

function siguienteDialogo() {
  if (dialogoActual && indiceDialogo < dialogoActual.dialogos.length - 1) {
    indiceDialogo++;
    mostrarDialogoActual();
  }
}

// Inicialización
window.onload = function() {
  actualizarStats();
  drawPueblo();
  mostrarEventoPueblo();
};

// Exponer funciones globales para los botones inline
window.abrirInventario = abrirInventario;
window.cerrarInventario = cerrarInventario;
window.usarObjetoInventario = usarObjetoInventario;
window.descansar = descansar;
window.salirMazmorra = salirMazmorra;
window.mostrarOpcionesLugarenos = mostrarOpcionesLugarenos;

// Soporte para movimiento con teclado y botones móviles
document.addEventListener('DOMContentLoaded', function() {
  // Flechas teclado
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp": e.preventDefault(); moverPueblo("up"); break;
      case "ArrowDown": e.preventDefault(); moverPueblo("down"); break;
      case "ArrowLeft": e.preventDefault(); moverPueblo("left"); break;
      case "ArrowRight": e.preventDefault(); moverPueblo("right"); break;
    }
  });
  // Botones móviles (si los agregas en el HTML)
  const arriba = document.getElementById('btnArriba');
  const abajo = document.getElementById('btnAbajo');
  const izq = document.getElementById('btnIzq');
  const der = document.getElementById('btnDer');
  if (arriba && abajo && izq && der) {
    arriba.addEventListener('click', () => moverPueblo('up'));
    abajo.addEventListener('click', () => moverPueblo('down'));
    izq.addEventListener('click', () => moverPueblo('left'));
    der.addEventListener('click', () => moverPueblo('right'));
  }
});