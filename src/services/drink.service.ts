import type { Transaction } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { Category, Drink, SaleItem } from "../models/index.js";

interface DrinkInput {
  name?: string;
  price?: number | string;
  stock?: number | string;
  categoryId?: number | string;
  imageUrl?: string | null;
}

export class DrinkService {
  static normalizeImageUrl(imageUrl: unknown): string | null {
    return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;
  }

  static async validateCategory(categoryId: number): Promise<void> {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      throw new AppError("Referenced category not found.", 404);
    }
  }

  static parseCreateData(body: DrinkInput) {
    const { name, price, stock, categoryId, imageUrl } = body;

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

    return {
      name: name.trim(),
      price: parsedPrice,
      stock: parsedStock,
      categoryId: parsedCategoryId,
      imageUrl: this.normalizeImageUrl(imageUrl),
    };
  }

  static async applyUpdateData(drink: Drink, body: DrinkInput): Promise<void> {
    const { name, price, stock, categoryId, imageUrl } = body;

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
      await this.validateCategory(parsedCategoryId);
      drink.categoryId = parsedCategoryId;
    }

    if (imageUrl !== undefined) {
      drink.imageUrl = this.normalizeImageUrl(imageUrl);
    }
  }

  static async ensureCanDelete(drinkId: number): Promise<void> {
    const salesCount = await SaleItem.count({ where: { drinkId } });
    if (salesCount > 0) {
      throw new AppError("Cannot delete drink because it is associated with existing sales.", 400);
    }
  }
}

export default DrinkService;
