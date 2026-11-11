import { type Request, type Response } from "express";
import { Category, Drink } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

export class CategoryController {
  static async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Category name is required." });
      }

      const existingCategory = await Category.findOne({
        where: { name: name.trim() },
      });
      if (existingCategory) {
        return res.status(409).json({ error: "Category already exists." });
      }

      const category = await Category.create({ name: name.trim() });
      return res.status(201).json({
        message: "Category created successfully.",
        category,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const { page, limit, offset } = getPagination(req);

      const { count, rows } = await Category.findAndCountAll({
        limit,
        offset,
        order: [["id", "ASC"]],
      });

      return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID." });
      }

      const category = await Category.findByPk(id, {
        include: [{ model: Drink, as: "drinks" }],
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }

      return res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID." });
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }

      const { name } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Category name is required." });
      }

      category.name = name.trim();
      await category.save();

      return res.status(200).json({
        message: "Category updated successfully.",
        category,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid category ID." });
      }

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: "Category not found." });
      }

      await category.destroy();
      return res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default CategoryController;
