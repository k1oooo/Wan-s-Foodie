export interface MenuItem {
  name: string;
  price: number;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

// Confirmed menu — all items sold per box of 10 pcs.
export const menuData: MenuCategory[] = [
  {
    category: "Chicken",
    items: [
      { name: "Chicken Curry", price: 13 },
      { name: "Chicken Black Pepper", price: 13 },
      { name: "Chicken BBQ", price: 13 },
      { name: "Chicken Carbonara", price: 15 },
      { name: "Chicken Shitake", price: 15 },
    ],
  },
  {
    category: "Beef",
    items: [
      { name: "Beef Curry", price: 13 },
      { name: "Beef Black Pepper", price: 13 },
      { name: "Beef Bolognese", price: 15 },
      { name: "Cheesy Beef", price: 15 },
    ],
  },
  {
    category: "Seafood",
    items: [
      { name: "Sardine", price: 14 },
      { name: "Tuna Mushroom", price: 15 },
      { name: "Cheesy Crab", price: 15 },
    ],
  },
];
