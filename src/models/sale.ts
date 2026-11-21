import { DataTypes, ForeignKey } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BaseModel } from "./base-model.js";
import { User } from "./user.js";

export class Sale extends BaseModel {
  protected static override resourceName = "sale";

  declare public userId: ForeignKey<User["id"]>;
  declare public totalPrice: number;
  declare public status: string;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "completed", // ex: pending, completed, canceled
    },
  },
  {
    sequelize: sequelize,
    modelName: "Sale",
    tableName: "sales",
  }
);
