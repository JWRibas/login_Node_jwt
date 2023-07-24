const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#login-button');


// Adiciona um evento de clique ao botão de login
loginButton.addEventListener('click', () => {
  // Obtém os valores dos campos de entrada
  const email = emailInput.value;
  const password = passwordInput.value;

  // Valida os campos de entrada
  if (!email || !password) {
    alert('Por favor, preencha todos os campos');
    return;
  }

  // Envia uma solicitação de login para o servidor
  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.msg) {
        alert(data.msg);
      } else {
        // Login bem-sucedido
        // Redireciona o usuário para a página inicial
        window.location.href = '/';
      }
    });
});

const togglePasswordVisibilityButton = document.querySelector('#toggle-password-visibility');

// Adiciona um evento de clique ao botão de alternar a visibilidade da senha
togglePasswordVisibilityButton.addEventListener('click', () => {
  // Alterna o atributo type do elemento input de password para text e vice-versa
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
});
