import { DataTypes, ForeignKey, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { User } from "./user.js";

export class Sale extends Model {
  declare id: number;
  declare userId: ForeignKey<User["id"]>;
  declare totalPrice: number;
  declare status: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
