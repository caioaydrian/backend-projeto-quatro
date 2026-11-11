import { type Request, type Response } from "express";
import { sequelize } from "../database/sequelize.js";
import { Drink, Sale, SaleItem, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

interface IncomingItem {
  drinkId: number;
  quantity: number;
}

export class SaleController {
  static async create(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user?.id;
      if (!userId) {
        await transaction.rollback();
        return res.status(401).json({ error: "Unauthorized user." });
      }

      const { items } = req.body as { items: IncomingItem[] };

      if (!Array.isArray(items) || items.length === 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Sale must contain an array with at least one item." });
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
          await transaction.rollback();
          return res.status(400).json({
            error: "Each item must have a valid drinkId and a positive integer quantity.",
          });
        }

        const drink = await Drink.findByPk(drinkId, { transaction });
        if (!drink) {
          await transaction.rollback();
          return res.status(404).json({ error: `Drink with ID ${drinkId} not found.` });
        }

        if (drink.stock < quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Insufficient stock for '${drink.name}'. Available: ${drink.stock}, Requested: ${quantity}.`,
          });
        }

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

        item.drinkInstance.stock -= item.quantity;
        await item.drinkInstance.save({ transaction });
      }

      await transaction.commit();

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
      await transaction.rollback();
      console.error("Error creating sale:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
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
    } catch (error) {
      console.error("Error fetching sales:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid sale ID." });
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
        return res.status(404).json({ error: "Sale not found." });
      }

      if (req.user?.role === "client" && sale.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to this sale." });
      }

      return res.status(200).json(sale);
    } catch (error) {
      console.error("Error fetching sale by ID:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid sale ID." });
      }

      const sale = await Sale.findByPk(id);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found." });
      }

      const { status } = req.body;
      if (!status || typeof status !== "string" || !status.trim()) {
        return res.status(400).json({ error: "Valid status is required." });
      }

      sale.status = status.trim();
      await sale.save();

      return res.status(200).json({
        message: "Sale updated successfully.",
        sale,
      });
    } catch (error) {
      console.error("Error updating sale:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async delete(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        await transaction.rollback();
        return res.status(400).json({ error: "Invalid sale ID." });
      }

      const sale = await Sale.findByPk(id, {
        include: [{ model: SaleItem, as: "items" }],
        transaction,
      });

      if (!sale) {
        await transaction.rollback();
        return res.status(404).json({ error: "Sale not found." });
      }

      const items = (sale as any).items as SaleItem[];
      if (items && items.length > 0) {
        for (const item of items) {
          const drink = await Drink.findByPk(item.drinkId, { transaction });
          if (drink) {
            drink.stock += item.quantity;
            await drink.save({ transaction });
          }
          await item.destroy({ transaction });
        }
      }

      await sale.destroy({ transaction });
      await transaction.commit();

      return res.status(200).json({ message: "Sale deleted and stock restored successfully." });
    } catch (error) {
      await transaction.rollback();
      console.error("Error deleting sale:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default SaleController;
