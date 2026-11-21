import { DataTypes, ForeignKey } from "sequelize";
import { BadRequestError } from "../errors/AppError.js";
import { sequelize } from "../database/sequelize.js";
import { BaseModel } from "./base-model.js";
import { Category } from "./category.js";

export class Drink extends BaseModel {
  protected static override resourceName = "drink";

  declare public name: string;
  declare public price: number;
  declare public stock: number;
  declare public categoryId: ForeignKey<Category["id"]>;
  declare public imageUrl: string | null;

  public decreaseStock(quantity: number): void {
    const currentStock = Number(this.stock);
    if (currentStock < quantity) {
      throw new BadRequestError(
        `Insufficient stock for '${this.name}'. Available: ${currentStock}, Requested: ${quantity}.`
      );
    }
    this.stock = currentStock - quantity;
  }

  public increaseStock(quantity: number): void {
    const currentStock = Number(this.stock);
    this.stock = currentStock + quantity;
  }
}

Drink.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: Category,
        key: "id",
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Drink",
    tableName: "drinks",
  }
);
