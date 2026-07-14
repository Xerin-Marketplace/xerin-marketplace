"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/lib/api/endpoints/admin";
import { ApiError } from "@/lib/api/client";
import toast from "react-hot-toast";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

const CatalogDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    outOfStockProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    pendingReviews: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, categories, brands, reviews] = await Promise.all([
          adminService.listAllProducts({ page: 1, page_size: 1000 }),
          adminService.listProductCategories(),
          adminService.listBrands(),
          adminService.listProductReviews({ status: "pending" }),
        ]);

        const totalProducts = products.total;
        const activeProducts = products.results.filter((p) => p.status === "approved" && p.is_active).length;
        const draftProducts = products.results.filter((p) => p.status === "draft").length;
        const outOfStockProducts = products.results.filter(
          (p) => p.track_stock && p.quantity <= 0
        ).length;
        const lowStockProducts = products.results.filter(
          (p) => p.track_stock && p.quantity > 0 && p.quantity <= p.low_stock_threshold
        ).length;

        setStats({
          totalProducts,
          activeProducts,
          draftProducts,
          outOfStockProducts,
          totalCategories: categories.length,
          totalBrands: brands.length,
          pendingReviews: reviews.length,
          lowStockProducts,
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Active Products", value: stats.activeProducts },
    { label: "Draft Products", value: stats.draftProducts },
    { label: "Out of Stock", value: stats.outOfStockProducts },
    { label: "Total Categories", value: stats.totalCategories },
    { label: "Total Brands", value: stats.totalBrands },
    { label: "Pending Reviews", value: stats.pendingReviews },
    { label: "Low Stock", value: stats.lowStockProducts },
  ];

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-[#111827]">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default CatalogDashboard;
