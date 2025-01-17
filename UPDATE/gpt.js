const { Client, MessageType } = require('@adiwajshing/baileys');
const { OpenAI } = require('openai'); // Assure-toi que tu as installé la dépendance OpenAI

// Utilisation de ta clé API OpenAI
const openai = new OpenAI({
  apiKey: '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'
});

// Fonction pour gérer la commande !ai
async function handleAICommand(message, client) {
    const command = message.body.split(' ')[0].toLowerCase();
    const args = message.body.split(' ').slice(1);

    // Commande pour générer une réponse IA
    if (command === '!gpt') {
        if (args.length === 0) {
            await client.sendMessage(
                message.key.remoteJid,
                'Usage: !gpt [votre question]',
                MessageType.text
            );
            return;
        }

        const question = args.join(' ');

        try {
            // Demande à OpenAI de générer une réponse
            const response = await openai.chat.completions.create({
                model: 'gpt-4', // Choisis le modèle que tu préfères
                messages: [{ role: 'user', content: question }],
            });

            // Envoie la réponse générée par l'IA sur WhatsApp
            await client.sendMessage(
                message.key.remoteJid,
                `🤖 Réponse IA :\n${response.choices[0].message.content}`,
                MessageType.text
            );
        } catch (error) {
            console.error('Erreur avec l\'IA:', error);
            await client.sendMessage(
                message.key.remoteJid,
                'Désolé, je n\'ai pas pu répondre à votre question.',
                MessageType.text
            );
        }
    }
}

module.exports = { handleAICommand };
