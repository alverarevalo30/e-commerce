import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { LuTrash2 } from "react-icons/lu";
import CartTotal from "../components/CartTotal";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    getProductsData,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  const validItems = cartData.filter((item) => item.valid !== false);
  const invalidItems = cartData.filter((item) => item.valid === false);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems]);

  useEffect(() => {
    const validateCartAgainstStock = async () => {
      let updatedCart = [...cartData];
      let cartChanged = false;

      for (let i = 0; i < updatedCart.length; i++) {
        const item = updatedCart[i];
        const product = products.find((p) => p._id === item._id);
        const sizeData = product?.sizes?.find((s) => s.size === item.size);

        if (!sizeData || sizeData.stock === 0) {
          updatedCart[i] = {
            ...item,
            valid: false,
            reason: "Out of stock",
          };
          cartChanged = true;
        } else if (sizeData.stock < item.quantity) {
          const newQty = sizeData.stock;
          updatedCart[i] = {
            ...item,
            quantity: newQty,
          };
          cartChanged = true;
        }
      }

      const hasDifference =
        JSON.stringify(updatedCart) !== JSON.stringify(cartData);

      if (cartChanged && hasDifference) {
        setCartData(updatedCart);
      }
    };

    if (products.length > 0 && cartData.length > 0) {
      validateCartAgainstStock();
    }
  }, [products, cartData]);

  useEffect(() => {
    const handleFocus = async () => {
      await getProductsData();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <div className="inline-flex gap-2 items-center mb-3">
          <p className="text-gray-700 font-medium">
            YOUR <span className="text-gray-700 font-medium">CART</span>
          </p>
          <p className="w-8 sm:w-12 h-[1px] sm:h[2px] bg-gray-700"></p>
        </div>
      </div>
      <div>
        {validItems.length === 0 && invalidItems.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            Nothing here yet. Start shopping and fill your cart!
          </p>
        ) : (
          <>
            {validItems.map((item, index) => {
              const productData = products.find(
                (product) => product._id === item._id
              );
              return (
                <div
                  key={`valid-${index}`}
                  className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
                >
                  <div className="flex items-start gap-6">
                    <img
                      className="w-16 sm:w-20"
                      src={productData.image[0]}
                      alt="Product Image"
                    />
                    <div>
                      <p className="text-xs sm:text-lg font-medium">
                        {productData.name}
                      </p>
                      <div className="flex items-center gap-5 mt-2">
                        <p>
                          {currency}
                          {productData.price}
                        </p>
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                          {item.size}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <label className="text-xs text-gray-500">Quantity</label>
                    <input
                      className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        if (isNaN(newQuantity) || newQuantity < 1) return;

                        const selectedProduct = products.find(
                          (p) => p._id === item._id
                        );
                        const sizeData = selectedProduct?.sizes?.find(
                          (s) => s.size === item.size
                        );
                        const availableStock = sizeData?.stock ?? 0;

                        if (newQuantity > availableStock) {
                          toast.error(
                            `Only ${availableStock} item(s) available for size ${item.size}`
                          );
                          return;
                        }

                        updateQuantity(item._id, item.size, newQuantity);
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      Max:{" "}
                      {products
                        .find((p) => p._id === item._id)
                        ?.sizes?.find((s) => s.size === item.size)?.stock ?? 0}
                    </p>
                  </div>
                  <LuTrash2
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className="w-4 h-4 mr-4 sm:w-5 sm:h-5 cursor-pointer"
                  />
                </div>
              );
            })}

            {/* Invalid Items Section */}
            {invalidItems.length > 0 && (
              <div className="mt-10 pt-6 border-t border-dashed border-red-300">
                <p className="text-sm text-red-600 font-semibold mb-4">
                  Unavailable Items
                </p>
                {invalidItems.map((item, index) => {
                  const productData = products.find((p) => p._id === item._id);
                  return (
                    <div
                      key={`invalid-${index}`}
                      className="py-4 border-t border-b text-gray-400 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 bg-red-50"
                    >
                      <div className="flex items-start gap-6">
                        <img
                          className="w-16 sm:w-20 opacity-40"
                          src={productData.image[0]}
                          alt="Unavailable Product"
                        />
                        <div>
                          <p className="text-xs sm:text-lg font-medium line-through">
                            {productData.name}
                          </p>
                          <div className="flex items-center gap-5 mt-2 text-sm">
                            <p className="line-through">
                              {currency}
                              {productData.price}
                            </p>
                            <p className="px-2 sm:px-3 sm:py-1 border bg-slate-100">
                              {item.size}
                            </p>
                          </div>
                          <p className="text-xs text-red-500 mt-1">
                            {item.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-1">
                        <label className="text-xs text-gray-400">
                          Quantity
                        </label>
                        <input
                          className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 bg-gray-100 text-gray-400 cursor-not-allowed"
                          type="number"
                          disabled
                          value={item.quantity}
                          readOnly
                        />
                      </div>

                      <LuTrash2
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className="w-4 h-4 mr-4 sm:w-5 sm:h-5 cursor-pointer text-gray-400 hover:text-red-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
      {validItems.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end ">
              <button
                onClick={() => navigate("/place-order")}
                className="bg-black text-white text-sm my-8 px-8 py-3"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
