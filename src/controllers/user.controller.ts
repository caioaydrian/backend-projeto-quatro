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

export class UserController {
  static async create(req: Request, res: Response) {
    const { name, email, password, cpf, role } = req.body as UserBody;

    if (!name || !email || !password || !cpf) {
      throw new AppError("Fields name, email, password, and cpf are required.", 400);
    }

    if (!User.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    if (!User.validateCPF(cpf)) {
      throw new AppError("Invalid CPF.", 400);
    }

    const passwordValidation = User.validatePasswordLevel(password);
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

    if (typeof email !== "string" || !User.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    if (email.trim().toLowerCase() !== user.email) {
      throw new AppError("Email cannot be updated.", 400);
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new AppError("Name cannot be empty.", 400);
    }

    if (!User.validateCPF(cpf)) {
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

    const passwordValidation = User.validatePasswordLevel(password);
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
