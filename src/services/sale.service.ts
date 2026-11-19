import type { Transaction } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { AppError } from "../errors/AppError.js";
import { Drink, Sale, SaleItem } from "../models/index.js";

interface IncomingItem {
  drinkId: number;
  quantity: number;
}

interface CreateSaleBody {
  items?: IncomingItem[];
}

interface PreparedSaleItem {
  drinkId: number;
  quantity: number;
  unitPrice: number;
  drinkInstance: Drink;
}

type SaleWithItems = Sale & { items?: SaleItem[] };

export class SaleService {
  static async prepareItems(items: IncomingItem[], transaction: Transaction) {
    let calculatedTotal = 0;
    const itemsToCreate: PreparedSaleItem[] = [];

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

    return { calculatedTotal, itemsToCreate };
  }

  static async createSale(userId: number, body: CreateSaleBody) {
    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Sale must contain an array with at least one item.", 400);
    }

    const transaction = await sequelize.transaction();
    let committed = false;
    try {
      const { calculatedTotal, itemsToCreate } = await this.prepareItems(items, transaction);

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

      return Sale.findByPk(sale.id, {
        include: [
          {
            model: SaleItem,
            as: "items",
            include: [{ model: Drink, as: "drink" }],
          },
        ],
      });
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  static async deleteSale(id: number): Promise<void> {
    const transaction = await sequelize.transaction();
    let committed = false;
    try {
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
    } catch (error) {
      if (!committed) {
        await transaction.rollback();
      }
      throw error;
    }
  }
}

export default SaleService;
