const test = require("node:test");
const assert = require("node:assert");
const ProductRepository = require("../src/repositories/ProductRepository");
const CustomerTypeDiscount = require("../src/services/discount/CustomerTypeDiscount");
const CouponDiscount = require("../src/services/discount/CouponDiscount");
const HighValueDiscount = require("../src/services/discount/HighValueDiscount");
const DiscountCalculator = require("../src/services/discount/DiscountCalculator");
const { createOrder } = require("./helpers");

const repository = new ProductRepository();

test("cliente vip ganha 8% de desconto", () => {
  const order = createOrder(repository, [["p2", 1]], { type: "vip" });
  assert.strictEqual(new CustomerTypeDiscount().calculate(order, 1000), 80);
});

test("funcionario ganha 15% de desconto", () => {
  const order = createOrder(repository, [["p2", 1]], { type: "employee" });
  assert.strictEqual(new CustomerTypeDiscount().calculate(order, 1000), 150);
});

test("cliente comum nao ganha desconto por tipo", () => {
  const order = createOrder(repository, [["p2", 1]], { type: "regular" });
  assert.strictEqual(new CustomerTypeDiscount().calculate(order, 1000), 0);
});

test("cupom TECH10 da 10% e FRETEGRATIS nao da desconto no valor", () => {
  const comTech10 = createOrder(repository, [["p2", 1]], { coupon: "TECH10" });
  const comFreteGratis = createOrder(repository, [["p2", 1]], { coupon: "FRETEGRATIS" });

  assert.strictEqual(new CouponDiscount().calculate(comTech10, 1000), 100);
  assert.strictEqual(new CouponDiscount().calculate(comFreteGratis, 1000), 0);
});

test("pedido acima de 8000 ganha 250 de desconto", () => {
  const order = createOrder(repository, [["p2", 1]]);
  const rule = new HighValueDiscount();

  assert.strictEqual(rule.calculate(order, 8000), 0);
  assert.strictEqual(rule.calculate(order, 8000.01), 250);
});

test("calculadora soma todas as regras", () => {
  const order = createOrder(repository, [["p2", 1]], { type: "vip", coupon: "TECH10" });
  const calculator = new DiscountCalculator([new CustomerTypeDiscount(), new CouponDiscount(), new HighValueDiscount()]);

  assert.strictEqual(calculator.calculate(order, 10000), 800 + 1000 + 250);
});

test("da para adicionar uma regra nova sem mexer na calculadora", () => {
  const order = createOrder(repository, [["p2", 1]]);
  const descontoFixo = { calculate: () => 50 };
  const calculator = new DiscountCalculator([new CustomerTypeDiscount(), descontoFixo]);

  assert.strictEqual(calculator.calculate(order, 1000), 50);
});
