import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <div className="inline-flex gap-2 items-center mb-6">
          <p className="text-gray-700 font-medium">MY ORDERS</p>
          <p className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gray-700"></p>
        </div>

        <div className="space-y-8">
          {orders.map((order, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-md p-4 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                {/* Left Section: Order Info */}
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-800">Order ID:</span>{" "}
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {order._id}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Date:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Payment:</span>{" "}
                    {order.paymentMethod} ({order.payment ? "Paid" : "Pending"})
                  </p>
                </div>

                {/* Right Section: Total + Status */}
                <div className="flex flex-col sm:items-end gap-1 mt-4 sm:mt-0 text-sm">
                  <p className="text-gray-700 font-semibold">
                    <span className="font-medium">Total:</span> {currency}
                    {order.amount.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                    <span className="text-gray-700">{order.status}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 text-sm text-gray-700"
                  >
                    <img
                      className="w-16 sm:w-20 rounded object-cover"
                      src={item.image?.[0]}
                      alt={`${item.name} Image`}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <div className="flex flex-wrap gap-4 text-sm mt-1">
                        <p>
                          Price: {currency}
                          {item.price}
                        </p>
                        <p>Qty: {item.quantity}</p>
                        <p>Size: {item.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
