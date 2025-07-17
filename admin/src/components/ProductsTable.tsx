"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconEdit,
  IconLayoutColumns,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "react-toastify";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddProductDialog } from "./AddProductDialog";
import axios from "axios";
import { EditProductDialog } from "./EditProductDialog";

export const schema = z.object({
  _id: z.number(),
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

  bestSeller: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export function ProductsTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [activeTab, setActiveTab] = React.useState("all");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [searchValue, setSearchValue] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<z.infer<
    typeof schema
  > | null>(null);

  const filteredData = React.useMemo(() => {
    if (activeTab === "all") return data;
    return data.filter(
      (item) => item.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [data, activeTab]);

  const handleDelete = async (product: z.infer<typeof schema>) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseURL) {
        throw new Error("API URL is not defined in environment variables.");
      }

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const response = await axios.post(
        `${baseURL}/api/product/delete`,
        { id: product._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData((prev) => prev.filter((item) => item._id !== product._id));
        toast.success("Product deleted!");
      } else {
        toast.error(response.data.message || "Failed to delete product.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Something went wrong while deleting."
      );
    }
  };

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      accessorKey: "image",
      header: "Images",
      cell: ({ row }) => {
        const images: string[] = row.original.image || [];
        const [currentIndex, setCurrentIndex] = React.useState(0);

        if (!images.length) {
          return (
            <span className="text-xs text-muted-foreground">No images</span>
          );
        }

        const next = () =>
          setCurrentIndex((prev) => (prev + 1) % images.length);
        const prev = () =>
          setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          );

        return (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={images[0]}
                alt="product-preview"
                className="h-12 w-12 cursor-pointer rounded-md object-cover transition hover:opacity-80"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-4 flex flex-col items-center gap-4">
              <DialogTitle>{row.original.name}</DialogTitle>
              <div className="relative w-full max-w-xl">
                <img
                  src={images[currentIndex]}
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
                {images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`thumb-${index}`}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-12 w-12 cursor-pointer rounded-md object-cover border-2 ${
                      currentIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="line-clamp-2 max-w-xs">{row.original.description}</div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.price;
        return typeof price === "number" ? `₱${price.toFixed(2)}` : "N/A";
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "subCategory",
      header: "Sub-Category",
    },
    {
      accessorKey: "sizes",
      header: "Sizes",
      cell: ({ row }) =>
        Array.isArray(row.original.sizes) ? (
          <div className="flex flex-col gap-1">
            {row.original.sizes.map((sizeObj, index) => (
              <div key={index} className="text-sm">
                {sizeObj.size}: <span>{sizeObj.stock} stocks left</span>
              </div>
            ))}
          </div>
        ) : (
          "N/A"
        ),
    },

    {
      accessorKey: "bestSeller",
      header: "Best Seller",
      cell: ({ row }) =>
        row.original.bestSeller ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Best Seller
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
            Standard Product
          </span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <EditProductDialog
              product={row.original}
              onUpdate={(updatedProduct) => {
                setData((prev) =>
                  prev.map((product) =>
                    product._id === updatedProduct._id
                      ? updatedProduct
                      : product
                  )
                );
              }}
            />

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-red-600"
              onClick={() => {
                setProductToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id.toString(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      table.setColumnFilters([
        {
          id: "name",
          value: searchValue,
        },
      ]);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select
          value={activeTab}
          onValueChange={(value) => setActiveTab(value)}
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="men">Men</SelectItem>
            <SelectItem value="women">Women</SelectItem>
            <SelectItem value="kids">Kids</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="men">Men</TabsTrigger>
          <TabsTrigger value="women">Women</TabsTrigger>
          <TabsTrigger value="kids">Kids</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block relative w-52">
            <IconSearch
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search product name..."
              className="h-8 w-full rounded-md border px-8 text-sm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddProductDialog
            onAdd={(newProduct) => {
              setData((prev) => [...prev, newProduct]);
            }}
          />
        </div>
      </div>
      <div className="flex items-center px-4 lg:px-6 sm:hidden">
        <div className="relative w-full max-w-96">
          <IconSearch
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search product name..."
            className="h-8 w-full rounded-md border px-8 text-sm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <TabsContent
        value={activeTab}
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
      </TabsContent>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription className="sr-only">
            Deleting Existing Product
          </DialogDescription>
          <p>
            Are you sure you want to delete{" "}
            <strong>{productToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (productToDelete) {
                  handleDelete(productToDelete);
                  setDeleteDialogOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
