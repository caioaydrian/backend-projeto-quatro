import { type Request, type Response } from "express";
import { Op } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { Sale, User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";

interface UserBody {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  role?: string;
}

interface PasswordValidationResult {
  isValid: boolean;
  level: "Weak" | "Medium" | "Strong";
  message?: string;
}

export class UserController {
  static validateEmail(email: string): boolean {
    if (typeof email !== "string") return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  static validateCPF(cpf: string): boolean {
    if (typeof cpf !== "string") return false;

    // tudo que não é numero é tirado
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

  static validatePasswordLevel(password: string): PasswordValidationResult {
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

  static async create(req: Request, res: Response) {
    const { name, email, password, cpf, role } = req.body as UserBody;

    if (!name || !email || !password || !cpf) {
      throw new AppError("Fields name, email, password, and cpf are required.", 400);
    }

    if (!UserController.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    if (!UserController.validateCPF(cpf)) {
      throw new AppError("Invalid CPF.", 400);
    }

    const passwordValidation = UserController.validatePasswordLevel(password);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.message ?? "Invalid password.", 400);
    }

    const cleanCPF = cpf.replace(/\D/g, "");
    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await User.findOne({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      throw new AppError("Email is already registered.", 409);
    }

    const existingCPF = await User.findOne({
      where: { cpf: cleanCPF },
    });
    if (existingCPF) {
      throw new AppError("CPF is already registered.", 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      cpf: cleanCPF,
      role: role ?? "client",
    });

    const userJson = user.toJSON() as Record<string, unknown>;
    delete userJson.password;

    return res.status(201).json({
      message: "User created successfully.",
      user: userJson,
    });
  }

  static async findAll(req: Request, res: Response) {
    const { page, limit, offset } = getPagination(req);

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    return res.status(200).json(formatPaginatedResponse(rows, count, page, limit));
  }

  static async findById(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid user ID.", 400);
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    return res.status(200).json(user);
  }

  static async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid user ID.", 400);
    }

    if (req.user?.id !== id) {
      throw new AppError("Access denied. You can only edit your own user.", 403);
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const { name, email, password, cpf, role } = req.body as UserBody;

    if (!name || !email || !cpf || !password) {
      throw new AppError("Fields name, email, cpf, and password are required.", 400);
    }

    if (typeof email !== "string" || !UserController.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    if (email.trim().toLowerCase() !== user.email) {
      throw new AppError("Email cannot be updated.", 400);
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new AppError("Name cannot be empty.", 400);
    }

    if (!UserController.validateCPF(cpf)) {
      throw new AppError("Invalid CPF.", 400);
    }

    const cleanCPF = cpf.replace(/\D/g, "");
    const existingCPF = await User.findOne({
      where: {
        cpf: cleanCPF,
        id: { [Op.ne]: id },
      },
    });
    if (existingCPF) {
      throw new AppError("CPF is already registered for another user.", 409);
    }

    const passwordValidation = UserController.validatePasswordLevel(password);
    if (!passwordValidation.isValid) {
      throw new AppError(passwordValidation.message ?? "Invalid password.", 400);
    }

    user.name = name.trim();
    user.cpf = cleanCPF;
    user.setPassword(password);

    if (role !== undefined) {
      user.role = role;
    }

    await user.save();

    const userJson = user.toJSON() as Record<string, unknown>;
    delete userJson.password;

    return res.status(200).json({
      message: "User updated successfully.",
      user: userJson,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid user ID.", 400);
    }

    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const salesCount = await Sale.count({ where: { userId: id } });
    if (salesCount > 0) {
      throw new AppError("Cannot delete user because they have associated sales.", 400);
    }

    await user.destroy();
    return res.status(200).json({ message: "User deleted successfully." });
  }
}

export default UserController;
