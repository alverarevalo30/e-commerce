import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Placing orders using COD method
const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    for (const item of items) {
      const product = await productModel.findById(item._id);
      if (!product) continue;

      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);

      if (sizeIndex !== -1) {
        product.sizes[sizeIndex].stock -= item.quantity;
        if (product.sizes[sizeIndex].stock < 0) {
          product.sizes[sizeIndex].stock = 0;
        }
      }

      await product.save();
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe method
const placeOrderStripe = async (req, res) => {};

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {};

// Placing orders using Paymongo method
const placeOrderPaymongo = async (req, res) => {};

// All Orders data for Admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data for Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    const orders = await orderModel.find({ userId });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update Order Status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrderCOD,
  placeOrderStripe,
  placeOrderRazorpay,
  placeOrderPaymongo,
  allOrders,
  userOrders,
  updateStatus,
};
