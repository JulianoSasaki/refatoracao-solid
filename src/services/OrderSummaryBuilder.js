class OrderSummaryBuilder {
  build(order, values) {
    return {
      id: order.id,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      city: order.customer.getCity(),
      state: order.customer.getState(),
      items: order.items.map((item) => ({
        productId: item.getProductId(),
        name: item.getProductName(),
        quantity: item.quantity,
        subtotal: item.getSubtotal()
      })),
      subtotal: values.subtotal,
      discount: Number(values.discount.toFixed(2)),
      freight: Number(values.freight.toFixed(2)),
      paymentFee: Number(values.paymentFee.toFixed(2)),
      total: values.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt
    };
  }
}

module.exports = OrderSummaryBuilder;
