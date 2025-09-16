const stripe = require('../config/stripe');
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
const userModel = require('../models/userModel'); 

async function createProSubscription(req, res){
  try {
    const user = req.user; 

    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: user.id.toString() },
        phone: user.mobile,
      });
      stripeCustomerId = customer.id;

      await userModel.updateStripeCustomerId(user.id, stripeCustomerId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { userId: user.id.toString() },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ error: 'Failed to create subscription session' });
  }
};


async function checkSubscriptionStatus(req, res) {
    try {
        const user = req.user
        if(!user){
            return res.status(400).json({success:false,message:"user not found or unauthorized"})
        }

        const id = user.id;
        const status = await userModel.checkUserStatus(id);
        const subscription_status = status.subscription;

        return res.status(200).json({success:true,message:`User status is ${subscription_status}`})
        
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
        
    }
    
}



module.exports = {
    createProSubscription,
    checkSubscriptionStatus
}
