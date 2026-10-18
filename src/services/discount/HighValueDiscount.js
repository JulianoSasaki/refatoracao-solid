class HighValueDiscount {
  constructor(minimumSubtotal = 8000, amount = 250) {
    this.minimumSubtotal = minimumSubtotal;
    this.amount = amount;
  }

  calculate(order, subtotal) {
    return subtotal > this.minimumSubtotal ? this.amount : 0;
  }
}

module.exports = HighValueDiscount;
