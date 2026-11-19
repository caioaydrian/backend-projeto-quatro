import { type Request, type Response } from "express";
import { AppError } from "../errors/AppError.js";
import { User } from "../models/index.js";
import { formatPaginatedResponse, getPagination } from "../utils/pagination.js";
import { UserService } from "../services/user.service.js";

interface UserBody {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  role?: string;
}

export class UserController {
  static async create(req: Request, res: Response) {
    const body = req.body as UserBody;
    const user = await UserService.createUser(body, body.role ?? "client");

    return res.status(201).json({
      message: "User created successfully.",
      user,
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

    const user = await UserService.updateUser(id, req.body as UserBody);

    return res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  }

  static async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("Invalid user ID.", 400);
    }

    await UserService.deleteUser(id);
    return res.status(200).json({ message: "User deleted successfully." });
  }
}

export default UserController;
