import { type Request, type Response } from "express";
import { sequelize } from "../database/sequelize.js";
import { AppError } from "../errors/AppError.js";
import { Drink, Sale, SaleItem, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

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

type SaleWithItems = Sale & { items?: SaleItem[] };

export class SaleController {
  static async create(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    let committed = false;
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("Unauthorized user.", 401);
      }

      const { items } = req.body as CreateSaleBody;

      if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Sale must contain an array with at least one item.", 400);
      }

      let calculatedTotal = 0;
      const itemsToCreate: Array<{
        drinkId: number;
        quantity: number;
        unitPrice: number;
        drinkInstance: Drink;
      }> = [];

      for (const item of items) {
        const drinkId = Number(item.drinkId);
        const quantity = Number(item.quantity);

        if (isNaN(drinkId) || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
          throw new AppError(
            "Each item must have a valid drinkId and a positive integer quantity.",
            400
          );
        }

        const drink = await Drink.findByPk(drinkId, { transaction });
        if (!drink) {
          throw new AppError(`Drink with ID ${drinkId} not found.`, 404);
        }

        drink.decreaseStock(quantity);

        const unitPrice = Number(drink.price);
        calculatedTotal += unitPrice * quantity;

        itemsToCreate.push({
          drinkId,
          quantity,
          unitPrice,
          drinkInstance: drink,
        });
      }

      const sale = await Sale.create(
        {
          userId,
          totalPrice: calculatedTotal,
          status: "completed",
        },
        { transaction }
      );

      for (const item of itemsToCreate) {
        await SaleItem.create(
          {
            saleId: sale.id,
            drinkId: item.drinkId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
          { transaction }
        );

        await item.drinkInstance.save({ transaction });
      }

      await transaction.commit();
      committed = true;

      const createdSale = await Sale.findByPk(sale.id, {
        include: [
          {
            model: SaleItem,
            as: "items",
            include: [{ model: Drink, as: "drink" }],
          },
        ],
      });

      return res.status(201).json({
        message: "Sale completed successfully.",
        sale: createdSale,
      });
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }
      throw error;
    }
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
    const transaction = await sequelize.transaction();
    let committed = false;
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        throw new AppError("Invalid sale ID.", 400);
      }

      const sale = (await Sale.findByPk(id, {
        include: [{ model: SaleItem, as: "items" }],
        transaction,
      })) as SaleWithItems | null;

      if (!sale) {
        throw new AppError("Sale not found.", 404);
      }

      const items = sale.items ?? [];
      for (const item of items) {
        const drink = await Drink.findByPk(item.drinkId, { transaction });
        if (drink) {
          drink.increaseStock(item.quantity);
          await drink.save({ transaction });
        }
        await item.destroy({ transaction });
      }

      await sale.destroy({ transaction });
      await transaction.commit();
      committed = true;

      return res.status(200).json({ message: "Sale deleted and stock restored successfully." });
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

export default SaleController;
