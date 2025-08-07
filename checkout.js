// ARQUIVO checkout.js (COM MAIS LOGS)
document.addEventListener('DOMContentLoaded', () => {
    // Seletores e lógica de preenchimento de dados do usuário (sem alterações)
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    if (loggedInUser) { nameInput.value = loggedInUser.name; emailInput.value = loggedInUser.email; } 
    else { alert("Você precisa estar logado para finalizar a compra."); window.location.href = 'index.html'; return; }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutForm = document.getElementById('checkout-form');
    function renderOrderSummary() { /* ...código existente... */ }
    
    // Lógica de submissão do formulário (ATUALIZADA)
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('.submit-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';

        const orderPayload = {
            userId: loggedInUser.id,
            items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
        };

        try {
            const response = await fetch('https.site-dutrashop-backend.onrender.com/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            // Tenta ler a resposta do servidor, mesmo que seja um erro
            const responseData = await response.json();

            if (!response.ok) {
                // Loga a resposta de erro completa que veio do servidor
                console.error("Erro recebido da API:", responseData);
                throw new Error(responseData.error || 'Falha ao criar o pedido no servidor.');
            }

            alert(`Compra realizada com sucesso! ID do seu Pedido: ${responseData.orderId}`);
            localStorage.removeItem('cart');
            sessionStorage.removeItem('user');
            window.location.href = 'index.html';

        } catch (error) {
            // Loga o erro completo no console do NAVEGADOR
            console.error('--- ERRO DETALHADO NO FRONT-END ---', error);
            alert('Ocorreu um erro ao processar seu pedido. Por favor, verifique o console (F12) para mais detalhes.');
            submitButton.disabled = false;
            submitButton.textContent = 'Finalizar e Pagar';
        }
    });
    
    renderOrderSummary();
});