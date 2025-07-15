const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

class PaymentService {
  async createPaymentIntent(orderId) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Commande non trouvée');
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convertir en centimes
      currency: 'eur',
      metadata: { orderId: order._id.toString() }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: order.totalPrice
    };
  }

  async handleWebhook(signature, payload) {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const order = await Order.findById(paymentIntent.metadata.orderId);
      
      if (order) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status
        };
        await order.save();
      }
    }

    return { success: true };
  }
}

module.exports = new PaymentService();
