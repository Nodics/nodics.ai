"use strict";
/** @module checkoutCore/utils/statusDefinitions @description Customer-safe Checkout payment outcome failures. @layer utility @owner checkoutCore */
module.exports = {
  ERR_CHECKOUT_PAYMENT_DECLINED: {
    code: "402",
    message:
      "The payment was declined. Choose another payment method and try again.",
  },
  ERR_CHECKOUT_PAYMENT_CANCELLED: {
    code: "409",
    message:
      "The payment was cancelled. Your cart is available when you are ready to try again.",
  },
  ERR_CHECKOUT_PAYMENT_UNCONFIRMED: {
    code: "409",
    message:
      "Payment authorization could not be confirmed. No order was placed. Check the payment status before trying again.",
  },
};
