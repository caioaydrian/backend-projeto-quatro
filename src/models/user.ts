import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { sequelize } from "../database/sequelize.js";

export interface PasswordValidationResult {
  isValid: boolean;
  level: "Weak" | "Medium" | "Strong";
  message?: string;
}

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

  public static validateEmail(email: string): boolean {
    if (typeof email !== "string") return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  public static validateCPF(cpf: string): boolean {
    if (typeof cpf !== "string") return false;

    const cleanCPF = cpf.replace(/\D/g, "");

    if (cleanCPF.length !== 11) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
    }
    let firstRemainder = (sum * 10) % 11;
    if (firstRemainder === 10 || firstRemainder === 11) firstRemainder = 0;
    if (firstRemainder !== parseInt(cleanCPF.charAt(9), 10)) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
    }
    let secondRemainder = (sum * 10) % 11;
    if (secondRemainder === 10 || secondRemainder === 11) secondRemainder = 0;
    if (secondRemainder !== parseInt(cleanCPF.charAt(10), 10)) return false;

    return true;
  }

  public static validatePasswordLevel(password: string): PasswordValidationResult {
    if (typeof password !== "string" || password.length < 8) {
      return {
        isValid: false,
        level: "Weak",
        message: "Password must have at least 8 characters.",
      };
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (criteriaCount < 3) {
      return {
        isValid: false,
        level: "Weak",
        message:
          "Password must meet at least 3 of the following criteria: uppercase letter, lowercase letter, number, or special character.",
      };
    }

    const level = criteriaCount === 4 ? "Strong" : "Medium";

    return {
      isValid: true,
      level,
    };
  }

  public setPassword(password: string) {
    const validation = User.validatePasswordLevel(password);
    if (!validation.isValid) {
      throw new AppError(validation.message ?? "Invalid password.", 400);
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
