const test = require("node:test");
const assert = require("node:assert");
const ProductRepository = require("../src/repositories/ProductRepository");
const FreightCalculator = require("../src/services/freight/FreightCalculator");
const { createOrder } = require("./helpers");

const repository = new ProductRepository();
const calculator = new FreightCalculator();

test("frete usa a taxa de cada regiao", () => {
  const casos = [
    ["sudeste", 20 + 2.1 * 4],
    ["sul", 28 + 2.1 * 5],
    ["centro-oeste", 35 + 2.1 * 6],
    ["nordeste", 45 + 2.1 * 7],
    ["norte", 60 + 2.1 * 9]
  ];

  for (const [region, esperado] of casos) {
    const order = createOrder(repository, [["p1", 1]], { region });
    assert.strictEqual(calculator.calculate(order), esperado, region);
  }
});

test("regiao desconhecida usa a taxa padrao", () => {
  const order = createOrder(repository, [["p1", 1]], { region: "exterior" });
  assert.strictEqual(calculator.calculate(order), 50 + 2.1 * 8);
});

test("frete considera o peso de todos os itens", () => {
  const order = createOrder(repository, [["p1", 1], ["p2", 2]]);
  assert.strictEqual(calculator.calculate(order), 30);
});

test("cupom FRETEGRATIS zera o frete", () => {
  const order = createOrder(repository, [["p3", 2]], { region: "norte", coupon: "FRETEGRATIS" });
  assert.strictEqual(calculator.calculate(order), 0);
});
