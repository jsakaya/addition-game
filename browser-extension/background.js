// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAnkiConnection') {
    checkAnkiConnection().then(sendResponse);
    return true; // Required for async response
  }
  
  if (request.action === 'saveCard') {
    saveCardToAnki(request.data).then(sendResponse);
    return true; // Required for async response
  }
});

// Function to check Anki connection
async function checkAnkiConnection() {
  try {
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requestPermission',
        version: 6,
      }),
    });
    
    const data = await response.json();
    return {
      success: data.result && data.result.permission === 'granted',
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to save card to Anki
async function saveCardToAnki(cardData) {
  try {
    // First create the deck if it doesn't exist
    await fetch('http://localhost:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createDeck',
        version: 6,
        params: {
          deck: 'Addition'
        }
      }),
    });

    // Then add the note
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
          note: {
            deckName: 'Addition',
            modelName: 'Basic',
            fields: {
              Front: cardData.front,
              Back: cardData.back
            },
            tags: ['addition-game', `level-${cardData.level}`]
          }
        }
      }),
    });

    const data = await response.json();
    return {
      success: !data.error,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
} 