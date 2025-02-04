const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sequelize } = require("../database");
const sendMail = require("../jobs/mail");
const OTP = require("../models/Otp");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error in database" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
    });
    const otp = Math.floor(Math.random() * 9000) + 1000;
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const message = `
      <p>🔐 <strong>Your One-Time Password (OTP)</strong></p>
      <p>Dear User,</p>
      <p>Thank you for registering with us. To verify your email, please use the following OTP:</p>

      <h2 style="text-align: center; background-color: #f8f9fa; padding: 10px; border-radius: 5px; display: inline-block;">
        <strong>${otp}</strong>
      </h2>

      <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.</p>

      <p>If you did not request this, please ignore this email.</p>

      <p>Best Regards,<br>
      <strong>Price Tracker</strong></p>`;
    const mailOptions = {
      from: "satyamvatsal7@gmail.com",
      to: email,
      subject: "Your OTP code for Registeration",
      html: message,
    };
    await OTP.create({ email, otp, expiresAt: otpExpiry });
    await sendMail(mailOptions);
    res.status(201).json({ message: "OTP sent to mail. Please Verify" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid Credentials" });
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res.status(400).json({ error: "Invalid Credentials" });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );
    res.status(200).json({ token, message: "Login Successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.status(200).json({ message: "Logout Successful" });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const storedOtp = await OTP.findOne({ where: { email } });
    if (!storedOtp) {
      return res
        .status(400)
        .json({ error: "No OTP found. Request a new one." });
    }
    if (storedOtp.otp != otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }
    if (new Date() > storedOtp.expiresAt) {
      return res
        .status(400)
        .json({ error: "OTP expired. Resquest a new one." });
    }
    await User.update({ isVerified: true }, { where: { email } });
    await OTP.destroy({ where: { email } });
    return res.status(200).json({ message: "Email successfully verified." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error verifying OTP" });
  }
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email not registered" });
    }
    const otp = Math.floor(Math.random() * 9000) + 1000;
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.upsert({ email, otp, expiresAt: otpExpiry });
    const message = `
      <p>🔐 <strong>Your One-Time Password (OTP)</strong></p>
      <p>Dear User,</p>
      <p>Your new OTP code is :</p>

      <h2 style="text-align: center; background-color: #f8f9fa; padding: 10px; border-radius: 5px; display: inline-block;">
        <strong>${otp}</strong>
      </h2>

      <p>This OTP is valid for the next <strong>10 minutes</strong>. Please do not share it with anyone.</p>

      <p>If you did not request this, please ignore this email.</p>

      <p>Best Regards,<br>
      <strong>Price Tracker</strong></p>`;
    const mailOptions = {
      from: "satyamvatsal7@gmail.com",
      to: email,
      subject: "Your OTP code for Registeration",
      html: message,
    };
    await sendMail(mailOptions);
    res.status(200).json({ message: "OTP resend successfully" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
