"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { z } from "zod";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const itemSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.array(z.string()),
  category: z.string(),
  subCategory: z.string(),
  sizes: z.array(
    z.object({
      size: z.string(),
      stock: z.number(),
    })
  ),
  bestSeller: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  quantity: z.number(),
  size: z.string(),
});

export const addressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  country: z.string(),
  phone: z.string(),
});

export const schema = z.object({
  _id: z.number(),
  userId: z.string(),
  status: z.string(),
  payment: z.boolean(),
  paymentMethod: z.string(),
  amount: z.number(),
  address: addressSchema,
  items: z.array(itemSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function OrdersTable({
  data: initialData,
  fetchOrders,
}: {
  data: z.infer<typeof schema>[];
  fetchOrders: () => Promise<void>;
}) {
  const router = useRouter();
  const [data, setData] = React.useState(() => initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Invalid Date";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const table = useReactTable({
    data,
    columns: [],
    state: {
      sorting,
      pagination,
    },
    getRowId: (row) => row._id.toString(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const isFiltered =
    table.getFilteredRowModel().rows.length !==
    table.getPreFilteredRowModel().rows.length;

  const token = Cookies.get("admin-token");
  if (!token) {
    router.replace("/login");
    return;
  }

  const statusHandler = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    orderId: number
  ) => {
    const newStatus = event.target.value;

    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseURL) {
        throw new Error("API URL is not defined in environment variables.");
      }

      const response = await axios.post(
        `${baseURL}/api/order/orderstatus`,
        {
          orderId,
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Order status updated");
        setData((prevData) =>
          prevData.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );

        await fetchOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Something went wrong while updating status");
    }
  };

  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <div className=" flex-1 outline-none relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden">
        <div>
          {table.getRowModel().rows.map(({ original: order }, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-5 md:p-6 my-4 shadow-sm bg-white"
            >
              {/* Order ID Header */}
              <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs sm:text-sm text-gray-600 mb-4  border-primary font-medium">
                Order ID: {order._id}
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-6 gap-4 text-xs sm:text-sm text-gray-700">
                {/* Image Column */}
                <div className="col-span-6 sm:col-span-1 flex items-center justify-center">
                  {(() => {
                    const imageData = order.items.flatMap((item) =>
                      (item.image || []).map((url) => ({
                        url,
                        name: item.name,
                        quantity: item.quantity,
                        size: item.size,
                        price: item.price,
                      }))
                    );

                    if (!imageData.length) {
                      return (
                        <span className="text-muted-foreground text-xs">
                          No images
                        </span>
                      );
                    }

                    const next = () =>
                      setCurrentIndex((prev) => (prev + 1) % imageData.length);
                    const prev = () =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? imageData.length - 1 : prev - 1
                      );

                    return (
                      <Dialog>
                        <DialogTrigger asChild>
                          <img
                            src={imageData[0].url}
                            alt="product-preview"
                            className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-md cursor-pointer transition hover:opacity-80"
                          />
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-4 flex flex-col items-center gap-4">
                          <DialogTitle>
                            {imageData[currentIndex].name}
                          </DialogTitle>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {imageData[currentIndex].quantity} — Size:{" "}
                            {imageData[currentIndex].size} — ₱
                            {(
                              imageData[currentIndex].price ?? 0
                            ).toLocaleString()}
                          </p>

                          <div className="relative w-full max-w-xl">
                            <img
                              src={imageData[currentIndex].url}
                              alt={`product-${currentIndex}`}
                              className="max-h-[75vh] w-full rounded-lg object-contain"
                            />
                            <button
                              onClick={prev}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black"
                            >
                              <IconChevronLeft size={20} />
                            </button>
                            <button
                              onClick={next}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black"
                            >
                              <IconChevronRight size={20} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {imageData.map((img, i) => (
                              <img
                                key={i}
                                src={img.url}
                                alt={`thumb-${i}`}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-12 w-12 cursor-pointer rounded-md object-cover border-2 ${
                                  currentIndex === i
                                    ? "border-primary"
                                    : "border-transparent"
                                }`}
                              />
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })()}
                </div>

                {/* Item Info */}
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <p className="font-semibold text-gray-800 mb-1">Item Info</p>
                  <p>
                    <strong>Total Items:</strong> {order.items.length}
                  </p>

                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <p key={`${item._id}-${item.size}`}>
                        <strong>{item.name}</strong> x{item.quantity}{" "}
                        {item.size}
                        {item.price && (
                          <>
                            {" "}
                            -{" "}
                            <span className="text-gray-600">₱{item.price}</span>
                            <span className="font-semibold">
                              {" "}
                              (₱{item.price * item.quantity})
                            </span>
                          </>
                        )}
                      </p>
                    ))}
                  </div>

                  <p>
                    <strong>Method:</strong> {order.paymentMethod}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    <span
                      className={
                        order.payment
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {order.payment ? "Done" : "Pending"}
                    </span>
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(order.createdAt)}
                  </p>
                </div>

                {/* Customer Info */}
                <div className="col-span-6 sm:col-span-1 space-y-1">
                  <p className="font-semibold text-gray-800 mb-1">
                    Customer Info
                  </p>

                  <p className="font-medium">
                    {order.address.firstName} {order.address.lastName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.address.street}
                    <br />
                    {order.address.city}, {order.address.state}
                    <br />
                    {order.address.country} {order.address.zip}
                  </p>

                  <p className="font-medium text-gray-800">
                    {order.address.phone}
                  </p>
                </div>

                {/* Total */}
                <div className="col-span-6 sm:col-span-1 flex flex-col justify-start">
                  <p className="font-semibold text-gray-800 mb-1">Total</p>
                  <p className="text-xl font-extrabold">₱{order.amount}</p>
                </div>

                {/* Status */}
                <div className="col-span-6 sm:col-span-1">
                  <p className="font-semibold text-gray-800 mb-1">Status</p>
                  <select
                    value={order.status}
                    onChange={(event) => statusHandler(event, order._id)}
                    className="w-full p-2 border rounded-md font-medium text-sm"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          Showing {table.getPaginationRowModel().rows.length} of{" "}
          {isFiltered
            ? table.getFilteredRowModel().rows.length
            : table.getPreFilteredRowModel().rows.length}{" "}
          row(s)
        </div>

        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
