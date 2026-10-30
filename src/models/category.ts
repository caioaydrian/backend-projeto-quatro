import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class Category extends Model {
  declare id: number;
  declare name: string;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Category",
    tableName: "categories",
  }
);

