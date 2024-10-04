import {hf, pr, rs} from "./t.js";

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
                    "inputs": `"${prompt}":2.0, anime:0.1`,
                    "negative_prompt": negative,
                    "seed": -1,
                    "cfg_scale": 20
                })
            },
            {
                name: "FLUX 1.0 anm2",
                url: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": `"${prompt}":2.0, "high quality":0.1, masterpiece:0.1, anime:0.1`,
                    "negative_prompt": negative,
                    "seed": -1,
                    "cfg_scale": 20
                })
            },
            {
                name: "FLUX Uncensored",
                url: "https://api-inference.huggingface.co/models/enhanceaiteam/Flux-uncensored",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": `"${prompt}":2.0, "high quality":0.1, masterpiece:0.1, anime:0.1`,
                    "negative_prompt": negative,
                    "seed": -1,
                    "cfg_scale": 20
                })
            },
            {
                name: "OpenFLUX",
                url: "https://api-inference.huggingface.co/models/ostris/OpenFLUX.1",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": `"${prompt}":2.0, "high quality":0.1, masterpiece:0.1, anime:0.1`,
                    "negative_prompt": negative,
                    "seed": -1,
                    "cfg_scale": 20
                })
            },
            {
                name: "Stable Diffusion 1.5",
                url: "https://api-inference.huggingface.co/models/stable-diffusion-v1-5/stable-diffusion-v1-5",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": `"${prompt}":2.0, "high quality":0.1, masterpiece:0.1, anime:0.1`,
                    "negative_prompt": negative,
                    "seed": -1,
                    "cfg_scale": 20
                })
            },
            {
                name: "OpenJourney",
                url: "https://api-inference.huggingface.co/models/prompthero/openjourney-v4",
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
                name: "Animagine",
                url: "https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.1",
                token: hf,
                params: (prompt, negative) => ({
                    "inputs": prompt,
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
        this.initDelay = 10000
        this.curDelay = this.initDelay
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

        const promptInput = document.createElement('textarea'); // Changed to textarea
        promptInput.id = 'prompt';
        promptInput.placeholder = 'Enter your prompt';
        promptInput.rows = 4; // Set rows for better UX
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
        const multiButton = document.createElement('button');
        multiButton.id = 'multi-btn';
        multiButton.textContent = 'Multiple Image';
        mainDiv.appendChild(multiButton);
        
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
            this.endpointSelect.onchange = function () {
                const selected = this.endpoints.find(ep => ep.name === this.endpointSelect.value);
                if (selected) {
                    this.setSelectedEndpoint(selected);
                }
            }.bind(this);
            let promptInput = document.getElementById("prompt")
            promptInput.style.cursor = 'text';

            // Handle keydown for Enter and Shift + Enter
            promptInput.addEventListener('keydown', (event) => {
                if (event.key === 'Space') {
                    promptInput.value += ' '
                }
                if (event.key === 'Enter') {
                    if (event.shiftKey) {
                        // Allow new line
                        return; // Do nothing, let the textarea handle it
                    } else {
                        event.preventDefault(); // Prevent default Enter behavior
                        this.generateImage(promptInput.value, negativeInput.value);
                    }
                }
            });
            let generateButton = document.getElementById("generate-btn")
            generateButton.style.cursor = 'pointer';
            let multiButton = document.getElementById("multi-btn")
            multiButton.style.cursor = 'pointer';

            generateButton.addEventListener('click', () => {
                this.generateImage(promptInput.value, negativeInput.value);
            }, false);
            multiButton.addEventListener('click', () => {
                this.generateMulti(promptInput.value, negativeInput.value);
            }, false);
        }, 500);
        return mainDiv;
    }

    async generateImage(prompt, negative) {
        if (prompt == '' || prompt == ' ') {
            return "Null"
        } else if (prompt.length > 5000) {
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
            if (response.status === 420) {
                console.log('Rate limit exceeded. Retrying...');
                this.processingCount--
                this.curDelay *= 1.5
                await this.delay(this.curDelay);
                await this.generateImage(prompt, negative);
                return; // Exit after handling the rate limit
            }

            if (!response.ok) {
                console.error(new Error('Network response was not ok'));
                this.curDelay *= 2.4
                await this.delay(this.curDelay);
                await this.generateImage(prompt, negative);
                return
            }

            const data = await response.blob();
            this.processingImages.unshift(data); // Prepend the new image
            this.prompts.unshift(`${endpoint}: ${prompt}${negative ? ` | ${negative}` : ""}`); // Prepend the new prompt
        } catch (error) {
            console.error('Error generating image:', error);
            this.curDelay *= 3
            this.processingCount--; // Decrement processing count
            await this.delay(this.curDelay);
            this.generateImage(prompt, negative);
            return
            //alert('An error occurred. Please check the console for details.');
        } finally {
            this.processingCount--; // Decrement processing count
            this.updateLoadingScreen();
        }
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async generate(endpoint, prompt, negative) {
        console.log(`Generating image for prompt: ${prompt}`);
        const body = endpoint.params(prompt, negative);
        let headers = {
            'Content-Type': 'application/json',
        };
        if (endpoint.token) {
            headers['Authorization'] = `Bearer ${this.selectedEndpoint.token}`;
        }
        if (endpoint.header) {
            headers[this.selectedEndpoint.header[0]] = this.selectedEndpoint.header[1];
        }

        const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.blob(); // Return the image blob
    }


    async combineImages(images, size = 512) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Assuming images are of the same size, set canvas dimensions
        const width = size; // Set your desired width
        const height = size * images.length; // Stack images vertically

        canvas.width = width;
        canvas.height = height;

        for (let i = 0; i < images.length; i++) {
            const img = await this.loadImage(images[i]);
            ctx.drawImage(img, 0, i * size); // Draw each image at the correct position
        }

        return canvas.toBlob(); // Return combined image as blob
    }

    loadImage(imageBlob) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(imageBlob);
        });
    }

    async generateMulti(prompt,negative) {
        this.generateAndDisplayImages({
            0: 1, 1: 1, 4: 1, 9: 1
        }, prompt, negative, 1);
    }
    async generateAndDisplayImages(endpointCounts, prompt, negative) {
        const allImages = [];
    
        // Create an array of promises for generating images
        const promises = Object.entries(endpointCounts).map(async ([index, count]) => {
            const endpoint = this.endpoints[index];
            
            try {
                const images = await this.generateMultipleImages(endpoint, prompt, negative, count);
                allImages.push(...images); // Combine images from this endpoint
            } catch (error) {
                console.error(`Error generating images for endpoint ${index}:`, error);
            }
        });
    
        // Wait for all promises to resolve
        await Promise.all(promises);
    
        // Combine all generated images into a single blob
        const combinedImageBlob = await this.combineImages(allImages);
        // Display the combined image
        this.displayImage(combinedImageBlob);
    }
    
    async generateMultipleImages(endpoint, prompt, negative, count) {
        const images = [];
    
        // Generate the specified number of images
        const promises = Array.from({ length: count }).map(() =>
            this.generateImage(endpoint, prompt, negative)
                .then(image => images.push(image)) // Add the generated image to the array
                .catch(error => console.error('Error generating image:', error))
        );
    
        // Wait for all image generation promises to resolve
        await Promise.all(promises);
    
        return images; // Return an array of image blobs
    }
    updateLoadingScreen() {
        const container = document.getElementById('image-loading');
        container.innerHTML = ''; // Clear previous loading message

        if (this.processingCount > 0) {
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'loading-message';
            loadingMessage.textContent = `Processing ${this.processingCount} image(s)...`;
            container.appendChild(loadingMessage);
        }
        if (this.processingImages.length > 0) {
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
            container.prepend(wrapper);
        });
        this.images.unshift(this.processingImages)
        this.processingImages = []
        this.prompts = []
        if (this.processingCount < 1) {
            this.curDelay = this.initDelay
        }
    }
    displayImage(image, prompt) {
        this.processingImages.unshift(image)
        this.prompts.unshift(prompt)
        this.displayImages()
    }
}