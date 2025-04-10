// Create a bridge object to handle communication between the webpage and the extension
const createAnkiBridge = () => {
  console.log('Creating Anki bridge...');
  const bridge = {
    checkConnection: () => {
      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data.type === 'ANKI_CONNECTION_STATUS') {
            window.removeEventListener('message', handler);
            resolve(event.data);
          }
        };
        window.addEventListener('message', handler);
        window.postMessage({ type: 'ANKI_CHECK_CONNECTION' }, '*');
      });
    },
    
    saveCard: (card) => {
      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data.type === 'ANKI_SAVE_RESULT') {
            window.removeEventListener('message', handler);
            resolve(event.data);
          }
        };
        window.addEventListener('message', handler);
        window.postMessage({ 
          type: 'ANKI_SAVE_CARD',
          card: card
        }, '*');
      });
    }
  };

  // Inject the bridge into the webpage
  window.ankiBridge = bridge;
  
  // Dispatch an event to notify the webpage that the bridge is ready
  const event = new CustomEvent('ankiBridgeReady', { detail: bridge });
  window.dispatchEvent(event);
  console.log('Anki bridge created and ready');
};

// Check if the origin is allowed
const isAllowedOrigin = (origin) => {
  const allowedOrigins = [
    'https://subtle-daifuku-10602c.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  return allowedOrigins.includes(origin);
};

// Listen for messages from the webpage
window.addEventListener('message', async (event) => {
  // Only accept messages from allowed origins
  if (!isAllowedOrigin(event.origin)) {
    console.log('Ignoring message from unauthorized origin:', event.origin);
    return;
  }

  console.log('Received message:', event.data);

  if (event.data.type === 'ANKI_CHECK_CONNECTION') {
    console.log('Checking Anki connection...');
    const response = await chrome.runtime.sendMessage({
      action: 'checkAnkiConnection'
    });
    console.log('Anki connection response:', response);
    window.postMessage({
      type: 'ANKI_CONNECTION_STATUS',
      success: response.success,
      data: response.data
    }, event.origin);
  }

  if (event.data.type === 'ANKI_SAVE_CARD') {
    console.log('Saving card:', event.data.card);
    const response = await chrome.runtime.sendMessage({
      action: 'saveCard',
      data: event.data.card
    });
    console.log('Save card response:', response);
    window.postMessage({
      type: 'ANKI_SAVE_RESULT',
      success: response.success,
      data: response.data
    }, event.origin);
  }
});

// Create the bridge when the content script loads
console.log('Content script loaded, creating bridge...');
createAnkiBridge(); 