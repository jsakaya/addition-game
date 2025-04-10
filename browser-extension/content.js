// Listen for messages from the webpage
window.addEventListener('message', async (event) => {
  // Only accept messages from our webpage
  if (event.origin !== 'https://subtle-daifuku-10602c.netlify.app') return;

  if (event.data.type === 'ANKI_CHECK_CONNECTION') {
    const response = await chrome.runtime.sendMessage({
      action: 'checkAnkiConnection'
    });
    window.postMessage({
      type: 'ANKI_CONNECTION_STATUS',
      success: response.success,
      data: response.data
    }, '*');
  }

  if (event.data.type === 'ANKI_SAVE_CARD') {
    const response = await chrome.runtime.sendMessage({
      action: 'saveCard',
      data: event.data.card
    });
    window.postMessage({
      type: 'ANKI_SAVE_RESULT',
      success: response.success,
      data: response.data
    }, '*');
  }
});

// Inject a script to handle communication
const script = document.createElement('script');
script.textContent = `
  window.ankiBridge = {
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
`;
document.documentElement.appendChild(script); 