import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        return null;
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex flex-col overflow-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt="Product Image"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="Product Image" />
          </div>
        </div>
        {/* Product Information */}
        <div className="flex-1 ">
          <h1 className="font-medium text-2xl mt-2"> {productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <p className="pr-1">5.0</p>
            <img src={assets.star_icon} alt="Star Icon" className="w-3" />
            <img src={assets.star_icon} alt="Star Icon" className="w-3" />
            <img src={assets.star_icon} alt="Star Icon" className="w-3" />
            <img src={assets.star_icon} alt="Star Icon" className="w-3" />
            <img src={assets.star_icon} alt="Star Icon" className="w-3" />
            <p className="px-2">|</p>
            <p className="pr-1">2.8K</p>
            <p className="font-light text-sm text-gray-600">Ratings</p>
            <p className="px-2">|</p>
            <p className="pr-1">9.4K</p>
            <p className="font-light text-sm text-gray-600">Sold</p>
          </div>
          <p className="mt-5 text-3xl font-medium text-red-500">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {["S", "M", "L", "XL", "XXL"].map((label) => {
                const sizeData = productData.sizes.find(
                  (s) => s.size === label
                );
                const isAvailable = sizeData && sizeData.stock > 0;

                const isSelected = size === label;

                return (
                  <button
                    key={label}
                    onClick={() => {
                      if (isAvailable) {
                        setSize(label);
                        setSelectedStock(sizeData.stock);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`border py-2 px-4 text-sm rounded 
                  ${
                    isAvailable
                      ? "bg-gray-100 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                  ${isSelected && isAvailable ? "border-orange-500" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {selectedStock !== null && selectedStock < 10 && (
              <p className="text-red-500 text-sm">Only {selectedStock} left</p>
            )}
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            disabled={!size}
            className={`px-8 py-3 text-sm text-white ${
              size
                ? "bg-black active:bg-gray-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews  */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm ">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (2.8K)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            An e-commerce website is an online platform that facilitates the
            buying and selling of products or services over the internet. It
            serves as a virtual marketplace where businesses and individuals can
            showcase their products, interact with customers, and conduct
            transactions without the need for a physical presence. E-commerce
            websites have gained immense popularity due to their convenience,
            accessibility, and the global reach they offer.
          </p>
          <p>
            E-commerce websites typically display products or services along
            with detailed descriptions, images, prices, and any available
            variations (e.g., sizes, colors). Each product usually has its own
            dedicated page with relevant information.
          </p>
        </div>
      </div>
      {/* Related Products */}
      <RelatedProducts
        productId={productData._id}
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
