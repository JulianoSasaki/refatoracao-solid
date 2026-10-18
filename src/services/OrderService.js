class OrderService {
  constructor({
    validator,
    discountCalculator,
    freightCalculator,
    paymentProcessor,
    productRepository,
    orderRepository,
    summaryBuilder,
    notificationService,
    printer,
    logger
  }) {
    this.validator = validator;
    this.discountCalculator = discountCalculator;
    this.freightCalculator = freightCalculator;
    this.paymentProcessor = paymentProcessor;
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.summaryBuilder = summaryBuilder;
    this.notificationService = notificationService;
    this.printer = printer;
    this.logger = logger;
  }

  process(order) {
    this.logger.info(`Iniciando processamento do pedido ${order.id}.`);

    this.validator.validate(order);

    const subtotal = order.getSubtotal();
    const discount = this.discountCalculator.calculate(order, subtotal);
    const freight = this.freightCalculator.calculate(order);
    const payment = this.paymentProcessor.process(order, subtotal);

    const totalDiscount = discount + payment.discount;
    const total = Number((subtotal - totalDiscount + freight + payment.fee).toFixed(2));

    if (total <= 0) {
      throw new Error("Total do pedido invalido.");
    }

    this.updateStock(order);
    order.updateStatus(payment.status);

    const summary = this.summaryBuilder.build(order, {
      subtotal,
      discount: totalDiscount,
      freight,
      paymentFee: payment.fee,
      total
    });

    this.orderRepository.save(summary);
    this.notifyCustomer(order, total);
    this.printer.print(summary);

    return summary;
  }

  updateStock(order) {
    for (const item of order.items) {
      this.productRepository.updateStock(item.getProductId(), item.quantity);
    }
  }

  notifyCustomer(order, total) {
    if (order.isConfirmed()) {
      this.notificationService.sendOrderConfirmation(order.customer, order.id, total);
    } else {
      this.logger.warn(`Pedido ${order.id} aguardando pagamento.`);
    }
  }
}

module.exports = OrderService;
