import { DataTypes } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BaseModel } from "./base-model.js";

export class Category extends BaseModel {
  protected static override resourceName = "category";

  declare public name: string;
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

