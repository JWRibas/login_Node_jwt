const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const button = document.getElementById('register-button');
const message = document.getElementById('message');

button.addEventListener('click', async (event) => {
  event.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  const response = await fetch('/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  const data = await response.json();

  message.textContent = data.msg;
});

