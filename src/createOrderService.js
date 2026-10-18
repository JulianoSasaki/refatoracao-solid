const ProductRepository = require("./repositories/ProductRepository");
const OrderRepository = require("./repositories/OrderRepository");
const NotificationService = require("./services/NotificationService");
const OrderService = require("./services/OrderService");
const OrderSummaryBuilder = require("./services/OrderSummaryBuilder");
const OrderPrinter = require("./services/OrderPrinter");
const OrderValidator = require("./services/validation/OrderValidator");
const DiscountCalculator = require("./services/discount/DiscountCalculator");
const CustomerTypeDiscount = require("./services/discount/CustomerTypeDiscount");
const CouponDiscount = require("./services/discount/CouponDiscount");
const HighValueDiscount = require("./services/discount/HighValueDiscount");
const FreightCalculator = require("./services/freight/FreightCalculator");
const PaymentProcessor = require("./services/payment/PaymentProcessor");
const PixPayment = require("./services/payment/PixPayment");
const CreditCardPayment = require("./services/payment/CreditCardPayment");
const BoletoPayment = require("./services/payment/BoletoPayment");
const Logger = require("./utils/Logger");

function createOrderService({
  productRepository = new ProductRepository(),
  orderRepository = new OrderRepository(),
  notificationService = new NotificationService(),
  printer = new OrderPrinter(),
  logger = new Logger()
} = {}) {
  return new OrderService({
    validator: new OrderValidator(productRepository),
    discountCalculator: new DiscountCalculator([
      new CustomerTypeDiscount(),
      new CouponDiscount(),
      new HighValueDiscount()
    ]),
    freightCalculator: new FreightCalculator(),
    paymentProcessor: new PaymentProcessor({
      pix: new PixPayment(),
      credit_card: new CreditCardPayment(),
      boleto: new BoletoPayment()
    }),
    productRepository,
    orderRepository,
    summaryBuilder: new OrderSummaryBuilder(),
    notificationService,
    printer,
    logger
  });
}

module.exports = createOrderService;
