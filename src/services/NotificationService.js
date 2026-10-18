class NotificationService {
  sendOrderConfirmation(customer, orderId, total) {
    console.log(`[EMAIL] Enviando confirmacao do pedido ${orderId} para ${customer.email}. Total: R$ ${total.toFixed(2)}`);
  }
}

module.exports = NotificationService;
