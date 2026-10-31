import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class User extends Model {
  declare public id: number;
  declare public name: string;
  declare private password: string;
  declare public role: string;

  get email(): string {
    return this.getDataValue("email");
  }
  set email(value: string) {
    this.setDataValue("email", value.trim().toLowerCase());
  }

  get cpf(): string {
    return this.getDataValue("cpf");
  }
  set cpf(value: string) {
    this.setDataValue("cpf", value.replace(/\D/g, ""));
  }

  public setPassword(password: string) {
    if (!password || password.length < 8) {
      throw new Error("A senha deve ter no mínimo 8 caracteres.");
    }
    this.setDataValue("password", password);
  }

  public checkPassword(password: string) {
    return this.getDataValue("password") === password;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "client",
    },
  },
  {
    sequelize: sequelize,
    modelName: "User",
    tableName: "users",
  }
);
