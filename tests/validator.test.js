const test = require("node:test");
const assert = require("node:assert");
const ProductRepository = require("../src/repositories/ProductRepository");
const OrderItem = require("../src/domain/OrderItem");
const Product = require("../src/domain/Product");
const OrderValidator = require("../src/services/validation/OrderValidator");
const { createOrder } = require("./helpers");

const repository = new ProductRepository();
const validator = new OrderValidator(repository);

test("pedido valido passa sem erro", () => {
  const order = createOrder(repository, [["p1", 1]]);
  assert.doesNotThrow(() => validator.validate(order));
});

test("pedido sem cliente", () => {
  const order = createOrder(repository, [["p1", 1]]);
  order.customer = null;
  assert.throws(() => validator.validate(order), /Cliente obrigatorio/);
});

test("e-mail sem arroba", () => {
  const order = createOrder(repository, [["p1", 1]], { email: "ana.example.com" });
  assert.throws(() => validator.validate(order), /E-mail do cliente invalido/);
});

test("pedido sem itens", () => {
  const order = createOrder(repository, []);
  assert.throws(() => validator.validate(order), /Pedido sem itens/);
});

test("item sem produto", () => {
  const order = createOrder(repository, [["p1", 1]]);
  order.items = [new OrderItem(null, 1)];
  assert.throws(() => validator.validate(order), /Item sem produto/);
});

test("quantidade zerada", () => {
  const order = createOrder(repository, [["p1", 0]]);
  assert.throws(() => validator.validate(order), /Quantidade invalida/);
});

test("produto que nao existe no repositorio", () => {
  const order = createOrder(repository, [["p1", 1]]);
  order.items = [new OrderItem(new Product("p99", "Fantasma", "x", 10, 1, 5), 1)];
  assert.throws(() => validator.validate(order), /Produto p99 nao encontrado/);
});

test("estoque insuficiente", () => {
  const order = createOrder(repository, [["p1", 9]]);
  assert.throws(() => validator.validate(order), /Estoque insuficiente para Notebook Pro 14/);
});
