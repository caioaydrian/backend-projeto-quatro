import { DataTypes, ForeignKey, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { Sale } from "./sale.js";
import { Drink } from "./drink.js";

export class SaleItem extends Model {
  declare id: number;
  declare saleId: ForeignKey<Sale["id"]>;
  declare drinkId: ForeignKey<Drink["id"]>;
  declare quantity: number;
  declare unitPrice: number;
}

SaleItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sale,
        key: "id",
      },
    },
    drinkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Drink,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "SaleItem",
    tableName: "sale_items",
  }
);
