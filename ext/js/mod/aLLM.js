/* globals marked */
import {gm, oai} from "./t.js";

export class LLM {
    constructor(container) {
        this.container = container;
        this.history = this.getHistory
        this.selectedLLM = localStorage.getItem('selectedLLM') || 'Gemini';
        this.apiEndpoints = this.initializeEndpoints();
        this.maxContext = 2040
        this.previousPrompts = [];
        this.currentPromptIndex = -1; // Track current prompt index
        this.usingPreviousContext = false; // Toggle for previous context
        this.createChatbox();
    }

    initializeEndpoints() {
        return {
            Gemini: {
                name: "Gemini",
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${gm}`,
                params: (prompt) => ({
                    contents: [{parts: [{text: prompt}]}]
                }),
                headers: () => ({
                    "Content-Type": "application/json"
                }),
                outputFormat: (json) => json.candidates[0].content.parts[0].text
            },
            ChatGPT: {
                name: "ChatGPT",
                url: "https://api.openai.com/v1/chat/completions",
                params: (prompt) => ({
                    model: "gpt-3.5-turbo",
                    messages: [{role: "user", content: prompt}]
                }),
                headers: () => ({
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${oai}`
                }),
                outputFormat: (json) => json.choices[0].message.content
            }
        };
    }
    getHistory(){
        try {
            return JSON.parse(localStorage.getItem('chatHistory')) || {};
        } catch(e) {
            console.error(e)
        }
        return null
    }
    createChatbox() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chatbox-container';

        const llmSelect = this.createLLMSelect();
        const chatDisplay = this.createChatDisplay();
        const chatInput = this.createChatInput();
        const sendButton = this.createSendButton(chatInput);
        const toggleContextButton = this.createToggleContextButton();

        chatContainer.append(
            llmSelect,
            chatDisplay,
            chatInput,
            toggleContextButton, // Add toggle button
            sendButton
        );
        this.container.appendChild(chatContainer);
        let clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => this.clear());
        this.container.appendChild(clearBtn)
        // Add event listeners
        chatInput.addEventListener('keydown', (e) => this.handleInputKeydown(e, chatInput));
        document.addEventListener('keydown', (e) => this.handleGlobalShortcuts(e));
    }
    clear(){
        const chatDisplay = document.getElementById('chat-display');
        const messages = Array.from(chatDisplay.children);
        this.msgs = messages.map(messageDiv => {
            messageDiv.remove()
        }).filter(Boolean);
    }
    handleGlobalShortcuts(e) {
        const chatInput = document.getElementById('chat-input');

        // Ctrl + I: Input image from clipboard
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            this.handleClipboardImage();
        }

        // Ctrl + Shift + I: Input image from file
        if (e.ctrlKey && e.shiftKey && e.key === 'i') {
            e.preventDefault();
            this.handleFileUpload();
        }

        // Ctrl + Y: Toggle using previous context
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.usingPreviousContext = !this.usingPreviousContext;
            console.log('Using previous context:', this.usingPreviousContext);
        }
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.clear()
        }
        // Ctrl + Shift + Arrow Up/Down: Change endpoint
        if (e.ctrlKey && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault();
            this.changeEndpoint(e.key === 'ArrowUp' ? 'up' : 'down');
        }

        // Ctrl + Alt + Shift + O: Change maxContext
        if (e.ctrlKey && e.altKey && e.shiftKey && e.key === 'o') {
            e.preventDefault();
            const newMaxContext = window.prompt('Enter new max context (tokens):', this.maxContext);
            if (newMaxContext) {
                this.maxContext = Math.max(0, parseInt(newMaxContext, 10)); // Ensure it's a positive integer
                console.log('Max context updated to:', this.maxContext);
            }
        }
    }

    handleInputKeydown(e, chatInput) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSend(chatInput);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            this.handlePromptNavigation(e.key);
        }
    }

    handlePromptNavigation(direction) {
        const chatInput = document.getElementById('chat-input');

        // Only navigate if the cursor is at the start or end of the input
        const isAtStart = chatInput.selectionStart === 0;
        const isAtEnd = chatInput.selectionEnd === chatInput.value.length;

        if (isAtStart || isAtEnd) {
            if (this.currentPromptIndex === -1) {
                this.currentPromptIndex = this.previousPrompts.length;
            }

            if (direction === 'ArrowUp') {
                if (this.currentPromptIndex > 0) {
                    this.currentPromptIndex--;
                    this.setPromptInInput();
                }
            } else if (direction === 'ArrowDown') {
                if (this.currentPromptIndex < this.previousPrompts.length - 1) {
                    this.currentPromptIndex++;
                    this.setPromptInInput();
                } else {
                    this.currentPromptIndex = -1; // Reset index
                    this.clearPromptInput();
                }
            }
        }
    }

    setPromptInInput() {
        const chatInput = document.getElementById('chat-input');
        chatInput.value = this.previousPrompts[this.currentPromptIndex];
        chatInput.focus();
    }

    clearPromptInput() {
        const chatInput = document.getElementById('chat-input');
        chatInput.value = '';
        chatInput.focus();
    }

    changeEndpoint(direction) {
        const llmKeys = Object.keys(this.apiEndpoints);
        const currentIndex = llmKeys.indexOf(this.selectedLLM);

        if (direction === 'up' && currentIndex > 0) {
            this.selectedLLM = llmKeys[currentIndex - 1];
        } else if (direction === 'down' && currentIndex < llmKeys.length - 1) {
            this.selectedLLM = llmKeys[currentIndex + 1];
        }

        localStorage.setItem('selectedLLM', this.selectedLLM);
        console.log('Endpoint changed to:', this.selectedLLM);
    }

    async handleSend(chatInput) {
        const message = chatInput.value.trim();
        if (!message) return;

        // Save prompt to history
        this.previousPrompts.push(message);
        this.currentPromptIndex = -1; // Reset index after sending

        let fullMessage = message;

        if (this.usingPreviousContext) {
            // Gather previous messages from the chat display
            const previousMessages = this.collectPreviousMessages();
            const previousContext = previousMessages.join(' '); // Combine messages into a single string

            // Check the total token count
            const totalTokens = this.getTokenCount(previousContext) + this.getTokenCount(message);
            if (totalTokens > this.maxContext) {
                // Truncate previous context if exceeding maxContext
                const contextToAdd = this.truncateContext(previousContext, this.maxContext - this.getTokenCount(message));
                fullMessage = contextToAdd + ' ' + message; // Combine context with the current message
            } else {
                fullMessage = previousContext + ' ' + message; // Combine without truncating
            }
        }

        await this.sendMessageInBatches(fullMessage);
        chatInput.value = '';
    }
    collectPreviousMessages() {
        const chatDisplay = document.getElementById('chat-display');
        const messages = Array.from(chatDisplay.children);
        this.msgs = messages.map(messageDiv => {
            const isUserMessage = true; //messageDiv.classList.contains('user-message');
            return isUserMessage ? messageDiv.querySelector('.message-content').innerText : '';
        }).filter(Boolean); // Filter out empty messages
        return this.msgs
    }

    truncateContext(previousContext, maxTokens) {
        const words = previousContext.split(' ');
        let truncated = [];
        let currentTokens = 0;

        for (const word of words) {
            currentTokens += this.getTokenCount(word);
            if (currentTokens > maxTokens) break;
            truncated.push(word);
        }

        return truncated.join(' ');
    }

    async sendMessageInBatches(message) {
        const tokens = this.getTokenCount(message);
        if (tokens > 2000) {
            const batches = this.splitIntoBatches(message);
            for (const batch of batches) {
                await this.sendToLLM(batch);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
            }
        } else {
            await this.sendToLLM(message);
        }
    }

    getTokenCount(text) {
        // Simple token counting logic (this may vary based on your tokenizer)
        return text.split(/\s+/).length;
    }

    splitIntoBatches(message) {
        const words = message.split(' ');
        const batches = [];
        let currentBatch = [];

        for (const word of words) {
            currentBatch.push(word);
            if (this.getTokenCount(currentBatch.join(' ')) >= 2000) {
                batches.push(currentBatch.join(' '));
                currentBatch = [];
            }
        }
        if (currentBatch.length) {
            batches.push(currentBatch.join(' '));
        }
        return batches;
    }

    createLLMSelect() {
        const llmSelect = document.createElement('select');
        Object.keys(this.apiEndpoints).forEach((llm) => {
            const option = document.createElement('option');
            option.value = llm;
            option.textContent = this.apiEndpoints[llm].name;
            if (llm === this.selectedLLM) option.selected = true;
            llmSelect.appendChild(option);
        });

        llmSelect.addEventListener('change', (e) => {
            this.selectedLLM = e.target.value;
            localStorage.setItem('selectedLLM', this.selectedLLM);
        });

        return llmSelect;
    }

    createTabRow(className) {
        const tabRow = document.createElement('div');
        tabRow.className = `tab-row ${className}`;
        return tabRow;
    }

    loadYearTabs(yearTabs) {
        Object.keys(this.history).forEach((year) => {
            const yearTab = this.createTab(year, () => this.loadMonthTabs(year));
            yearTabs.appendChild(yearTab);
        });
    }

    loadMonthTabs(year) {
        const monthTabs = document.querySelector('.month-tabs');
        monthTabs.innerHTML = '';

        Object.keys(this.history[year]).forEach((month) => {
            const monthTab = this.createTab(month, () => this.loadDayTabs(year, month));
            monthTabs.appendChild(monthTab);
        });
    }

    loadDayTabs(year, month) {
        const dayTabs = document.querySelector('.day-tabs');
        dayTabs.innerHTML = '';

        Object.keys(this.history[year][month]).forEach((day) => {
            const dayTab = this.createTab(day, () => this.loadSessionTabs(year, month, day));
            dayTabs.appendChild(dayTab);
        });
    }

    loadSessionTabs(year, month, day) {
        const sessionTabs = document.querySelector('.session-tabs');
        sessionTabs.innerHTML = '';

        Object.keys(this.history[year][month][day]).forEach((session) => {
            const sessionTab = this.createTab(session, () => this.loadChatHistory(year, month, day, session));
            sessionTabs.appendChild(sessionTab);
        });

        this.autoSelectLatestTab(sessionTabs); // Auto-select latest session
    }

    autoSelectLatestTab(tabRow) {
        const latestTab = tabRow.lastElementChild;
        if (latestTab) latestTab.click(); // Trigger the click event to auto-load the latest content
    }

    loadChatHistory(year, month, day, session) {
        const chatDisplay = document.getElementById('chat-display');
        chatDisplay.innerHTML = '';

        this.history[year][month][day][session].forEach(({user, llm}) => {
            this.appendMessage(chatDisplay, 'You', user, true);
            this.appendMessage(chatDisplay, this.selectedLLM, llm, false);
        });
    }

    createTab(label, onClick) {
        const tab = document.createElement('button');
        tab.className = 'tab';
        tab.textContent = label;
        tab.addEventListener('click', onClick);
        return tab;
    }
    createChatDisplay() {
        const chatDisplay = document.createElement('div');
        chatDisplay.id = 'chat-display';
        chatDisplay.className = 'chat-display';
        return chatDisplay;
    }

    createChatInput() {
        const chatInput = document.createElement('textarea');
        chatInput.id = 'chat-input';
        chatInput.placeholder = 'Type your message...';
        return chatInput;
    }

    createSendButton(chatInput) {
        const sendButton = document.createElement('button');
        sendButton.id = 'send-btn';
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', () => this.handleSend(chatInput));
        return sendButton;
    }

    createToggleContextButton() {
        const toggleContextButton = document.createElement('button');
        toggleContextButton.id = 'toggle-context-btn';
        toggleContextButton.textContent = 'Use Previous Context';
        toggleContextButton.addEventListener('click', () => {
            this.usingPreviousContext = !this.usingPreviousContext;
            toggleContextButton.classList.toggle('active', this.usingPreviousContext);
        });
        return toggleContextButton;
    }
    formatRequest(request, text, index = null, order = 'request:text') {
        request = this.promptsFormatter('code')
        const formats = {
            'request:text': `${request}: ${text}`,
            'text:request': `${text}: ${request}`,
            'request/text': `${request} / ${text}`,
            'text/request': `${text} / ${request}`,
            'request and text': `${request} and ${text}`,
            'text and request': `${text} and ${request}`,
            'request - text': `${request} - ${text}`,
            'text - request': `${text} - ${request}`,
            'request | text': `${request} | ${text}`,
            'text | request': `${text} | ${request}`,
            'request + text': `${request} + ${text}`,
            'text + request': `${text} + ${request}`,
            'request; text': `${request}; ${text}`,
            'text; request': `${text}; ${request}`,
            'request in text format': `In the format of: ${request} with ${text}`,
            'text in request format': `In the format of: ${text} related to ${request}`,
            'request to text': `Transform ${request} to ${text}`,
            'text to request': `Transform ${text} into ${request}`,
        };
        // If an index is provided, return the format at that index
        if (index !== null) {
            const keys = Object.keys(formats);
            return formats[keys[index]] || `${request}: ${text}`; // Default to 'request:text' format if index is out of bounds
        }

        return formats[order] || `${request}: ${text}`; // Return by specified order or default format
    }
    promptsFormatter(promptKey, ...values) {
        const prompts = {
            code: [
                `Make the code faster, less lines of code`,
                `Make the code easier to read`,
                `Make the code faster, less redundant`,
                `Make the code more safe with type checking and use more try {}`,
                `Make the code faster, safer`,
                `Make the code faster, less redundant, safer`,
                `Convert the code to ${values[0]} programming language`, // Using values[0] for language
                `Convert the code to C++`,
                `Convert the code to Assembly`,
                `Explain line by line of the code showing the state of the program each line`,
            ],
            explanations: [
                `Explain grammar and etymology of the sentence`,
                `Make it easier to understand`,
                `Explain it like I'm a ${values[0]} year-old ${values[1]}`, // Using values[0] for age and values[1] for type
                `Explain it like I'm a ${values[0]} year-old ${values[1]} enthusiast`,
                `Explain it like I'm a ${values[1]}`,
                `Explain it like I'm a 3 year-old baby`,
                `Explain it like I'm a 10 year-old kid`,
                `Explain it like I'm a 15 year-old teen`,
                `Explain it like I'm a 20 year-old young-adult`,
                `Explain it like I'm a 50 year-old adult`,
                `Explain it like I'm a 90 year-old grandpa`,
                `Explain it like I'm a gamer`,
                `Explain it like I'm a japanese enthusiast`,
            ],
            math: [
                `Calculate it, show calculations in format`,
            ],
            vocabulary: [
                `Break down each word in the following format: { "term": "word", "meaning": "definition" }`,
                `Break down each word in the following format: { "term": "word", "meaning": "definition", "pronunciation": "phonetic" }`,
                `Break down each word in the following format: { "term": "word", "meaning": "definition", "pronunciation": "phonetic", "etymology": "origin" }`,
                `Break down each word in the following format: { "term": "word", "meaning": "definition", "pronunciation": "phonetic", "etymology": "origin", "ideographs": ["ideograph1", "ideograph2"] }`,
            ]
        };

        // Flatten the prompt arrays and sort them alphabetically
        const allPrompts = Object.values(prompts).flat().sort();

        // Retrieve the prompt by key
        const prompt = allPrompts[promptKey];

        // Replace placeholders using the provided values
        return prompt.replace(/\${(.*?)}/g, (match, key) => {
            const trimmedKey = key.trim();
            const index = parseInt(trimmedKey);
            return !isNaN(index) && index < values.length ? values[index] : ''; // Return the corresponding value
        });
    }
    async fetchResponse(text, type) {
        const formattedPrompt = this.prompts(text, type);
        // Assume 'llmFetch' is a function that interacts with your LLM
        const response = await this.sendToLLM(text)

        const jsonRegex = /(\[.*?\]|\{.*?\})/g;
        const matches = text.match(jsonRegex);

        if (matches) {
            matches.forEach(match => {
                try {
                    const jsonData = JSON.parse(match);
                    console.log(jsonData);
                    return jsonData
                } catch (error) {
                    console.error("Invalid JSON:", match);
                }
            });
        } else {
            console.log("No JSON found.");
            return null
        }
    }

    createFlexbox(response) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'space-between';

        response.words.forEach(word => {
            const wordBox = document.createElement('div');
            wordBox.style.flex = '1 1 30%'; // Adjust width as needed
            wordBox.style.padding = '10px';
            wordBox.style.border = '1px solid #ccc';
            wordBox.style.margin = '5px';

            wordBox.innerHTML = `
                <h4>${word.term}</h4>
                <p>Meaning: ${word.meaning}</p>
                <p>Pronunciation: ${word.pronunciation}</p>
                <p>Etymology: ${word.etymology}</p>
                <p>Ideographs: ${word.ideographs.join(', ')}</p>
            `;

            container.appendChild(wordBox);
        });

        this.container.prepend(container); // Append the flexbox container to the body
    }
    async sendToLLM(message) {
        const chatDisplay = document.getElementById('chat-display');
        this.appendMessage(chatDisplay, 'You', message, true);

        const llmConfig = this.apiEndpoints[this.selectedLLM];
        const response = await this.queryLLM(llmConfig, message);

        this.appendMessage(chatDisplay, this.selectedLLM, response, false);
        this.saveMessageToHistory(message, response);
        return response
    }

    async queryLLM(config, message) {
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(),
                body: JSON.stringify(config.params(message))
            });
            const json = await response.json();
            console.log(response, json)
            return config.outputFormat(json);
        } catch (error) {
            console.error('Error querying LLM:', error);
            return 'An error occurred.';
        }
    }

    appendMessage(chatDisplay, sender, message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'llm-response';

        const icon = document.createElement('span');
        icon.className = isUser ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = marked.parse(message);

        messageDiv.append(icon, content);
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    saveMessageToHistory(userMessage, llmResponse) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const session = `${hours}:${minutes}:${seconds}`; // Use timestamp as session key

        if (!this.history[year]) this.history[year] = {};
        if (!this.history[year][month]) this.history[year][month] = {};
        if (!this.history[year][month][day]) this.history[year][month][day] = {};

        if (!this.history[year][month][day][session]) {
            this.history[year][month][day][session] = [];
        }

        this.history[year][month][day][session].push({user: userMessage, llm: llmResponse});
        localStorage.setItem('chatHistory', JSON.stringify(this.history));
    }
}
