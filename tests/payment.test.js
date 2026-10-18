const test = require("node:test");
const assert = require("node:assert");
const ProductRepository = require("../src/repositories/ProductRepository");
const PaymentProcessor = require("../src/services/payment/PaymentProcessor");
const PixPayment = require("../src/services/payment/PixPayment");
const CreditCardPayment = require("../src/services/payment/CreditCardPayment");
const BoletoPayment = require("../src/services/payment/BoletoPayment");
const { createOrder } = require("./helpers");

const repository = new ProductRepository();
const processor = new PaymentProcessor({
  pix: new PixPayment(),
  credit_card: new CreditCardPayment(),
  boleto: new BoletoPayment()
});

test("pix e aprovado na hora e da 3% de desconto", () => {
  const order = createOrder(repository, [["p2", 1]], { payment: "pix" });
  assert.deepStrictEqual(processor.process(order, 1000), { status: "approved", fee: 0, discount: 30 });
});

test("cartao a vista nao tem taxa", () => {
  const order = createOrder(repository, [["p2", 1]], { payment: "credit_card", installments: 1 });
  assert.deepStrictEqual(processor.process(order, 1000), { status: "approved", fee: 0, discount: 0 });
});

test("cartao parcelado tem taxa de 2,5%", () => {
  const order = createOrder(repository, [["p2", 1]], { payment: "credit_card", installments: 3 });
  assert.deepStrictEqual(processor.process(order, 1000), { status: "approved", fee: 25, discount: 0 });
});

test("boleto fica aguardando pagamento", () => {
  const order = createOrder(repository, [["p2", 1]], { payment: "boleto" });
  assert.deepStrictEqual(processor.process(order, 1000), { status: "waiting_payment", fee: 0, discount: 0 });
});

test("forma de pagamento desconhecida gera erro", () => {
  const order = createOrder(repository, [["p2", 1]], { payment: "cheque" });
  assert.throws(() => processor.process(order, 1000), /Forma de pagamento invalida/);
});
