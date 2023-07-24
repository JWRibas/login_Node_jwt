document.addEventListener('DOMContentLoaded', () => {
    // Selecione os elementos de entrada da página de registro
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const confirmPasswordInput = document.querySelector('#confirmpassword');
    const registerButton = document.querySelector('#register-button');
  
    // Adicione um evento de clique ao botão de registro
    registerButton.addEventListener('click', () => {
      // Obtenha os valores dos campos de entrada
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
  
      // Valide os campos de entrada
      if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos');
        return;
      }
  
      if (password !== confirmPassword) {
        alert('As senhas não correspondem');
        return;
      }
  
      // Envie uma solicitação de registro para o servidor
      fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, confirmpassword })
      })
        .then(response => response.json())
        .then(data => {
          if (data.msg) {
            alert(data.msg);
          } else {
            // Registro bem-sucedido
            // Redirecione o usuário para a página de login
            window.location.href = '/login';
          }
        });
    });
  });
  