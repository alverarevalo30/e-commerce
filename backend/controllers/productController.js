import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestSeller,
    } = req.body;

    const imageFields = ["image1", "image2", "image3", "image4"];
    const images = imageFields
      .map((key) => req.files[key]?.[0])
      .filter(Boolean);

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const formattedSizes = Array.isArray(sizes)
      ? sizes.map((s) => ({
          size: s.size,
          stock: Number(s.stock),
        }))
      : [
          {
            size: sizes.size,
            stock: Number(sizes.stock),
          },
        ];

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subCategory,
      sizes: formattedSizes,
      bestSeller: bestSeller === "true" ? true : false,
      image: imagesUrl,
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added Successfully", product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// list product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// single product
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// delete product
const deleteProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// edit product
const editProduct = async (req, res) => {
  try {
    const { id, name, description, price, category, subCategory, bestSeller } =
      req.body;

    const sizes = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : Object.values(req.body).filter((v) => v && v.size && v.stock);

    const formattedSizes = sizes.map((s) => ({
      size: s.size,
      stock: Number(s.stock),
    }));

    const imageFields = ["image1", "image2", "image3", "image4"];
    const images = imageFields
      .map((key) => req.files?.[key]?.[0])
      .filter(Boolean);

    let newImageUrls = [];
    if (images.length > 0) {
      newImageUrls = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const existingImageUrls = Object.keys(req.body)
      .filter((key) => key.startsWith("existingImage"))
      .map((key) => req.body[key]);

    const updatedImages = [...existingImageUrls, ...newImageUrls];
    const finalImages = updatedImages.slice(0, 4);

    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.category = category;
    product.subCategory = subCategory;
    product.sizes = formattedSizes;
    product.bestSeller = bestSeller === "true";
    product.image = finalImages;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addProduct, listProduct, singleProduct, deleteProduct, editProduct };
