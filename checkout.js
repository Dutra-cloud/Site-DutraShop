document.addEventListener('DOMContentLoaded', () => {

    // --- BLOCO NOVO: PREENCHER DADOS DO USUÁRIO LOGADO ---
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    // Pega os dados do usuário que salvamos no sessionStorage durante o login
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));

    if (loggedInUser) {
        // Se encontrou um usuário logado, preenche os campos do formulário
        nameInput.value = loggedInUser.name;
        emailInput.value = loggedInUser.email;
    }
    // --- FIM DO BLOCO NOVO ---


    // O resto do código continua como antes, para montar o resumo do pedido e finalizar a compra
    const summaryItemsContainer = document.getElementById('summary-items');
    const summarySubtotalEl = document.getElementById('summary-subtotal');
    const summaryShippingEl = document.getElementById('summary-shipping');
    const summaryGrandTotalEl = document.getElementById('summary-grand-total');
    const checkoutForm = document.getElementById('checkout-form');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0 && window.location.pathname.endsWith('checkout.html')) {
        alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
        window.location.href = 'index.html';
        return;
    }

    function renderOrderSummary() {
        summaryItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <span class="item-name">${item.name} (x${item.quantity})</span>
                <span class="item-price">R$ ${itemTotal.toFixed(2)}</span>
            `;
            summaryItemsContainer.appendChild(itemDiv);
        });

        const shippingCost = 15.00;
        const grandTotal = subtotal + shippingCost;
        summarySubtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        summaryShippingEl.textContent = `R$ ${shippingCost.toFixed(2)}`;
        summaryGrandTotalEl.textContent = `R$ ${grandTotal.toFixed(2)}`;
    }

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = e.target.querySelector('.submit-btn');
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';

        const orderItems = cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        }));
        
        try {
            const response = await fetch('https://site-dutrashop-backend.onrender.com/api/products', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ items: orderItems }),
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o estoque no servidor.');
            }

            alert(`Obrigado pela sua compra!\n\nSeu pedido foi processado com sucesso.`);
            localStorage.removeItem('cart');
            
            // Em um sistema real, o usuário continuaria logado.
            // Para nosso projeto, vamos deslogá-lo para facilitar o fluxo de testes.
            sessionStorage.removeItem('user'); 
            
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Erro ao finalizar a compra:', error);
            alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
            submitButton.disabled = false;
            submitButton.textContent = 'Finalizar e Pagar';
        }
    });
    
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const creditCardInfo = document.getElementById('credit-card-info');
            const pixInfo = document.getElementById('pix-info');
            if (e.target.value === 'credit-card') {
                creditCardInfo.style.display = 'block';
                pixInfo.style.display = 'none';
            } else {
                creditCardInfo.style.display = 'none';
                pixInfo.style.display = 'block';
            }
        });
    });

    renderOrderSummary();
});