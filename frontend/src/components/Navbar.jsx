import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { CiSearch, CiUser } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import { LuShoppingCart } from "react-icons/lu";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    toast.success("Logout Successfully");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      <Link to="/">
        <img src={assets.logo} alt="Forever Logo" className="w-36" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
          <hr className="w-2/4 h-[1.5px] border-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
          <hr className="w-2/4 h-[1.5px] border-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
          <hr className="w-2/4 h-[1.5px] border-gray-700 hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
          <hr className="w-2/4 h-[1.5px] border-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="flex items-center gap-6 ">
        <Link to={"/collection"}>
          <CiSearch
            onClick={() => setShowSearch(true)}
            className="w-6 h-6 cursor-pointer"
          />
        </Link>
        <div className="group relative">
          {!token ? (
            <Link
              to={"/login"}
              className="flex items-center gap-1 text-gray-600 hover:text-black"
            >
              <CiUser className="w-6 h-6 cursor-pointer" />
              <span className="text-sm hidden sm:inline">Login</span>
            </Link>
          ) : (
            <CiUser className="w-6 h-6 cursor-pointer" />
          )}
          {token && (
            <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4">
              <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                <p className="cursor-pointer hover:text-black">My Profile</p>
                <Link to={"/orders"}>
                  <p className="cursor-pointer hover:text-black">Orders</p>
                </Link>
                <p onClick={logout} className="cursor-pointer hover:text-black">
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>
        <Link to="/cart" className="relative">
          <LuShoppingCart className="w-6 h-6 min-w-6 min-h-6 cursor-pointer" />
          <p className="absolute right-[-5px] top-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>
        <RxHamburgerMenu
          onClick={() => setVisible(true)}
          className="w-6 h-6 cursor-pointer sm:hidden"
        />
      </div>

      {/* Sidebar Menu for Mobile */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all py-5 ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 group cursor-pointer"
          >
            <IoIosArrowBack className="w-6 h-6" />
            <p>Back</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border"
            to="/contact"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
