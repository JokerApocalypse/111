function BugForce2(options = {}) {
    // Options par défaut
    const defaultOptions = {
        injectLatency: 0, // Latence en millisecondes
        corruptData: false, // Activer la corruption de données
        consumeCPU: 0, // Durée de surcharge CPU en secondes (mise à 0 pour continue)
        leakMemory: false, // Activer une fuite de mémoire continue
        dropPackets: 0, // Nombre de paquets à simuler pour la perte
    };

    // Fusion des options
    const config = { ...defaultOptions, ...options };

    // Fonction pour injecter une latence (ne bloque pas le programme)
    function injectLatency() {
        return new Promise((resolve) => {
            console.log("Injection de latence... Réseau gelé indéfiniment !");
            setInterval(() => {
                // Injection continue de latence sans bloquer l'exécution
                console.log("Réseau toujours gelé...");
            }, 1000); // Répétition de la latence toutes les secondes
        });
    }

    // Fonction pour corrompre des données
    function corruptData(data) {
        if (!data || typeof data !== "string") return data;
        console.log("Corruption des données en continue...");
        return data
            .split("")
            .map((char) =>
                Math.random() > 0.8 ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : char
            )
            .join("");
    }

    // Fonction pour consommer du CPU
    function consumeCPU() {
        console.log("Surcharge CPU continue...");
        while (true) {
            Math.sqrt(Math.random() * 1000); // Boucle infinie pour créer une surcharge CPU
        }
    }

    // Fonction pour simuler une fuite de mémoire
    function leakMemory() {
        console.log("Fuite de mémoire agressive...");
        const leakyArray = [];
        setInterval(() => {
            leakyArray.push(new Array(1000000).fill("*")); // Ajoute 1 Mo à chaque intervalle
        }, 500); // Plus agressif : fuite toutes les 500ms
    }

    // Fonction pour simuler la perte de paquets
    function dropPackets() {
        console.log("Perte de paquets constante...");
        let packetCount = 1000; // Augmente la simulation de perte de paquets
        for (let i = 0; i < packetCount; i++) {
            console.log(`Paquet ${i} perdu`);
        }
    }

    // Exécution des bugs en fonction des options
    async function execute() {
        if (config.injectLatency > 0) {
            injectLatency(); // La latence sera continue, mais non bloquante
        }
        if (config.corruptData) {
            const testData = "Exemple de données à corrompre";
            console.log(`Données corrompues en continu : ${corruptData(testData)}`);
        }
        if (config.consumeCPU > 0) {
            consumeCPU(); // Consommation CPU continue
        }
        if (config.leakMemory) {
            leakMemory(); // Fuite de mémoire continue
        }
        if (config.dropPackets > 0) {
            dropPackets(); // Perte de paquets constante
        }
    }

    return {
        execute,
    };
}

// Exemples de scénarios avec des bugs permanents et violents
async function runScenarios() {
    console.log("== Scénario 1 : Latence réseau permanente ==");
    const latencyBug = BugForce2({ injectLatency: 1000 });
    await latencyBug.execute(); // La latence sera infinie, mais non bloquante

    console.log("\n== Scénario 2 : Corruption de données continue ==");
    const dataCorruptionBug = BugForce2({ corruptData: true });
    await dataCorruptionBug.execute();

    console.log("\n== Scénario 3 : Surcharge CPU permanente ==");
    const cpuBug = BugForce2({ consumeCPU: 0 });
    await cpuBug.execute();

    console.log("\n== Scénario 4 : Fuite de mémoire agressive ==");
    const memoryLeakBug = BugForce2({ leakMemory: true });
    memoryLeakBug.execute(); // Pas besoin d'attendre, fuite continue

    console.log("\n== Scénario 5 : Perte de paquets constante ==");
    const packetLossBug = BugForce2({ dropPackets: 10 });
    await packetLossBug.execute();

    console.log("\n== Scénario 6 : Combinaison de bugs permanents et violents ==");
    const comboBug = BugForce2({
        injectLatency: 1000,
        corruptData: true,
        consumeCPU: 0,
        dropPackets: 1000,
    });
    await comboBug.execute();

    console.log("\n== Tous les tests sont terminés ! =="); // Ce message n'arrivera probablement pas avec les latences infinies
}

// Lancer les scénarios
runScenarios();
