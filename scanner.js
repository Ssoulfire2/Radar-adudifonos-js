
const noble = require("@abandonware/noble");

// Configuración
const DISTANCIA_MAXIMA = 10;
const POTENCIA_1M = -59;
const FACTOR_AMBIENTE = 2.5;
const TIEMPO_ESCANEO = 15000;

const dispositivosDetectados = new Map();

function estimarDistancia(rssi) {
    if (rssi == null || rssi === 0) {
        return null;
    }

    const distancia = Math.pow(
        10,
        (POTENCIA_1M - rssi) / (10 * FACTOR_AMBIENTE)
    );

    return distancia;
}

function dispositivoDetectado(peripheral) {
    const rssi = peripheral.rssi;
    const distancia = estimarDistancia(rssi);

    if (
        distancia === null ||
        distancia > DISTANCIA_MAXIMA
    ) {
        return;
    }

    const nombre =
        peripheral.advertisement.localName ||
        "Dispositivo sin nombre";

    const direccion = peripheral.address || peripheral.id;

    dispositivosDetectados.set(direccion, {
        nombre,
        rssi,
        distancia
    });

    console.log(
        `[${rssi} dBm] ${nombre} ` +
        `(${direccion}) - ` +
        `${distancia.toFixed(1)} metros`
    );
}

let escaneoIniciado = false;

function iniciarEscaneo() {
    if (escaneoIniciado) return;
    escaneoIniciado = true;

    console.log("Buscando dispositivos Bluetooth cercanos...");
    console.log(`Límite estimado: ${DISTANCIA_MAXIMA} metros\n`);

    noble.on("discover", dispositivoDetectado);

    noble.startScanning([], true, (error) => {
        if (error) {
            console.error("Error al iniciar:", error);
            return;
        }

        setTimeout(() => {
            noble.stopScanning();
            console.log("\nEscaneo finalizado.");
            console.log(
                `Dispositivos registrados: ${dispositivosDetectados.size}`
            );
        }, TIEMPO_ESCANEO);
    });
}

noble.on("stateChange", (state) => {
    if (state === "poweredOn") {
        iniciarEscaneo();
    } else {
        console.log("Bluetooth no disponible:", state);
    }
});
