import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { Drink, Sale, SaleItem, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";
import { SaleService } from "../services/sale.service.js";

interface IncomingItem {
  drinkId: number;
  quantity: number;
}

interface CreateSaleBody {
  items?: IncomingItem[];
}

interface UpdateSaleBody {
  status?: string;
}

export class SaleController {
  static async create(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized user.", 401);
    }

    const sale = await SaleService.createSale(userId, req.body as CreateSaleBody);

    return res.status(201).json({
      message: "Sale completed successfully.",
      sale,
    });
  }

  static async findAll(req: Request, res: Response) {
    const { page, limit, offset } = getPagination(req);
    const isClient = req.user?.role === "client";

    const whereCondition = isClient ? { userId: req.user?.id } : {};

    const { count, rows } = await Sale.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Drink, as: "drink", attributes: ["id", "name", "price"] }],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
  }

  static async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid sale ID.", 400);
    }

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Drink, as: "drink" }],
        },
      ],
    });

    if (!sale) {
      throw new AppError("Sale not found.", 404);
    }

    if (req.user?.role === "client" && sale.userId !== req.user.id) {
      throw new AppError("Access denied to this sale.", 403);
    }

    return res.status(200).json(sale);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid sale ID.", 400);
    }

    const sale = await Sale.findByPk(id);
    if (!sale) {
      throw new AppError("Sale not found.", 404);
    }

    const { status } = req.body as UpdateSaleBody;
    if (!status || typeof status !== "string" || !status.trim()) {
      throw new AppError("Valid status is required.", 400);
    }

    sale.status = status.trim();
    await sale.save();

    return res.status(200).json({
      message: "Sale updated successfully.",
      sale,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid sale ID.", 400);
    }

    await SaleService.deleteSale(id);

    return res.status(200).json({ message: "Sale deleted and stock restored successfully." });
  }
}

export default SaleController;
