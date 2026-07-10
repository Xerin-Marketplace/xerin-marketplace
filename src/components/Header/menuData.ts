import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Shop",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "Categories",
    newTab: false,
    path: "/shop-with-sidebar",
    submenu: [
      {
        id: 31,
        title: "Electronics",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 32,
        title: "Fashion",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 33,
        title: "Home & Living",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 34,
        title: "Beauty & Health",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 35,
        title: "Groceries",
        newTab: false,
        path: "/shop-with-sidebar",
      },
    ],
  },
  {
    id: 4,
    title: "Help",
    newTab: false,
    path: "/contact",
  },
];
