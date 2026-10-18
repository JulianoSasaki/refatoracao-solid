const test = require("node:test");
const assert = require("node:assert");
const { createOrder, createTestService } = require("./helpers");

function valores(summary) {
  const { subtotal, discount, freight, paymentFee, total, status } = summary;
  return { subtotal, discount, freight, paymentFee, total, status };
}

test("pedido do index gera o mesmo resultado do sistema original", () => {
  const { service, productRepository } = createTestService();
  const order = createOrder(productRepository, [["p1", 1], ["p2", 2]], {
    type: "vip",
    coupon: "TECH10",
    payment: "credit_card",
    installments: 3
  });

  const summary = service.process(order);

  assert.deepStrictEqual(valores(summary), {
    subtotal: 6440,
    discount: 1159.2,
    freight: 30,
    paymentFee: 161,
    total: 5471.8,
    status: "confirmed"
  });
  assert.strictEqual(summary.city, "Presidente Prudente");
  assert.deepStrictEqual(summary.items[1], { productId: "p2", name: "Mouse Sem Fio", quantity: 2, subtotal: 240 });
});

test("outros cenarios batem com os valores do sistema original", () => {
  const cenarios = [
    [{ type: "employee", region: "sul", coupon: "FRETEGRATIS", payment: "pix" }, [["p3", 2]],
      { subtotal: 2900, discount: 522, freight: 0, paymentFee: 0, total: 2378, status: "confirmed" }],
    [{ region: "nordeste", payment: "boleto" }, [["p4", 3]],
      { subtotal: 1140, discount: 0, freight: 63.9, paymentFee: 0, total: 1203.9, status: "waiting_payment" }],
    [{ region: "norte", payment: "credit_card" }, [["p1", 2]],
      { subtotal: 12400, discount: 250, freight: 97.8, paymentFee: 0, total: 12247.8, status: "confirmed" }],
    [{ type: "vip", region: "centro-oeste", coupon: "TECH10", payment: "pix" }, [["p1", 1], ["p3", 1], ["p4", 1]],
      { subtotal: 8030, discount: 1936.3, freight: 85.4, paymentFee: 0, total: 6179.1, status: "confirmed" }],
    [{ region: "exterior", payment: "boleto" }, [["p2", 1]],
      { subtotal: 120, discount: 0, freight: 51.6, paymentFee: 0, total: 171.6, status: "waiting_payment" }]
  ];

  for (const [options, items, esperado] of cenarios) {
    const { service, productRepository } = createTestService();
    const order = createOrder(productRepository, items, options);
    assert.deepStrictEqual(valores(service.process(order)), esperado);
  }
});

test("processar o pedido baixa o estoque e salva o resumo", () => {
  const { service, productRepository, orderRepository } = createTestService();
  const order = createOrder(productRepository, [["p1", 1], ["p2", 2]]);

  service.process(order);

  assert.strictEqual(productRepository.findById("p1").stock, 7);
  assert.strictEqual(productRepository.findById("p2").stock, 28);
  assert.strictEqual(orderRepository.findAll().length, 1);
});

test("pedido confirmado envia notificacao para o cliente", () => {
  const { service, productRepository, notifications, warnings } = createTestService();
  const order = createOrder(productRepository, [["p2", 1]], { payment: "pix" });

  const summary = service.process(order);

  assert.deepStrictEqual(notifications, [{ email: "ana@example.com", orderId: "o1", total: summary.total }]);
  assert.strictEqual(warnings.length, 0);
});

test("pedido no boleto nao notifica e registra aviso", () => {
  const { service, productRepository, notifications, warnings } = createTestService();
  const order = createOrder(productRepository, [["p2", 1]], { payment: "boleto" });

  service.process(order);

  assert.strictEqual(notifications.length, 0);
  assert.deepStrictEqual(warnings, ["Pedido o1 aguardando pagamento."]);
});

test("pagamento invalido nao mexe no estoque", () => {
  const { service, productRepository, orderRepository } = createTestService();
  const order = createOrder(productRepository, [["p1", 1]], { payment: "cheque" });

  assert.throws(() => service.process(order), /Forma de pagamento invalida/);
  assert.strictEqual(productRepository.findById("p1").stock, 8);
  assert.strictEqual(orderRepository.findAll().length, 0);
});
