import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Category, Drink } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";
import { DrinkService } from "../services/drink.service.js";

interface DrinkBody {
  name?: string;
  price?: number | string;
  stock?: number | string;
  categoryId?: number | string;
  imageUrl?: string | null;
}

export class DrinkController {
  static async create(req: Request, res: Response) {
    const data = DrinkService.parseCreateData(req.body as DrinkBody);
    await DrinkService.validateCategory(data.categoryId);

    const drink = await Drink.create(data);

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

    await DrinkService.applyUpdateData(drink, req.body as DrinkBody);
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

    await DrinkService.ensureCanDelete(id);
    await drink.destroy();

    return res.status(200).json({ message: "Drink deleted successfully." });
  }
}

export default DrinkController;
