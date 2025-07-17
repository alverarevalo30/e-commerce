import express from "express";
import {
  placeOrderCOD,
  placeOrderStripe,
  placeOrderRazorpay,
  placeOrderPaymongo,
  allOrders,
  userOrders,
  updateStatus,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/listorders", adminAuth, allOrders);
orderRouter.post("/orderstatus", adminAuth, updateStatus);

// Payment Features
orderRouter.post("/cod", authUser, placeOrderCOD);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);
orderRouter.post("/paymongo", authUser, placeOrderPaymongo);

// User Features
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
