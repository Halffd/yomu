import { hf, pr, rs } from "./t.js";

export class AI {
    constructor(dic, container) {
        this.dic = dic;
        this.container = container;
        this.processingImages = [];
        this.images = []
        this.prompts = [];
        this.endpoints = [
            {
                name: "Stable Diffusion XL",
                url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": prompt,
                    "negative_prompt": negative,
                    "seed": -1
                })
            },
            {
                name: "FLUX 1.0",
                url: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": prompt,
                    "negative_prompt": negative,
                    "seed": -1
                })
            },
            {
                name: "FLUX 1.0 anm",
                url: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": `Anime-style, high quality, masterpiece ${prompt}`,
                    "negative_prompt": negative,
                    "seed": -1
                })
            },
            {
                name: "SDXL Turbo",
                url: "https://api-inference.huggingface.co/models/stabilityai/sdxl-turbo",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": prompt,
                    "negative_prompt": negative,
                    "seed": -1
                })
            },
            {
                name: "Stable Diffusion 1.4",
                url: "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": prompt,
                    "negative_prompt": negative,
                    "seed": -1
                })
            },
            {
                name: "ControlNet with Pony Diffusion V6 XL",
                url: "https://randomseed.lol/v1/controlnet",
                token: rs,
                params: (prompt, negative) => ({
                    "controlnet": {
                        "prompt": prompt,
                        "negative_prompt": negative,
                        "width": "512",
                        "height": "768",
                        "number_of_images": "1",
                        "steps": "20",
                        "cfg_scale": 7.5,
                        "sampler_name": "Euler a",
                        "seed": "-1",
                        "user_id": 3,
                        "model_name": "realistic_vision_v4",
                        "track_id": 1,
                        "controlnet_args": [{
                            "model": "flat2DAnimerge_v30"
                        }]
                    }
                })
            },
            {
                name: "Prodia",
                url: "https://api.prodia.com/v1/sd/generate",
                header: ['X-Prodia-Key', pr],
                params: (prompt, negative) => ({
                    "model": "v1-5-pruned-emaonly.safetensors [d7049739]",
                    "prompt": prompt,
                    "negative_prompt": negative,
                    "style_preset": "anime",
                    "steps": 20,
                    "cfg_scale": 7,
                    "seed": -1,
                    "upscale": false,
                    "sampler": "DPM++ 2M Karras",
                    "width": 512,
                    "height": 512
                })
            }
        ];

        this.processingCount = 0
        this.selectedEndpoint = this.getSelectedEndpoint() || this.endpoints[0];
        this.main = this.createMainDiv();
        container.appendChild(this.main);
    }

    getSelectedEndpoint() {
        const endpointName = localStorage.getItem('selectedEndpoint');
        return this.endpoints.find(ep => ep.name === endpointName);
    }

    setSelectedEndpoint(endpoint) {
        this.selectedEndpoint = endpoint;
        localStorage.setItem('selectedEndpoint', endpoint.name);
    }

    createMainDiv() {
        const mainDiv = document.createElement('div');
        mainDiv.className = 'main-container';

        const heading = document.createElement('h1');
        heading.textContent = 'Image Generator';
        mainDiv.appendChild(heading);

        this.endpointSelect = document.createElement('select');
        this.endpointSelect.id = 'endpoint-select';
    
        // Populate the select options
        this.endpoints.forEach(endpoint => {
            const option = document.createElement('option');
            option.value = endpoint.name;
            option.textContent = endpoint.name;
            this.endpointSelect.appendChild(option);
        });
    
        mainDiv.appendChild(this.endpointSelect);
        
        const promptInput = document.createElement('input');
        promptInput.type = 'text';
        promptInput.id = 'prompt';
        promptInput.placeholder = 'Enter your prompt';
        mainDiv.appendChild(promptInput);
        
        const negativeInput = document.createElement('input');
        negativeInput.type = 'text';
        negativeInput.id = 'negative-prompt';
        negativeInput.placeholder = 'Enter negative prompt (optional)';
        mainDiv.appendChild(negativeInput);
        
        const generateButton = document.createElement('button');
        generateButton.id = 'generate-btn';
        generateButton.textContent = 'Generate Image';
        mainDiv.appendChild(generateButton);
        mainDiv.innerHTML += `</br><div id="image-loading">.</div>`
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        imageContainer.id = 'image-container';
        //imageContainer.style.overflowX = 'scroll'; // Make it scrollable
        imageContainer.style.height = 'fit-content'; // Set fixed height
        mainDiv.appendChild(imageContainer);
        setTimeout(() => {
            this.endpointSelect = document.getElementById("endpoint-select")
            // Set the selected index based on the saved endpoint
            const selectedEndpoint = this.getSelectedEndpoint();
            if (selectedEndpoint) {
                this.endpointSelect.selectedIndex = this.endpoints.indexOf(selectedEndpoint); // Set the default value
            }
            // Add change event listener
            this.endpointSelect.onchange = function() {
                const selected = this.endpoints.find(ep => ep.name === this.endpointSelect.value);
                if (selected) {
                    this.setSelectedEndpoint(selected);
                }
            }.bind(this);
            let promptInput = document.getElementById("generate-btn")
            promptInput.style.cursor = 'pointer'
            promptInput.addEventListener('click', () => {
                    let prompts = [
                        document.getElementById("prompt"),
                        document.getElementById("negative-prompt")
                    ]
                    const prompt = prompts[0].value;
                    const negative = prompts[1].value;
                if (!prompt) {
                    alert('Please enter a prompt.');
                    return;
                }
                this.generateImage(prompt, negative);
            }, false);
        }, 500);
        return mainDiv;
    }

    async generateImage(prompt, negative) {
        if(prompt == '' || prompt == ' '){
            return "Null"
        } else if(prompt.length > 5000){
            return "Full"
        }
        this.processingCount++; // Increment processing count
        let endpoint = this.selectedEndpoint.name
        console.log(`Generating ${prompt}  ${negative}    ${this.processingCount}`)
        this.updateLoadingScreen();
        try {
            const body = this.selectedEndpoint.params(prompt, negative);
            let headers = {
                'Content-Type': 'application/json',
            };
            if (this.selectedEndpoint.token) {
                headers['Authorization'] = `Bearer ${this.selectedEndpoint.token}`;
            }
            if (this.selectedEndpoint.header) {
                headers[this.selectedEndpoint.header[0]] = this.selectedEndpoint.header[1];
            }
            
            const response = await fetch(this.selectedEndpoint.url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.blob();
            this.processingImages.unshift(data); // Prepend the new image
            this.prompts.unshift(`${endpoint}: ${prompt}`); // Prepend the new prompt
        } catch (error) {
            console.error('Error generating image:', error);
            //alert('An error occurred. Please check the console for details.');
        } finally {
            this.processingCount--; // Decrement processing count
            this.updateLoadingScreen();
        }
    }

    updateLoadingScreen() {
        const container = document.getElementById('image-loading');
        container.innerHTML = ''; // Clear previous loading message

        if (this.processingCount > 0) {
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'loading-message';
            loadingMessage.textContent = `Processing ${this.processingCount} image(s)...`;
            container.appendChild(loadingMessage);
        } else {
            this.displayImages(); // Show images if no processing is happening
        }
    }

    displayImages() {
        const container = document.getElementById('image-container');

        this.processingImages.forEach((image, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(image);
            img.className = 'generated-img';

            const text = document.createElement('p');
            text.textContent = this.prompts[index];
            text.className = 'prompt-text';

            wrapper.appendChild(img);
            wrapper.appendChild(text);
            container.appendChild(wrapper);
        });
        this.images.unshift(this.processingImages)
        this.processingImages = []
    }
}