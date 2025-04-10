document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  
  try {
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'version',
        version: 6
      })
    });

    // Check if we got any response text
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from Anki');
    }

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response from Anki');
    }
    
    if (response.ok && data.result) {
      statusDiv.textContent = 'Connected to Anki';
      statusDiv.className = 'status connected';
    } else {
      throw new Error(data.error || 'Failed to connect');
    }
  } catch (error) {
    console.error('Anki connection error:', error);
    let message = 'Not connected to Anki. ';
    if (error.message === 'Empty response from Anki' || error.message === 'Invalid response from Anki') {
      message += 'Make sure Anki is running and AnkiConnect add-on is installed.';
    } else {
      message += error.message;
    }
    statusDiv.textContent = message;
    statusDiv.className = 'status disconnected';
  }
}); 