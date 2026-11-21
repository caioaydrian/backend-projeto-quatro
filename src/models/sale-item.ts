import { DataTypes, ForeignKey } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BaseModel } from "./base-model.js";
import { Sale } from "./sale.js";
import { Drink } from "./drink.js";

export class SaleItem extends BaseModel {
  protected static override resourceName = "sale item";

  declare public saleId: ForeignKey<Sale["id"]>;
  declare public drinkId: ForeignKey<Drink["id"]>;
  declare public quantity: number;
  declare public unitPrice: number;
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
