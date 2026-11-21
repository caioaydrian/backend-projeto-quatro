import { DataTypes, ForeignKey } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { BaseModel } from "./base-model.js";
import { User } from "./user.js";
import { Drink } from "./drink.js";

export class Review extends BaseModel {
  protected static override resourceName = "review";

  declare public userId: ForeignKey<User["id"]>;
  declare public drinkId: ForeignKey<Drink["id"]>;
  declare public rating: number;
  declare public comment: string | null;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

Review.init(
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
    drinkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Drink,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    modelName: "Review",
    tableName: "reviews",
  }
);
