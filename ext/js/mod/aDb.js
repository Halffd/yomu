// background.js

/**
 * Handles storing and retrieving data using Firebase.
 */
export async function db() {
  try {
    // Replace with your Firebase project configuration
    const firebaseConfig = await (await fetch('js/admin/key.json')).json()

    // Initialize Firebase
    initializeFirebase(firebaseConfig);

    return firebaseConfig
  } catch (error) {
    console.error('Error:', error);
  }
}
/**
 * Initializes Firebase with the provided configuration.
 * @param {Object} config - The Firebase project configuration.
 */
export function initializeFirebase(config) {
  firebase.initializeApp(config);
}

/**
 * Stores data in the Firebase Realtime Database.
 * @param {Object} oc - The data object to be stored.
 * @returns {Promise} - A promise that resolves when the data is stored successfully.
 */
export function store(oc) {
  return new Promise((resolve, reject) => {
    try {
      const database = firebase.database();
      const dataRef = database.ref('save'); // Use 'save' as the collection name

      // Generate a new key for the object
      const newRef = dataRef.push();
      
      // Set the object at the generated key
      newRef
        .set(oc)
        .then(() => {
          resolve(newRef.key);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Retrieves data from the Firebase Realtime Database.
 * @returns {Promise} - A promise that resolves with the retrieved data.
 */
export function retrieve() {
  return new Promise((resolve, reject) => {
    try {
      const database = firebase.database();
      const dataRef = database.ref('save'); // Use 'save' as the collection name

      // Retrieve the data from the collection
      dataRef
        .once('value')
        .then((snapshot) => {
          resolve(snapshot.val());
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}