const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const stripe = require('stripe')('sk_test_51CpTcJBHf6MCUdTui24OIrTzm2rYDCpETzOtTuWev5O7yV3IT8eJknT7Bpdx7Pqswki1nnBveNji6Lwqg3RgaBGG00UOyo6sCX');


router.get('/api/v1/profile/:platform/:gamertag', async (req, res) => {
    try {
        const headers = {
            'TRN-Api-Key': process.env.TRACKER_API_KEY
        };

        const { platform, gamertag} = req.params;

        const response = await fetch(
                `${process.env.TRACKER_API_URL}/profile/${platform}/${gamertag}`, 
                { headers }
            );
        
        const data = await response.json();

        if (data.errors && data.errors.length > 0) {
            return res.status(404).json({
                message: 'El usuario no está registrado!'
            });
        }
        
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
});
router.get('/api/v2/profile/:platform/:gamertag', (req, res) => {
    console.log(req.params.gamertag, req.params.platform); 
    res.send('hello2');
});

router.post('/api/v1/charge', async (req, res) => {
  console.log(req.body);
    
  try {
    const customer =  await stripe.customers.create(
      {
        name: req.body.titular,
        email: req.body.email,
        description: `creation of ${req.body.email} as a new Customer`,
      }
    ); console.log(customer);

    const pm = await stripe.paymentMethods.create(
      {
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2020,
          cvc: '222',
        },
      }
    ); console.log(pm);
    
    const pma = await stripe.paymentMethods.attach(
      pm.id, 
      {
        customer: customer.id
      }
    ); console.log(pma);
    
    const intent =  await stripe.paymentIntents.create(
      {
        amount: req.body.amount,
        currency: 'usd',
        payment_method_types: ['card'],
        customer: customer.id,
        payment_method: pm.id,
        // source: 'tok_visa', //pma.id,// //req.body.stripeToken,
      }
    ); console.log(intent);

    const confirm =  await stripe.paymentIntents.confirm(
      intent.id,
      { payment_method: pm.id }
    ); console.log(confirm);
    
    const prod = await stripe.products.create(
      {name: 'Plan Noob'}
    );console.log(prod);

    const plan = await stripe.plans.create(
      {
        amount: 999,
        currency: 'usd',
        interval: 'month',
        product: prod.id,
      }
    );console.log(plan);

    const subs = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{
          plan: plan.id
        }],
        default_payment_method: pm.id,
        cancel_at_period_end: false,
      }
    );console.log(subs);

    res.status(200).json({
      message:'success'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
        message: 'Server Error'
    });
  }
});

module.exports = router;