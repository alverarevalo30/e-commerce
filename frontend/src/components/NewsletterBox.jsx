import React, { useState } from "react";
import { z } from "zod";
import { motion } from "motion/react";

const NewsletterBox = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const emailSchema = z.string().email();

  const onSubmitHandler = (event) => {
    event.preventDefault();

    // Validate email with Zod
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      setError("Please enter a valid email address.");
    } else {
      setError("");
      // Proceed with your subscribe logic here
      console.log("Email is valid:", email);
    }
  };

  // Clear error on input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <p className="text-2xl font-medium text-gray-800">
        Subscribe now & get 20% off
      </p>
      <p className="text-gray-400 mt-3">
        Join our newsletter for exclusive deals, new arrivals, and insider
        updates.
      </p>
      <form onSubmit={onSubmitHandler} className="w-full sm:w-1/2 mx-auto my-6">
        <label
          className="block text-left text-sm text-gray-700 mb-1 pl-3"
          htmlFor="email"
        >
          Email address
        </label>

        <div
          className={`flex items-center gap-3 border pl-3 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={handleChange}
            className="w-full outline-none py-3"
          />
          <button
            type="submit"
            className="bg-black text-white text-xs px-10 py-4"
          >
            SUBSCRIBE
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-xs text-left pl-3 mt-1">{error}</p>
        )}
      </form>
    </motion.div>
  );
};

export default NewsletterBox;
