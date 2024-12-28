const { Telegraf } = require('telegraf');
const fs = require('fs');

// Votre token bot Telegram
const botToken = 'YOUR_BOT_TOKEN'; // Remplacez par votre token
const bot = new Telegraf(botToken);

// Chemin vers le fichier contenant les mots interdits
const badWordsFilePath = './badword.json';

// Fonction pour charger les mots interdits
function loadBadWords() {
    if (!fs.existsSync(badWordsFilePath)) {
        console.error("Le fichier badword.json est introuvable !");
        return [];
    }
    try {
        const data = fs.readFileSync(badWordsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Erreur lors du chargement du fichier badword.json :", err);
        return [];
    }
}

// Charger les mots interdits
const badWords = loadBadWords();

// Fonction pour détecter les mots interdits
function containsBadWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.some(word => badWords.includes(word));
}

// Stockage des avertissements par utilisateur
const userWarnings = {};

// Gestion des messages
bot.on('message', async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.username || ctx.from.first_name || "Utilisateur";
    const chatId = ctx.chat.id;
    const messageText = ctx.message.text || '';

    // Vérifier les mots interdits
    if (containsBadWords(messageText)) {
        // Avertir l'utilisateur
        await ctx.reply(`⚠️ @${userName}, attention, ce message contient des mots interdits.`);

        // Si dans un groupe, supprimer le message (si le bot est admin)
        if (ctx.chat.type !== 'private' && ctx.botInfo.can_delete_messages) {
            await ctx.deleteMessage(ctx.message.message_id).catch((err) => {
                console.error("Erreur lors de la suppression du message :", err.message);
            });
        }

        // Ajouter un avertissement pour l'utilisateur
        if (!userWarnings[userId]) {
            userWarnings[userId] = 1;
        } else {
            userWarnings[userId]++;
        }

        // Si l'utilisateur atteint 5 avertissements, le bannir (si le bot est admin dans un groupe)
        if (userWarnings[userId] >= 5 && ctx.chat.type !== 'private' && ctx.botInfo.can_restrict_members) {
            await ctx.reply(`🚫 @${userName} a été exclu du groupe pour utilisation abusive de mots interdits.`);
            await ctx.banChatMember(userId).catch((err) => {
                console.error("Erreur lors de l'exclusion de l'utilisateur :", err.message);
            });
        }
    }
});

// Lancer le bot
bot.launch()
    .then(() => console.log("Le bot est en ligne et prêt à fonctionner !"))
    .catch((err) => console.error("Erreur lors du lancement du bot :", err.message));

// Arrêter proprement le bot lors d'une interruption
process.on('SIGINT', () => {
    bot.stop('SIGINT');
    console.log("Le bot a été arrêté proprement.");
});
process.on('SIGTERM', () => {
    bot.stop('SIGTERM');
    console.log("Le bot a été arrêté proprement.");
});

// QUOTE FONCTION
// Simulation locale pour tester les fonctionnalités !quote et !song

const ytSearch = require('yt-search');
const fs = require('fs');
const googleTTS = require('google-tts-api');
const path = require('path');
const axios = require('axios'); // Pour télécharger les fichiers audio
const { exec } = require('child_process'); // Pour manipuler les stickers

// Vérification et création du dossier audio s'il n'existe pas
const audioDir = './audio';
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
    console.log(`📂 Dossier créé : ${audioDir}`);
}

// Vérification et création du dossier stickers s'il n'existe pas
const stickersDir = './XeonMedia/stickers';
if (!fs.existsSync(stickersDir)) {
    fs.mkdirSync(stickersDir, { recursive: true });
    console.log(`📂 Dossier créé : ${stickersDir}`);
}

// Chargement d'une grande base de données de citations inspirantes depuis un fichier JSON
let quotes = [];
try {
    quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf8'));
} catch (error) {
    console.error("Erreur lors du chargement des citations :", error);
    quotes = [
        "La persévérance est la clé du succès.",
        "Chaque jour est une nouvelle chance de briller.",
        "Le savoir est une arme, utilisez-le à bon escient.",
        "L'échec est simplement l'opportunité de recommencer, cette fois de manière plus intelligente."
    ];
}

// Fonction pour générer une citation inspirante
function getQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Fonction pour convertir une citation en audio et télécharger le fichier MP3
async function getQuoteAudioFile(quote, lang = 'fr') {
    try {
        const url = googleTTS.getAudioUrl(quote, { lang, slow: false });
        const filePath = `${audioDir}/${Date.now()}.mp3`;
        const response = await axios({
            method: 'get',
            url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error("Erreur lors du téléchargement de l'audio :", error);
        return null;
    }
}

// Fonction pour obtenir un sticker aléatoire
function getRandomSticker() {
    const files = fs.readdirSync(stickersDir);
    if (files.length === 0) {
        console.error("❌ Aucun sticker trouvé dans le dossier stickers.");
        return null; // Retourne null si le dossier est vide
    }
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(stickersDir, randomFile);
}

// Fonction pour rechercher une chanson sur YouTube
async function searchSong(query) {
    if (!query) {
        return "❌ Veuillez fournir le nom d'une chanson.";
    }

    try {
        const searchResult = await ytSearch(query);
        const song = searchResult.videos[0];

        if (song) {
            return `🎵 *${song.title}*\n\nLien : ${song.url}\nDurée : ${song.timestamp}`;
        } else {
            return "❌ Désolé, aucune chanson trouvée pour cette recherche.";
        }
    } catch (error) {
        console.error("Erreur lors de la recherche de chanson :", error);
        return "❌ Une erreur est survenue lors de la recherche de la chanson.";
    }
}

// Fonction pour envoyer un fichier audio en message vocal sur WhatsApp
async function sendAudio(chatId, audioPath, sendMessage) {
    try {
        const message = {
            audio: { url: audioPath },
            mimetype: 'audio/mpeg',
            ptt: true // Définit true pour envoyer l'audio comme une note vocale
        };
        await sendMessage(chatId, message);
        console.log("✅ Message vocal envoyé sur WhatsApp.");
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message vocal :", error);
    }
}

// Simulation pour envoyer une citation avec un audio ou un sticker
(async () => {
    console.log("=== Simulation du bot ===");

    // Test de la commande !quote
    console.log("\nCommande : !quote");
    const quote = getQuote();
    console.log(quote);

    // Test de la commande !quote audio (avec téléchargement)
    console.log("\nCommande : !quote (audio)");
    const audioFile = await getQuoteAudioFile(quote, 'fr');
    if (audioFile) {
        console.log(`Audio téléchargé : ${audioFile}`);
        // Envoie le fichier audio comme message vocal sur WhatsApp
        await sendAudio('chatId', audioFile, (chatId, message) => {
            console.log(`Message vocal envoyé à ${chatId}:`, message);
        }); // Remplace 'chatId' par un ID de conversation réel
    } else {
        console.log("❌ Erreur lors de la génération de l'audio.");
    }

    // Test de la commande !sticker
    console.log("\nCommande : !sticker");
    const stickerPath = getRandomSticker();
    if (stickerPath) {
        console.log(`Sticker envoyé : ${stickerPath}`);
    } else {
        console.log("❌ Aucun sticker n'a pu être envoyé.");
    }

    // Test de la commande !song
    const testQuery = "Shape of You Ed Sheeran"; // Remplace par une autre chanson pour tester
    console.log("\nCommande : !song " + testQuery);
    console.log(await searchSong(testQuery));
})();
// 

