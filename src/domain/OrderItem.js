class OrderItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  getProductId() {
    return this.product.id;
  }

  getProductName() {
    return this.product.name;
  }

  getSubtotal() {
    return this.product.price * this.quantity;
  }

  getWeight() {
    return this.product.weight * this.quantity;
  }
}

module.exports = OrderItem;
