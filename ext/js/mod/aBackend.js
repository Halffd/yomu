/**
 * Represents a backend class that uses a Web Worker to handle fetch requests.
 */
class aBackend {
    /**
     * Initializes the aBackend class.
     */
    constructor() {
        /**
         * The Web Worker instance.
         * @type {Worker|null}
         * @private
         */
        this.worker = null;

        /**
         * Map to store pending requests.
         * @type {Map<string, {resolve: Function, reject: Function}>}
         * @private
         */
        this.pendingRequests = new Map();

        this.initializeWorker();
    }

    /**
     * Initializes the Web Worker.
     * @private
     */
    initializeWorker() {
        try {
            /** @type {string} */
            const workerCode = `
          self.onmessage = function(event) {
            const { requestId, url, options } = event.data;
      
            fetch(url, options)
              .then(response => response.json())
              .then(data => {
                self.postMessage({ requestId, response: data });
              })
              .catch(error => {
                self.postMessage({ requestId, error: error.message });
              });
          };
        `;

            /** @type {Blob} */
            const workerBlob = new Blob([workerCode], {type: 'text/javascript'});
            this.worker = new Worker(URL.createObjectURL(workerBlob));
            this.worker.onmessage = this.handleWorkerResponse.bind(this);
        } catch (error) {
            console.error('Failed to initialize the Web Worker:', error);
        }
    }

    /**
     * Sends a fetch request using the Web Worker.
     * @param {string} url The URL to fetch.
     * @param {object} options The fetch options.
     * @returns {Promise<any>} - A Promise that resolves with the fetch response or rejects with an error.
     */
    fetch(url, options) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Web Worker not initialized.'));
                return;
            }

            /** @type {string} */
            const requestId = Math.random().toString(36).substring(2);
            this.pendingRequests.set(requestId, {resolve, reject});

            this.worker.postMessage({requestId, url, options});
        });
    }

    /**
     * Handles the response received from the Web Worker.
     * @param {MessageEvent<{ requestId: string, response: any, error: string }>} event The message event containing the response data.
     * @private
     */
    handleWorkerResponse(event) {
        const {requestId, response, error} = event.data;

        const request = this.pendingRequests.get(requestId);
        if (!request) {
            console.warn('Received response for unknown request:', requestId);
            return;
        }

        if (error) {
            request.reject(new Error(error));
        } else {
            request.resolve(response);
        }

        this.pendingRequests.delete(requestId);
    }

    /**
     * Cleans up the resources used by the aBackend instance.
     */
    cleanup() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        this.pendingRequests.clear();
    }
}