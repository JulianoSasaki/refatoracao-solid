class CustomerTypeDiscount {
  constructor(rates = { vip: 0.08, employee: 0.15 }) {
    this.rates = rates;
  }

  calculate(order, subtotal) {
    const rate = this.rates[order.getCustomerType()] || 0;
    return subtotal * rate;
  }
}

module.exports = CustomerTypeDiscount;
