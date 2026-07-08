export const navigation = [
  {
    name: "Home",
    path: "/",
    permission: null,
  },
  {
    name: "Shop",
    path: "/shop-with-sidebar",
    permission: null,
  },
  {
    name: "Categories",
    path: "#",
    permission: null,
    submenu: [
      {
        name: "Electronics",
        path: "/shop-with-sidebar?category=electronics",
      },
      {
        name: "Fashion",
        path: "/shop-with-sidebar?category=fashion",
      },
      {
        name: "Home & Living",
        path: "/shop-with-sidebar?category=home",
      },
      {
        name: "Beauty & Health",
        path: "/shop-with-sidebar?category=beauty",
      },
      {
        name: "Groceries",
        path: "/shop-with-sidebar?category=groceries",
      },
    ],
  },
  {
    name: "Orders",
    path: "/orders",
    permission: "view_orders",
  },
  {
    name: "Sell on Xerin",
    path: "/signup",
    permission: null,
  },
  {
    name: "Help",
    path: "/contact",
    permission: null,
  },
];
