class CouponDiscount {
  constructor(coupons = { TECH10: 0.1 }) {
    this.coupons = coupons;
  }

  calculate(order, subtotal) {
    const rate = this.coupons[order.couponCode] || 0;
    return subtotal * rate;
  }
}

module.exports = CouponDiscount;
