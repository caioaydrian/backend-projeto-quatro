import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database/sequelize.js";

export class User extends Model {
  declare public id: number;
  declare public name: string;
  declare public password: string;
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

  public async checkPassword(password: string) {
    const currentPassword = this.getDataValue("password");
    if (!currentPassword) return false;
    try {
      if (await bcrypt.compare(password, currentPassword)) {
        return true;
      }
    } catch {
      // Ignora erro se não for formato bcrypt válido
    }
    return currentPassword === password;
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
    hooks: {
      beforeCreate: async (user: User) => {
        const rawPassword = user.getDataValue("password");
        if (rawPassword && !rawPassword.startsWith("$2")) {
          const hashedPassword = await bcrypt.hash(rawPassword, 10);
          user.setDataValue("password", hashedPassword);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const rawPassword = user.getDataValue("password");
          if (rawPassword && !rawPassword.startsWith("$2")) {
            const hashedPassword = await bcrypt.hash(rawPassword, 10);
            user.setDataValue("password", hashedPassword);
          }
        }
      },
    },
  }
);
