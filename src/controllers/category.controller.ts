import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Category, Drink } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

interface CategoryBody {
  name?: string;
}

export class CategoryController {
  static async create(req: Request, res: Response) {
    const { name } = req.body as CategoryBody;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Category name is required.", 400);
    }

    const existingCategory = await Category.findOne({
      where: { name: name.trim() },
    });
    if (existingCategory) {
      throw new AppError("Category already exists.", 409);
    }

    const category = await Category.create({ name: name.trim() });
    return res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  }

  static async findAll(req: Request, res: Response) {
    const { page, limit, offset } = getPagination(req);

    const { count, rows } = await Category.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
  }

  static async findById(req: Request, res: Response) {
    const id = Category.parseId(req.params.id);

    const category = await Category.findByPk(id, {
      include: [{ model: Drink, as: "drinks" }],
    });

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    return res.status(200).json(category);
  }

  static async update(req: Request, res: Response) {
    const id = Category.parseId(req.params.id);

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    const { name } = req.body as CategoryBody;
    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("Category name is required.", 400);
    }

    category.name = name.trim();
    await category.save();

    return res.status(200).json({
      message: "Category updated successfully.",
      category,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Category.parseId(req.params.id);

    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    const drinksCount = await Drink.count({ where: { categoryId: id } });
    if (drinksCount > 0) {
      throw new AppError("Cannot delete category because it has associated drinks.", 400);
    }

    await category.destroy();
    return res.status(200).json({ message: "Category deleted successfully." });
  }
}

export default CategoryController;
