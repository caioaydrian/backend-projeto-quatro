import { DataTypes, ForeignKey, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { Category } from "./category.js";

export class Drink extends Model {
  declare id: number;
  declare name: string;
  declare price: number;
  declare stock: number;
  declare categoryId: ForeignKey<Category["id"]>;
  declare imageUrl: string | null;
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
