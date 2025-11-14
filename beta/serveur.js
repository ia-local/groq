// serveur.js
require('dotenv').config(); // Charge les variables d'environnement du fichier .env
const express = require('express');
const path = require('path');
const Groq = require('groq-sdk'); // Assurez-vous d'avoir 'groq-sdk' installé

const app = express();
const port = process.env.PORT || 3000; // Le port par défaut est 3000

// Initialisation du SDK Groq
// Assurez-vous que process.env.GROQ_API_KEY est défini dans votre fichier .env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Middleware pour parser les corps de requête JSON
app.use(express.json());

// Sert les fichiers statiques depuis le répertoire 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Point d'API pour les complétions de chat Groq
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Le tableau de messages est requis.' });
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama3-8b-8192', // Ou un autre modèle Groq si vous le souhaitez
            temperature: 0.7,
            max_tokens: 1024
        });

        // Envoie la réponse de l'IA au client
        res.json({ reply: chatCompletion.choices[0]?.message?.content || "Aucune réponse de Groq." });

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Groq :', error);
        res.status(500).json({ error: 'Échec de l\'obtention d\'une réponse de l\'API Groq.' });
    }
});

// Capture toutes les autres routes et sert index.html (utile pour les SPAs)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
    console.log(`Accédez à l'application via : http://localhost:${port}`);
});