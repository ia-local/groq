// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatOutput = document.getElementById('chat-output');

    // Pour stocker l'historique de la conversation pour l'API Groq
    // Important: Gardez le rôle 'system' pour guider le comportement de l'IA
    let chatMessages = [{ role: 'system', content: 'Vous êtes un assistant IA utile et concis.' }];

    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const userMessage = userInput.value.trim();
        if (userMessage === '') return;

        // Ajoute le message de l'utilisateur à l'affichage et à l'historique
        appendMessage('user', userMessage);
        chatMessages.push({ role: 'user', content: userMessage });
        userInput.value = ''; // Efface le champ de saisie

        // Affiche un indicateur "l'IA écrit..."
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ai-message');
        typingIndicator.textContent = 'L\'IA est en train d\'écrire...';
        chatOutput.appendChild(typingIndicator);
        chatOutput.scrollTop = chatOutput.scrollHeight; // Fait défiler jusqu'en bas

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: chatMessages })
            });

            if (!response.ok) {
                // Tente de lire le message d'erreur du serveur si disponible
                const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                throw new Error(`Erreur HTTP! Statut: ${response.status}. Détails: ${errorData.error || 'Pas de détails.'}`);
            }

            const data = await response.json();
            const aiReply = data.reply;

            // Supprime l'indicateur de saisie
            if (chatOutput.contains(typingIndicator)) {
                chatOutput.removeChild(typingIndicator);
            }

            // Ajoute la réponse de l'IA à l'affichage et à l'historique
            appendMessage('ai', aiReply);
            chatMessages.push({ role: 'assistant', content: aiReply });

        } catch (error) {
            console.error('Erreur lors de la récupération de la réponse de l\'IA :', error);
            // Supprime l'indicateur de saisie et affiche l'erreur
            if (chatOutput.contains(typingIndicator)) {
                chatOutput.removeChild(typingIndicator);
            }
            appendMessage('error', `Erreur : Impossible d'obtenir une réponse de l'IA. (${error.message || error})`);
        }
    });

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = text;
        chatOutput.appendChild(messageElement);
        chatOutput.scrollTop = chatOutput.scrollHeight; // Fait défiler jusqu'en bas
    }
});