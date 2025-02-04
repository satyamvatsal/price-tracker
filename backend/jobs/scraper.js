const Product = require("../models/Product");
const Users = require("../models/User");
const axios = require("axios");
const cheerio = require("cheerio");
const cron = require("node-cron");
const sendMail = require("./mail");

const getProductPrice = async (productURL) => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:112.0) Gecko/20100101 Firefox/112.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edge/90.0.818.49",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.172",
    "Mozilla/5.0 (X11; Linux 6.10; aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/133.0 Safari/537.36",
  ];
  const randomUserAgent =
    userAgents[Math.floor(Math.random() * userAgents.length)];
  try {
    const { data } = await axios.get(productURL, {
      headers: { "User-Agent": randomUserAgent },
    });
    const $ = cheerio.load(data);
    const priceWhole = $(".a-price-whole").first().text().trim();
    if (priceWhole) {
      return priceWhole;
    } else {
      throw new Error("Price not found on the page");
    }
  } catch (err) {
    console.log(err);
    throw new Error("Error to retrieve price");
  }
};

const priceTrackerJob = () => {
  const job = cron.schedule("*/10 * * * *", async () => {
    console.log("Running scheduled price check...");

    try {
      const products = await Product.findAll();
      const priceChecks = products.map(async (product) => {
        const currentPriceString = await getProductPrice(product.productURL);
        const currentPrice = parseFloat(currentPriceString.replace(/,/g, ""));
        console.log(currentPrice);
        if (currentPrice && currentPrice <= product.updatedTriggerPrice) {
          console.log(
            `🔔 ALERT: Price for ${product.productURL} has dropped to ${currentPrice} (Trigger: ${product.updatedTriggerPrice})`,
          );
          const userMail = await Users.findOne({
            where: { id: product.createdBy },
            attributes: ["email"],
          });
          const message = `
            <p>🔔 <strong>Price Drop Alert!</strong></p>
            <p>The price for your tracked item has dropped.</p>
            <p>
              <strong>Current Price:</strong> <span style="color: green;">${currentPrice}</span><br>
              <strong>Trigger Price:</strong> <span style="color: red;">${product.updatedTriggerPrice}</span>
            </p>
            <p>
              <a href="${product.productURL}" style="display: inline-block; padding: 10px 15px; background-color: #007bff;
              color: white; text-decoration: none; border-radius: 5px;">
                🔗 View Product
              </a>
            </p>
            <p>Stay updated and happy shopping! 🎉</p>`;
          const mailOptions = {
            from: "satyamvatsal7@gmail.com",
            to: userMail.email,
            subject: "Price drop Notification",
            html: message,
          };
          try {
            await sendMail(mailOptions);
            product.updatedTriggerPrice = currentPrice - 1;
            console.log(product.updatedTriggerPrice);
            await product.save();
          } catch (err) {
            console.log(err);
          }
        }
      });

      await Promise.all(priceChecks);
    } catch (error) {
      console.error("Error in scheduled task:", error.message);
    }
  });
  job.start();
};

module.exports = priceTrackerJob;
