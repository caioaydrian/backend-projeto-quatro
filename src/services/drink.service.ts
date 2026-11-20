import { BadRequestError, NotFoundError } from "../errors/AppError.js";
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
      throw new NotFoundError("Referenced category not found.");
    }
  }

  static parseCreateData(body: DrinkInput) {
    const { name, price, stock, categoryId, imageUrl } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new BadRequestError("Drink name is required.");
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      throw new BadRequestError("Price must be a valid non-negative number.");
    }

    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      throw new BadRequestError("Stock must be a valid non-negative integer.");
    }

    const parsedCategoryId = Number(categoryId);
    if (isNaN(parsedCategoryId)) {
      throw new BadRequestError("Valid categoryId is required.");
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
        throw new BadRequestError("Name cannot be empty.");
      }
      drink.name = name.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        throw new BadRequestError("Price must be a valid non-negative number.");
      }
      drink.price = parsedPrice;
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
        throw new BadRequestError("Stock must be a valid non-negative integer.");
      }
      drink.stock = parsedStock;
    }

    if (categoryId !== undefined) {
      const parsedCategoryId = Number(categoryId);
      if (isNaN(parsedCategoryId)) {
        throw new BadRequestError("Invalid categoryId.");
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
      throw new BadRequestError("Cannot delete drink because it is associated with existing sales.");
    }
  }
}

export default DrinkService;
