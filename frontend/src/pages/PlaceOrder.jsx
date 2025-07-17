import React, { useContext, useState } from "react";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-toastify";

const placeOrderSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip Code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(1, "Phone is required"),
});

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    getProductsData,
  } = useContext(ShopContext);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: "",
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.id]: null }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const result = placeOrderSchema.safeParse(formData);
    if (!result.success) {
      // Map errors
      const fieldErrors = {};
      for (const err of result.error.errors) {
        fieldErrors[err.path[0]] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const product = products.find((p) => p._id === items);
            const size = product?.sizes?.find((s) => s.size === item);
            const quantity = cartItems[items][item];

            if (!size || size.stock < quantity) {
              toast.error(`Stock not available for ${product?.name} - ${item}`);
              return;
            }

            const itemInfo = structuredClone(product);
            itemInfo.size = item;
            itemInfo.quantity = quantity;
            orderItems.push(itemInfo);
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      switch (method) {
        // API Calls for COD
        case "cod":
          const response = await axios.post(
            backendUrl + "/api/order/cod",
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            await getProductsData();
            toast.success("Order placed successfully!");
            navigate("/orders");
          } else {
            toast.error(response.data.message || "Something went wrong");
          }
          break;

        default:
          break;
      }

      console.log(orderItems);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t "
    >
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <div className="inline-flex gap-2 items-center mb-3">
            <p className="text-gray-700 font-medium">
              DELIVERY{" "}
              <span className="text-gray-700 font-medium">INFORMATION</span>
            </p>
            <p className="w-8 sm:w-12 h-[1px] sm:h[2px] bg-gray-700"></p>
          </div>
        </div>

        {/* First Name & Last Name */}
        <div className="flex gap-3">
          <div className="flex flex-col w-full">
            <label
              htmlFor="firstName"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="lastName"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="mb-1 text-gray-700 font-medium text-sm"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`border rounded py-1.5 px-3.5 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Street */}
        <div className="flex flex-col">
          <label
            htmlFor="street"
            className="mb-1 text-gray-700 font-medium text-sm"
          >
            Street
          </label>
          <input
            id="street"
            type="text"
            placeholder="Street"
            value={formData.street}
            onChange={handleChange}
            className={`border rounded py-1.5 px-3.5 ${
              errors.street ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.street && (
            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
          )}
        </div>

        {/* City & State */}
        <div className="flex gap-3">
          <div className="flex flex-col w-full">
            <label
              htmlFor="city"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="state"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              State
            </label>
            <input
              id="state"
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        {/* Zip & Country */}
        <div className="flex gap-3">
          <div className="flex flex-col w-full">
            <label
              htmlFor="zip"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              Zip Code
            </label>
            <input
              id="zip"
              type="text"
              placeholder="Zip Code"
              value={formData.zip}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.zip ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.zip && (
              <p className="text-red-500 text-xs mt-1">{errors.zip}</p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <label
              htmlFor="country"
              className="mb-1 text-gray-700 font-medium text-sm"
            >
              Country
            </label>
            <input
              id="country"
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className={`border rounded py-1.5 px-3.5 w-full ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="mb-1 text-gray-700 font-medium text-sm"
          >
            Phone
          </label>
          <input
            id="phone"
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className={`border rounded py-1.5 px-3.5 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div>
        <div className="my-3 min-w-80">
          <CartTotal cartItems={cartItems} />
        </div>
        <div className="mt-12">
          <div className="inline-flex gap-2 items-center mb-3 text-xl sm:text-2xl">
            <p className="text-gray-700 font-medium">
              PAYMENT <span className="text-gray-700 font-medium">METHOD</span>
            </p>
            <p className="w-8 sm:w-12 h-[1px] sm:h[2px] bg-gray-700"></p>
          </div>
          {/* Payment Methods */}
          <div className="flex gap-3 flex-col xl:flex-row">
            {/* <div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "stripe" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "stripe" ? "bg-green-400" : ""
                } `}
              ></p>
              <img
                src={assets.stripe_logo}
                className="h-5 mx-4"
                alt="Stripe Logo"
              />
            </div>
            <div
              onClick={() => setMethod("razorpay")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "razorpay" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                } `}
              ></p>
              <img
                src={assets.razorpay_logo}
                className="h-5 mx-4"
                alt="Razor Pay Logo"
              />
            </div> */}
            <div
              /* onClick={() => setMethod("paymongo")} */
              onClick={() => {
                toast.info(
                  "PayMongo is not available yet. Switching to Cash on Delivery."
                );
                setMethod("cod");
              }}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "paymongo" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "paymongo" ? "bg-green-400" : ""
                } `}
              ></p>
              <img
                src={assets.paymongo_logo}
                className="h-5 mx-4"
                alt="Paymongo Logo"
              />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
                method === "cod" ? "border-green-400" : "border-gray-300"
              }`}
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                } `}
              ></p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
