import { type Request, type Response } from "express";
import { Category, Drink } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

export class DrinkController {
  static async create(req: Request, res: Response) {
    try {
      const { name, price, stock, categoryId } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Drink name is required." });
      }

      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "Price must be a valid non-negative number." });
      }

      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
        return res.status(400).json({ error: "Stock must be a valid non-negative integer." });
      }

      const parsedCategoryId = Number(categoryId);
      if (isNaN(parsedCategoryId)) {
        return res.status(400).json({ error: "Valid categoryId is required." });
      }

      const category = await Category.findByPk(parsedCategoryId);
      if (!category) {
        return res.status(404).json({ error: "Referenced category not found." });
      }

      const drink = await Drink.create({
        name: name.trim(),
        price: parsedPrice,
        stock: parsedStock,
        categoryId: parsedCategoryId,
      });

      return res.status(201).json({
        message: "Drink created successfully.",
        drink,
      });
    } catch (error) {
      console.error("Error creating drink:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const { page, limit, offset } = getPagination(req);

      const { count, rows } = await Drink.findAndCountAll({
        limit,
        offset,
        include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
        order: [["id", "ASC"]],
      });

      return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
    } catch (error) {
      console.error("Error fetching drinks:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid drink ID." });
      }

      const drink = await Drink.findByPk(id, {
        include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      });

      if (!drink) {
        return res.status(404).json({ error: "Drink not found." });
      }

      return res.status(200).json(drink);
    } catch (error) {
      console.error("Error fetching drink by ID:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid drink ID." });
      }

      const drink = await Drink.findByPk(id);
      if (!drink) {
        return res.status(404).json({ error: "Drink not found." });
      }

      const { name, price, stock, categoryId } = req.body;

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({ error: "Name cannot be empty." });
        }
        drink.name = name.trim();
      }

      if (price !== undefined) {
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({ error: "Price must be a valid non-negative number." });
        }
        drink.price = parsedPrice;
      }

      if (stock !== undefined) {
        const parsedStock = Number(stock);
        if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
          return res.status(400).json({ error: "Stock must be a valid non-negative integer." });
        }
        drink.stock = parsedStock;
      }

      if (categoryId !== undefined) {
        const parsedCategoryId = Number(categoryId);
        if (isNaN(parsedCategoryId)) {
          return res.status(400).json({ error: "Invalid categoryId." });
        }
        const category = await Category.findByPk(parsedCategoryId);
        if (!category) {
          return res.status(404).json({ error: "Referenced category not found." });
        }
        drink.categoryId = parsedCategoryId;
      }

      await drink.save();

      return res.status(200).json({
        message: "Drink updated successfully.",
        drink,
      });
    } catch (error) {
      console.error("Error updating drink:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid drink ID." });
      }

      const drink = await Drink.findByPk(id);
      if (!drink) {
        return res.status(404).json({ error: "Drink not found." });
      }

      await drink.destroy();
      return res.status(200).json({ message: "Drink deleted successfully." });
    } catch (error) {
      console.error("Error deleting drink:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default DrinkController;
