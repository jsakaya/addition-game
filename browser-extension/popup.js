document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  
  try {
    const response = await fetch('http://localhost:8765', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'version',
        version: 6
      })
    });
    
    if (response.ok) {
      statusDiv.textContent = 'Connected to Anki';
      statusDiv.className = 'status connected';
    } else {
      throw new Error('Failed to connect');
    }
  } catch (error) {
    statusDiv.textContent = 'Not connected to Anki';
    statusDiv.className = 'status disconnected';
  }
}); 