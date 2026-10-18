const Address = require("../src/domain/Address");
const Customer = require("../src/domain/Customer");
const Order = require("../src/domain/Order");
const OrderItem = require("../src/domain/OrderItem");
const ProductRepository = require("../src/repositories/ProductRepository");
const OrderRepository = require("../src/repositories/OrderRepository");
const createOrderService = require("../src/createOrderService");

function createCustomer({ type = "regular", region = "sudeste", email = "ana@example.com" } = {}) {
  const address = new Address("Rua A", "10", "Presidente Prudente", "SP", "19000-000", region);
  return new Customer("c1", "Ana Souza", email, "18999990000", type, address);
}

function createOrder(productRepository, items, options = {}) {
  const orderItems = items.map(([productId, quantity]) => new OrderItem(productRepository.findById(productId), quantity));

  return new Order(
    "o1",
    createCustomer(options),
    orderItems,
    options.coupon || null,
    options.payment || "pix",
    options.installments || 1
  );
}

function createTestService() {
  const productRepository = new ProductRepository();
  const orderRepository = new OrderRepository();
  const notifications = [];
  const warnings = [];

  const service = createOrderService({
    productRepository,
    orderRepository,
    notificationService: {
      sendOrderConfirmation: (customer, orderId, total) => notifications.push({ email: customer.email, orderId, total })
    },
    printer: { print: () => {} },
    logger: { info: () => {}, warn: (message) => warnings.push(message) }
  });

  return { service, productRepository, orderRepository, notifications, warnings };
}

module.exports = { createCustomer, createOrder, createTestService };
