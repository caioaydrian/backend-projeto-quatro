import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { UserController } from "./user.controller.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, cpf } = req.body;

      if (!name || !email || !password || !cpf) {
        return res.status(400).json({
          error: "Fields name, email, password, and cpf are required.",
        });
      }

      if (!UserController.validateEmail(email)) {
        return res.status(400).json({
          error: "Invalid email format.",
        });
      }

      if (!UserController.validateCPF(cpf)) {
        return res.status(400).json({
          error: "Invalid CPF.",
        });
      }

      const passwordValidation = UserController.validatePasswordLevel(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: passwordValidation.message,
        });
      }

      const cleanCPF = cpf.replace(/\D/g, "");
      const normalizedEmail = email.trim().toLowerCase();

      const existingEmail = await User.findOne({
        where: { email: normalizedEmail },
      });
      if (existingEmail) {
        return res.status(409).json({
          error: "Email is already registered.",
        });
      }

      const existingCPF = await User.findOne({
        where: { cpf: cleanCPF },
      });
      if (existingCPF) {
        return res.status(409).json({
          error: "CPF is already registered.",
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        cpf: cleanCPF,
        role: "client",
      });

      const userJson = user.toJSON();
      delete userJson.password;

      return res.status(201).json({
        message: "User registered successfully.",
        user: userJson,
      });
    } catch (error) {
      console.error("Error during user registration:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password || typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({
          error: "Fields email and password are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({
        where: { email: normalizedEmail },
      });

      const isPasswordValid = user ? await user.checkPassword(password) : false;

      if (!user || !isPasswordValid) {
        return res.status(401).json({
          error: "Invalid email or password.",
        });
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

      const userJson = user.toJSON();
      delete userJson.password;

      return res.status(200).json({
        message: "Login successful.",
        token,
        user: userJson,
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default AuthController;
