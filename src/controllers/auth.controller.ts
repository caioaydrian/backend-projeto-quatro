import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { User } from "../models/user.js";

interface RegisterBody {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, password, cpf } = req.body as RegisterBody;

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
      role: "client",
    });

    const userJson = user.toJSON() as Record<string, unknown>;
    delete userJson.password;

    return res.status(201).json({
      message: "User registered successfully.",
      user: userJson,
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as LoginBody;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      throw new AppError("Fields email and password are required.", 400);
    }

    if (!User.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      where: { email: normalizedEmail },
    });

    const isPasswordValid = user ? await user.checkPassword(password) : false;

    if (!user || !isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    const secret = process.env.JWT_SECRET || "default_jwt_secret_key";
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      secret,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    const userJson = user.toJSON() as Record<string, unknown>;
    delete userJson.password;

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: userJson,
    });
  }
}

export default AuthController;
