const randomDelay = (min, max) => {
    return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
};

// Exemple dans une boucle d'attaque
for (let i = 0; i < messages.length; i++) {
    await XTechBotInc.sendMessage(target, { text: messages[i] });
    await randomDelay(1000, 5000); // Pause entre 1 et 5 secondes
}
