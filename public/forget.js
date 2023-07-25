window.addEventListener('load', () => {
    const button = document.getElementById('register-button');
    const message = document.getElementById('message');
  
    button.addEventListener('click', async (event) => {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
  
      const response = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      message.textContent = data.msg;
    });
  });
  