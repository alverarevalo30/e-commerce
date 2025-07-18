"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().gt(0, "Price must be greater than 0"),
  category: z.string().nonempty("Category is required"),
  subCategory: z.string().nonempty("Subcategory is required"),
  sizes: z
    .array(
      z.object({
        size: z.enum(["S", "M", "L", "XL", "XXL"]),
        stock: z.number().min(0, "Stock must be 0 or more"),
        enabled: z.boolean().optional(),
      })
    )
    .refine((sizes) => sizes.some((s) => s.enabled), {
      message: "Please enable at least one size",
    })
    .refine((sizes) => sizes.every((s) => !s.enabled || s.stock > 0), {
      message: "Each enabled size must have stock > 0",
    }),

  bestSeller: z.boolean().optional(),
  images: z.any().refine((files) => files && files.length > 0, {
    message: "At least one image is required",
  }),
});

type FormValues = z.infer<typeof schema>;

interface Product {
  _id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  bestSeller: boolean;
  sizes: {
    size: "S" | "M" | "L" | "XL" | "XXL";
    stock: number;
  }[];
  images: string[]; 
}

interface AddProductDialogProps {
  onAdd: (newProduct: Product) => void;
}

export function AddProductDialog({ onAdd }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [fileList, setFileList] = useState<File[]>([]);

  const sizesEnum = ["S", "M", "L", "XL", "XXL"];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      subCategory: "",
      sizes: sizesEnum.map((size) => ({
        size: size as FormValues["sizes"][number]["size"],
        stock: 0,
        enabled: false,
      })),
      bestSeller: false,
      images: undefined,
    },
  });

  const watchedSizes = useWatch({ control, name: "sizes" });

  useEffect(() => {
    watchedSizes?.forEach((sizeItem, index) => {
      if (sizeItem.stock > 0 && !sizeItem.enabled) {
        setValue(`sizes.${index}.enabled`, true);
      }
    });
  }, [watchedSizes, setValue]);

  const removeImage = (index: number) => {
    const updatedFiles = fileList.filter((_, i) => i !== index);
    setFileList(updatedFiles);
    setPreviewImages(updatedFiles.map((file) => URL.createObjectURL(file)));

    const dt = new DataTransfer();
    updatedFiles.forEach((file) => dt.items.add(file));
    setValue("images", dt.files);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseURL) throw new Error("API URL not set");

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("subCategory", data.subCategory);
      formData.append("bestSeller", data.bestSeller ? "true" : "false");

      const filteredSizes = data.sizes.filter((s) => s.enabled);
      filteredSizes.forEach((s, i) => {
        formData.append(`sizes[${i}][size]`, s.size);
        formData.append(`sizes[${i}][stock]`, s.stock.toString());
      });

      fileList.forEach((file, i) => {
        formData.append(`image${i + 1}`, file);
      });

      const response = await axios.post(
        `${baseURL}/api/product/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (result.success) {
        toast.success("Product added successfully!");
        onAdd(result.product);
        reset();
        setFileList([]);
        setPreviewImages([]);
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to add product");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
          setFileList([]);
          setPreviewImages([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden sm:inline">Add Product</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Add New Product</DialogTitle>
        <DialogDescription className="sr-only">
          Adding New Product
        </DialogDescription>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4"
        >
          {/* Name */}
          <div>
            <Label className="mb-2">Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2">Description</Label>
            <Textarea {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <Label className="mb-2">Price</Label>
            <Input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label className="mb-2">Category</Label>
            <select
              {...register("category")}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Subcategory */}
          <div>
            <Label className="mb-2">Subcategory</Label>
            <select
              {...register("subCategory")}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Subcategory</option>
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
            {errors.subCategory && (
              <p className="text-sm text-red-500">
                {errors.subCategory.message}
              </p>
            )}
          </div>

          {/* Best Seller */}
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="bestSeller"
              render={({ field }) => (
                <>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label className="mb-2">Best Seller</Label>
                </>
              )}
            />
          </div>

          {/* Sizes */}
          <div className="md:col-span-2">
            <Label className="mb-2">Sizes and Stock</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {sizesEnum.map((size, idx) => {
                const enabled = watch(`sizes.${idx}.enabled`);

                return (
                  <div
                    key={size}
                    className={cn(
                      "flex items-center gap-2 transition-opacity",
                      !enabled && "opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      {...register(`sizes.${idx}.enabled` as const)}
                    />
                    <span>{size}</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Stock"
                      className="border p-1 rounded w-20"
                      {...register(`sizes.${idx}.stock`, {
                        valueAsNumber: true,
                      })}
                    />
                    <input
                      type="hidden"
                      {...register(`sizes.${idx}.size`)}
                      value={size}
                    />
                  </div>
                );
              })}
            </div>
            {errors.sizes && (
              <p className="text-sm text-red-500">
                Please provide stock for at least one size
              </p>
            )}
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <Label className="mb-2">Images (Max 4)</Label>
            <Controller
              control={control}
              name="images"
              rules={{
                validate: () =>
                  (fileList.length > 0 && fileList.length <= 4) ||
                  "You must upload between 1 and 4 images.",
              }}
              render={({ field }) => (
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newFiles = files.slice(0, 4 - fileList.length);
                    const updatedFiles = [...fileList, ...newFiles];
                    setFileList(updatedFiles);
                    setPreviewImages(
                      updatedFiles.map((f) => URL.createObjectURL(f))
                    );

                    const dt = new DataTransfer();
                    updatedFiles.forEach((file) => dt.items.add(file));
                    field.onChange(dt.files);
                  }}
                />
              )}
            />
            {errors.images && (
              <p className="text-sm text-red-500">
                {errors.images.message as string}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {previewImages.map((url, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 border rounded overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Preview ${index}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-black text-white text-xs px-1"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
