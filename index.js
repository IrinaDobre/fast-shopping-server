const express = require("express");
const bodyParser = require('body-parser')
const userRoutes = require('./routes/user_route.js')

const app = express();
// This is a sample test API key. Sign in to see examples pre-filled with your key.
const stripe = require("stripe")("sk_test_51IxIZyCZBtHrKicBBEe21P2ZI1BKibmMw9vNa53ONTGvn5rbP6I2aGOSDZz3GzAPD4usOXbIlyvvQ4CnFaEdvlCq006cjx4CiE");

app.use(express.static("."));
app.use(express.json());

const calculateOrderAmount = items => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  console.log("test")
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd"
  });
  console.log("secret" + paymentIntent.client_secret)

  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

app.use("/user", userRoutes)


app.listen(8080, () => console.log('Node server listening on port ' + 8080));

module.exports = app;
