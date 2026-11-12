import { DataTypes, ForeignKey, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";
import { User } from "./user.js";
import { Drink } from "./drink.js";

export class Review extends Model {
  declare id: number;
  declare userId: ForeignKey<User["id"]>;
  declare drinkId: ForeignKey<Drink["id"]>;
  declare rating: number;
  declare comment: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
