"use client";
import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const schema = z.object({
  _id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be non-negative"),
  category: z.enum(["Men", "Women", "Kids"]),
  subCategory: z.enum(["Topwear", "Bottomwear", "Winterwear"]),
  sizes: z
    .array(
      z.object({
        size: z.enum(["S", "M", "L", "XL", "XXL"]),
        stock: z.number().min(0),
        enabled: z.boolean().optional(),
      })
    )
    .min(1),
  bestSeller: z.boolean().optional(),
  images: z.any(),
});

type FormValues = z.infer<typeof schema> & {
  imageURLs?: string[];
};

interface ProductFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  setFormRef?: (ref: { reset: () => void }) => void;
}

export function ProductForm({
  mode,
  initialValues,
  onSubmit,
  setFormRef,
}: ProductFormProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImageURLs, setExistingImageURLs] = useState<string[]>([]);
  const sizesEnum = z.enum(["S", "M", "L", "XL", "XXL"]);

  useEffect(() => {
    if (initialValues?.imageURLs && Array.isArray(initialValues.imageURLs)) {
      setExistingImageURLs(initialValues.imageURLs);
      setPreviewImages(initialValues.imageURLs);
    }
  }, [initialValues]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      _id: Date.now(),
      name: "",
      description: "",
      price: 0,
      category: "Men",
      subCategory: "Topwear",
      sizes: sizesEnum.options.map((size) => ({
        size,
        stock: 0,
        enabled: false,
      })),
      bestSeller: false,
      images: undefined,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (setFormRef) {
      setFormRef({
        reset: () => {
          reset();
          setPreviewImages([]);
          setFileList([]);
        },
      });
    }
  }, [reset, setFormRef]);

  const watchedStocks = useWatch({
    control,
    name: "sizes",
  });

  useEffect(() => {
    watchedStocks?.forEach((sizeItem, index) => {
      if (sizeItem.stock && sizeItem.stock > 0 && !sizeItem.enabled) {
        setValue(`sizes.${index}.enabled`, true, { shouldDirty: true });
      }
    });
  }, [watchedStocks, setValue]);

  const [fileList, setFileList] = useState<File[]>([]);

  const removeImage = (index: number) => {
    const isExistingURL = index < existingImageURLs.length;

    if (isExistingURL) {
      const updatedURLs = existingImageURLs.filter((_, i) => i !== index);
      setExistingImageURLs(updatedURLs);
      setPreviewImages([
        ...updatedURLs,
        ...fileList.map((f) => URL.createObjectURL(f)),
      ]);
    } else {
      const fileIndex = index - existingImageURLs.length;
      const updatedFiles = fileList.filter((_, i) => i !== fileIndex);
      setFileList(updatedFiles);
      setPreviewImages([
        ...existingImageURLs,
        ...updatedFiles.map((file) => URL.createObjectURL(file)),
      ]);

      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file));
      setValue("images", dataTransfer.files);
    }
  };

  const handleFormSubmit = (data: FormValues) => {
    const allImageCount = existingImageURLs.length + (fileList?.length ?? 0);
    if (allImageCount === 0) {
      alert("At least one image is required.");
      return;
    }

    const filteredSizes = data.sizes.filter((s) => s.enabled);
    onSubmit({ ...data, sizes: filteredSizes });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[90vh] p-4"
    >
      {/* Name */}
      <div className="flex flex-col">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          className={cn(errors.name && "border-red-500")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          className={cn(
            "min-h-[80px] max-h-[200px]",
            errors.description && "border-red-500"
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
          className={cn(errors.price && "border-red-500")}
        />
        {errors.price && (
          <p className="text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          {...register("category")}
          className={cn(
            "w-full border p-2 rounded",
            errors.category && "border-red-500"
          )}
        >
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </div>

      {/* Subcategory */}
      <div className="flex flex-col">
        <Label htmlFor="subCategory">Subcategory</Label>
        <select
          id="subCategory"
          {...register("subCategory")}
          className={cn(
            "w-full border p-2 rounded",
            errors.subCategory && "border-red-500"
          )}
        >
          <option value="Topwear">Topwear</option>
          <option value="Bottomwear">Bottomwear</option>
          <option value="Winterwear">Winterwear</option>
        </select>
      </div>

      {/* Bestseller */}
      <div className="flex items-center gap-2">
        <Controller
          name="bestSeller"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="bestSeller"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="bestSeller">Best Seller</Label>
            </div>
          )}
        />
      </div>

      {/* Sizes */}
      <div className="md:col-span-2">
        <Label>Sizes and Stock</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {["S", "M", "L", "XL", "XXL"].map((size, idx) => (
            <div key={size} className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register(`sizes.${idx}.enabled` as const)}
                className="h-4 w-4"
              />
              <span>{size}</span>
              <input
                type="number"
                min={0}
                placeholder="Stock"
                className="border rounded p-1 w-20"
                {...register(`sizes.${idx}.stock`, { valueAsNumber: true })}
              />
              <input
                type="hidden"
                {...register(`sizes.${idx}.size`)}
                value={size}
              />
            </div>
          ))}
        </div>
        {errors.sizes && (
          <p className="text-sm text-red-500">
            Please provide stock for at least one size
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div className="md:col-span-2">
        <Controller
          name="images"
          control={control}
          rules={{
            validate: (files) =>
              (files && files.length > 0) || "At least one image is required",
          }}
          render={({ field }) => (
            <>
              <Label htmlFor="images">Upload Images (Max 4)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;

                  const newFiles = Array.from(files).filter(
                    (file) =>
                      !fileList.some(
                        (f) => f.name === file.name && f.size === file.size
                      )
                  );

                  const combinedFiles = [...fileList, ...newFiles].slice(0, 4);
                  const updatedPreviews = [
                    ...existingImageURLs,
                    ...combinedFiles.map((file) => URL.createObjectURL(file)),
                  ];

                  setFileList(combinedFiles);
                  setPreviewImages(updatedPreviews);

                  const dataTransfer = new DataTransfer();
                  combinedFiles.forEach((file) => dataTransfer.items.add(file));
                  field.onChange(dataTransfer.files);
                }}
                className={cn(errors.images && "border-red-500")}
              />
              {errors.images && (
                <p className="text-sm text-red-500">
                  {errors.images.message as string}
                </p>
              )}
            </>
          )}
        />

        {/* Image Preview */}
        <div className="mt-4 flex flex-wrap gap-2">
          {previewImages.map((url, index) => (
            <div
              key={index}
              className="relative w-24 h-24 border rounded overflow-hidden"
            >
              <Image
                src={url}
                alt={`Preview ${index}`}
                layout="fill"
                objectFit="cover"
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

      {/* Submit Button */}
      <div className="md:col-span-2">
        <Button type="submit" className="w-full">
          {mode === "add" ? "Add Product" : "Update Product"}
        </Button>
      </div>
    </form>
  );
}
