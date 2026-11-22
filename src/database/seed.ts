import "dotenv/config";
import { sequelize } from "../database/sequelize.js";
import { User, Category, Drink, Sale, SaleItem, Review } from "../models/index.js";

export async function runSeed() {
  console.log("Starting database seeding...");

  try {
    await sequelize.sync();

    console.log("Seeding users...");
    const usersData = [
      {
        name: "Admin Master",
        email: "admin@coffee.com",
        password: "Admin@Password123",
        cpf: "11144477735",
        role: "admin",
      },
      {
        name: "Valmir Dev",
        email: "valmir@coffee.com",
        password: "User@Secret123",
        cpf: "52998224725",
        role: "admin",
      },
      {
        name: "Caio Aydrian",
        email: "caio@coffee.com",
        password: "User@Secret123",
        cpf: "71221759088",
        role: "admin",
      },
      {
        name: "Maria Silva",
        email: "maria.silva@gmail.com",
        password: "User@Maria2026",
        cpf: "01234567890",
        role: "client",
      },
      {
        name: "Lucas Pereira",
        email: "lucas.pereira@outlook.com",
        password: "User@Lucas2026",
        cpf: "98765432100",
        role: "client",
      },
    ];

    const users: User[] = [];
    for (const u of usersData) {
      let user = await User.findOne({ where: { email: u.email } });
      if (!user) {
        user = await User.create(u);
      }
      users.push(user);
    }

    console.log("Seeding categories...");
    const categoriesData = [
      { name: "Hot Coffees" },
      { name: "Iced Coffees" },
      { name: "House Specials" },
      { name: "Bakery & Sides" },
    ];

    const categories: Category[] = [];
    for (const c of categoriesData) {
      let category = await Category.findOne({ where: { name: c.name } });
      if (!category) {
        category = await Category.create(c);
      }
      categories.push(category);
    }

    console.log("Seeding drinks...");
    const [catHot, catIced, catSpecials, catBakery] = categories;

    const drinksData = [
      {
        name: "Traditional Espresso",
        price: 8.5,
        stock: 50,
        categoryId: catHot.id,
        imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&auto=format&fit=crop&q=60",
      },
      {
        name: "Italian Cappuccino",
        price: 14.0,
        stock: 35,
        categoryId: catHot.id,
        imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=60",
      },
      {
        name: "Iced Caramel Macchiato",
        price: 18.5,
        stock: 40,
        categoryId: catIced.id,
        imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60",
      },
      {
        name: "Artisanal Cold Brew",
        price: 16.0,
        stock: 25,
        categoryId: catIced.id,
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60",
      },
      {
        name: "Belgian Chocolate Mocha",
        price: 21.0,
        stock: 30,
        categoryId: catSpecials.id,
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=60",
      },
      {
        name: "Butter Croissant",
        price: 12.0,
        stock: 20,
        categoryId: catBakery.id,
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60",
      },
    ];

    const drinks: Drink[] = [];
    for (const d of drinksData) {
      let drink = await Drink.findOne({ where: { name: d.name } });
      if (!drink) {
        drink = await Drink.create(d);
      }
      drinks.push(drink);
    }

    console.log("Seeding reviews...");
    const existingReviewsCount = await Review.count();
    if (existingReviewsCount === 0 && drinks.length > 0 && users.length > 3) {
      const client1 = users[3];
      const client2 = users[4];

      await Review.bulkCreate([
        {
          userId: client1.id,
          drinkId: drinks[0].id,
          rating: 5,
        },
        {
          userId: client2.id,
          drinkId: drinks[1].id,
          rating: 4,
        },
        {
          userId: client1.id,
          drinkId: drinks[2].id,
          rating: 5,
        },
        {
          userId: client2.id,
          drinkId: drinks[4].id,
          rating: 5,
        },
      ]);
    }

    console.log("Seeding sales...");
    const existingSalesCount = await Sale.count();
    if (existingSalesCount === 0 && drinks.length >= 4 && users.length > 3) {
      const client1 = users[3];
      const client2 = users[4];

      const sale1 = await Sale.create({
        userId: client1.id,
        totalPrice: 8.5 * 2 + 14.0 * 1,
        status: "completed",
      });

      await SaleItem.bulkCreate([
        { saleId: sale1.id, drinkId: drinks[0].id, quantity: 2, unitPrice: 8.5 },
        { saleId: sale1.id, drinkId: drinks[1].id, quantity: 1, unitPrice: 14.0 },
      ]);

      const sale2 = await Sale.create({
        userId: client2.id,
        totalPrice: 18.5 * 1 + 12.0 * 2,
        status: "pending",
      });

      await SaleItem.bulkCreate([
        { saleId: sale2.id, drinkId: drinks[2].id, quantity: 1, unitPrice: 18.5 },
        { saleId: sale2.id, drinkId: drinks[5].id, quantity: 2, unitPrice: 12.0 },
      ]);

      const sale3 = await Sale.create({
        userId: client1.id,
        totalPrice: 21.0 * 1,
        status: "cancelled",
      });

      await SaleItem.bulkCreate([
        { saleId: sale3.id, drinkId: drinks[4].id, quantity: 1, unitPrice: 21.0 },
      ]);
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error while seeding database:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSeed();
