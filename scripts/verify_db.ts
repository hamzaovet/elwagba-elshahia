import { prisma } from "../lib/prisma";

async function check() {
  const products = await prisma.product.count();
  const categories = await prisma.category.count();
  const ingredients = await prisma.ingredient.count();
  const zones = await prisma.deliveryZone.count();
  const users = await prisma.user.count();
  const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });

  console.log("DATABASE VERIFICATION SUMMARY:");
  console.log({
    products,
    categories,
    ingredients,
    zones,
    users,
    restaurantName: settings?.restaurantName,
    phone: settings?.phone,
    address: settings?.address,
  });

  await prisma.$disconnect();
}

check();
