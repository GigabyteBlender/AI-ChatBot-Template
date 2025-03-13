// services/apiService.js
export class ApiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.API_URL = 'https://openrouter.ai/api/v1/chat/completions';
        this.MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
    }

    /**
     * Get a completion from the AI API
     * @param {string} prompt - User prompt
     * @param {number} temp - Temperature for response generation
     * @returns {Promise<string>} AI response
     */
    async getCompletion(prompt, temp) {
        if (!this.apiKey) {
            throw new Error("API key is missing. Please configure it in settings.");
        }

        try {
            const messages = [
                {
                    role: "system",
                    content: "You are a helpful assistant. Aim for concise and informative answers."
                },
                { role: "user", content: prompt }
            ];

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    messages: messages,
                    temperature: temp
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error (${response.status}): ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            if (data?.choices?.[0]?.message?.content) {
                return data.choices[0].message.content;
            } else {
                console.error('Unexpected API response format:', data);
                return "Sorry, I couldn't understand the response.";
            }
        } catch (error) {
            console.error('Error calling AI API:', error);
            throw error;
        }
    }

    /**
     * Get a random predefined response
     * @returns {string} Random response
     */
    getRandomResponse() {
        const randomResponses = [
            "I'm not sure about that.",
            "Can you tell me more?",
            "That's interesting!",
            "Let me think about it...",
            "I don't have an answer for that right now.",
            "Why do you ask?",
            "That's a great question!",
            "Hmm... I'm not sure."
        ];
        const randomIndex = Math.floor(Math.random() * randomResponses.length);
        return randomResponses[randomIndex];
    }
}