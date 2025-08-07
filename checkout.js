document.addEventListener('DOMContentLoaded', () => {

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));

    if (loggedInUser) {
        nameInput.value = loggedInUser.name;
        emailInput.value = loggedInUser.email;
    } else {
        alert("Você precisa estar logado para finalizar a compra.");
        window.location.href = 'index.html';
        return;
    }

    const summaryItemsContainer = document.getElementById('summary-items');
    const summarySubtotalEl = document.getElementById('summary-subtotal');
    const summaryShippingEl = document.getElementById('summary-shipping');
    const summaryGrandTotalEl = document.getElementById('summary-grand-total');
    const checkoutForm = document.getElementById('checkout-form');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
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

        const orderPayload = {
            userId: loggedInUser.id,
            items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
        };

        try {
            const response = await fetch('https://site-dutrashop-backend.onrender.com/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.error || 'Falha ao criar o pedido no servidor.');
            }

            alert(`Compra realizada com sucesso! ID do seu Pedido: ${responseData.orderId}`);
            localStorage.removeItem('cart');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Erro detalhado ao finalizar a compra:', error);
            alert(`Ocorreu um erro ao processar seu pedido: ${error.message}`);
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