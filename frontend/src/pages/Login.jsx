import React, { useContext, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign Up");
  const [errors, setErrors] = useState({});
  const formRef = useRef();

  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const baseSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const signUpSchema = baseSchema
    .extend({
      name: z.string().min(1, "Name is required"),
      confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const loginSchema = baseSchema;

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const formData = {
      name: event.target.name?.value || "",
      email: event.target.email.value,
      password: event.target.password.value,
      confirmPassword: event.target.confirmPassword?.value || "",
    };

    const schema = currentState === "Login" ? loginSchema : signUpSchema;
    const parsed = schema.safeParse(formData);

    if (!parsed.success) {
      const formattedErrors = {};
      parsed.error.errors.forEach((error) => {
        formattedErrors[error.path[0]] = error.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});

    try {
      const url =
        currentState === "Login"
          ? `${backendUrl}/api/user/login`
          : `${backendUrl}/api/user/register`;

      const payload =
        currentState === "Login"
          ? { email: formData.email, password: formData.password }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            };

      const response = await axios.post(url, payload);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(`${currentState} Successfully`);
        navigate("/");
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {currentState === "Login" ? null : (
        <div className="w-full">
          <label htmlFor="name" className="text-sm block mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-800"
            }`}
            placeholder="Enter your name"
            onChange={handleInputChange}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
      )}

      <div className="w-full">
        <label htmlFor="email" className="text-sm block mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`w-full px-3 py-2 border ${
            errors.email ? "border-red-500" : "border-gray-800"
          }`}
          placeholder="Enter your email"
          onChange={handleInputChange}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div className="w-full">
        <label htmlFor="password" className="text-sm block mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className={`w-full px-3 py-2 border ${
            errors.email ? "border-red-500" : "border-gray-800"
          }`}
          placeholder="Enter your password"
          onChange={handleInputChange}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      {currentState === "Login" ? null : (
        <div className="w-full">
          <label htmlFor="confirmPassword" className="text-sm block mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className={`w-full px-3 py-2 border ${
              errors.email ? "border-red-500" : "border-gray-800"
            }`}
            placeholder="Confirm your password"
            onChange={handleInputChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      )}

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot your password?</p>
        {currentState === "Login" ? (
          <p
            onClick={() => {
              setCurrentState("Sign Up");
              formRef.current?.reset();
              setErrors({});
            }}
            className="cursor-pointer"
          >
            Create Account
          </p>
        ) : (
          <p
            onClick={() => {
              setCurrentState("Login");
              formRef.current?.reset();
              setErrors({});
            }}
            className="cursor-pointer"
          >
            Login Here
          </p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "Login" ? "Sign In" : "Sign Up"}
      </button>
    </form>
  );
};

export default Login;
