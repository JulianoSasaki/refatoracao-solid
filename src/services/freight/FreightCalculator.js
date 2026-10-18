const regionRates = {
  sudeste: { base: 20, perKg: 4 },
  sul: { base: 28, perKg: 5 },
  "centro-oeste": { base: 35, perKg: 6 },
  nordeste: { base: 45, perKg: 7 },
  norte: { base: 60, perKg: 9 }
};

const otherRegionsRate = { base: 50, perKg: 8 };

class FreightCalculator {
  constructor(rates = regionRates, defaultRate = otherRegionsRate, freeShippingCoupon = "FRETEGRATIS") {
    this.rates = rates;
    this.defaultRate = defaultRate;
    this.freeShippingCoupon = freeShippingCoupon;
  }

  calculate(order) {
    if (order.hasCoupon(this.freeShippingCoupon)) {
      return 0;
    }

    const rate = this.rates[order.getShippingRegion()] || this.defaultRate;
    return rate.base + order.getTotalWeight() * rate.perKg;
  }
}

module.exports = FreightCalculator;
