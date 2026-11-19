import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Category, Drink, SaleItem } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

interface DrinkBody {
  name?: string;
  price?: number | string;
  stock?: number | string;
  categoryId?: number | string;
}

export class DrinkController {
  static async create(req: Request, res: Response) {
    const { name, price, stock, categoryId } = req.body as DrinkBody;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Drink name is required.", 400);
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new AppError("Price must be a valid non-negative number.", 400);
    }

    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      throw new AppError("Stock must be a valid non-negative integer.", 400);
    }

    const parsedCategoryId = Number(categoryId);
    if (isNaN(parsedCategoryId)) {
      throw new AppError("Valid categoryId is required.", 400);
    }

    const category = await Category.findByPk(parsedCategoryId);
    if (!category) {
      throw new AppError("Referenced category not found.", 404);
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
  }

  static async findAll(req: Request, res: Response) {
    const { page, limit, offset } = getPagination(req);

    const { count, rows } = await Drink.findAndCountAll({
      limit,
      offset,
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
  }

  static async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid drink ID.", 400);
    }

    const drink = await Drink.findByPk(id, {
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    });

    if (!drink) {
      throw new AppError("Drink not found.", 404);
    }

    return res.status(200).json(drink);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid drink ID.", 400);
    }

    const drink = await Drink.findByPk(id);
    if (!drink) {
      throw new AppError("Drink not found.", 404);
    }

    const { name, price, stock, categoryId } = req.body as DrinkBody;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        throw new AppError("Name cannot be empty.", 400);
      }
      drink.name = name.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new AppError("Price must be a valid non-negative number.", 400);
      }
      drink.price = parsedPrice;
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
        throw new AppError("Stock must be a valid non-negative integer.", 400);
      }
      drink.stock = parsedStock;
    }

    if (categoryId !== undefined) {
      const parsedCategoryId = Number(categoryId);
      if (isNaN(parsedCategoryId)) {
        throw new AppError("Invalid categoryId.", 400);
      }
      const category = await Category.findByPk(parsedCategoryId);
      if (!category) {
        throw new AppError("Referenced category not found.", 404);
      }
      drink.categoryId = parsedCategoryId;
    }

    await drink.save();

    return res.status(200).json({
      message: "Drink updated successfully.",
      drink,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid drink ID.", 400);
    }

    const drink = await Drink.findByPk(id);
    if (!drink) {
      throw new AppError("Drink not found.", 404);
    }

    const salesCount = await SaleItem.count({ where: { drinkId: id } });
    if (salesCount > 0) {
      throw new AppError("Cannot delete drink because it is associated with existing sales.", 400);
    }

    await drink.destroy();
    return res.status(200).json({ message: "Drink deleted successfully." });
  }
}

export default DrinkController;
