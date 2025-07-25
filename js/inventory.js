// Objetos disponibles para HeroQuest
export const objetosDisponibles = [
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

// Sugerencia de uso:
// objetosDisponibles.forEach(obj => console.log(obj));

// Recompensas generadas dinámicamente con tres niveles de probabilidad
export const recompensas = [
  ...["Poción de curación", "Antorcha", "Espada oxidada", "Escudo de madera"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 0.4 })),
  ...["Botas veloces", "Pergamino de magia", "Mapa antiguo"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 0.3 })),
  ...["Llave oxidada", "Amuleto misterioso", "Cuerda resistente"].map(obj => ({ tipo: "objeto", nombre: obj, probabilidad: 0.2 })),
  { tipo: "oro", cantidad: 10, probabilidad: 0.5 },
  { tipo: "oro", cantidad: 25, probabilidad: 0.2 }
];

// Funciones de inventario y uso de objetos
export function usarObjeto(heroe, enemigo, renderStats, addLog, logCombate, eliminarMonstruo, generarRecompensa) {
  if (heroe.objetos.length === 0) {
    addLog("No tienes objetos para usar.");
    return;
  }
  let listado = "Elige el número del objeto para usar:\n";
  heroe.objetos.forEach((obj, i) => {
    listado += `${i+1}) ${obj}\n`;
  });
  let opcion = prompt(listado);
  if (opcion === null || opcion.trim() === "" || opcion.trim() === "0" || opcion.trim() === "nada" || opcion.trim() === "") {
    addLog("No usaste ningún objeto.");
    return;
  }
  opcion = parseInt(opcion);
  if (isNaN(opcion) || opcion < 1 || opcion > heroe.objetos.length) {
    addLog("Opción no válida.");
    return usarObjeto(heroe, enemigo, renderStats, addLog, logCombate, eliminarMonstruo, generarRecompensa);
  }
  const objeto = heroe.objetos[opcion - 1];
  if (objeto === "Poción de curación") {
    heroe.vida = Math.min(10, heroe.vida + 5);
    heroe.objetos.splice(opcion - 1, 1);
    renderStats(heroe);
    addLog(`Usas una ${objeto} y recuperas 5 puntos de vida.`);
    return "enemigo";
  } else if (objeto === "Antorcha") {
    addLog(`Usas una ${objeto}, el enemigo queda deslumbrado. No puede atacar este turno.`);
    enemigo.ataque = 0;
    setTimeout(() => {
      enemigo.ataque = enemigo.ataqueOriginal;
    }, 2000);
    heroe.objetos.splice(opcion - 1, 1);
    renderStats(heroe);
    return;
  } else if (objeto === "Llave oxidada") {
    addLog(`Usas la ${objeto} para abrir una puerta cercana. ¡Puedes avanzar!`);
    heroe.objetos.splice(opcion - 1, 1);
    renderStats(heroe);
    return;
  } else if (objeto === "Espada oxidada") {
    addLog(`Usas la ${objeto} para atacar al enemigo. ¡Infliges 3 puntos de daño!`);
    enemigo.vida -= 3;
    logCombate(`Usas la ${objeto} y le infliges 3 puntos de daño al ${enemigo.nombre}.`);
    logCombate(`Vida del ${enemigo.nombre}: ${enemigo.vida}`);
    heroe.objetos.splice(opcion - 1, 1);
    renderStats(heroe);
    if (enemigo.vida <= 0) {
      logCombate(`¡Has derrotado al ${enemigo.nombre}!`);
      eliminarMonstruo();
      generarRecompensa(heroe);
    }
    return;
  } else {
    addLog(`El objeto "${objeto}" no es usable en combate.`);
    return usarObjeto(heroe, enemigo, renderStats, addLog, logCombate, eliminarMonstruo, generarRecompensa);
  }
}
