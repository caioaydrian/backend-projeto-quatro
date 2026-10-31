import { type Request, type Response } from "express";
import { Op } from "sequelize";
import { User } from "../models/user.js";

export class UserController {
  static validateEmail(email: string) {
    if (typeof email !== "string") return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  static validateCPF(cpf: string) {
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

  static validatePasswordLevel(password: string) {
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
    try {
      const { name, email, password, cpf, role } = req.body;

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

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        cpf: cleanCPF,
        role: role ?? "client",
      });

      const userJson = user.toJSON();
      delete userJson.password;

      return res.status(201).json({
        message: "User registered successfully.",
        user: userJson,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async findById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID." });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID." });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const { name, email, password, cpf, role } = req.body;

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({ error: "Name cannot be empty." });
        }
        user.name = name.trim();
      }

      if (email !== undefined) {
        if (!UserController.validateEmail(email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }
        const normalizedEmail = email.trim().toLowerCase();
        const existingEmail = await User.findOne({
          where: {
            email: normalizedEmail,
            id: { [Op.ne]: id },
          },
        });
        if (existingEmail) {
          return res.status(409).json({ error: "Email is already registered for another user." });
        }
        user.email = normalizedEmail;
      }

      if (cpf !== undefined) {
        if (!UserController.validateCPF(cpf)) {
          return res.status(400).json({ error: "Invalid CPF." });
        }
        const cleanCPF = cpf.replace(/\D/g, "");
        const existingCPF = await User.findOne({
          where: {
            cpf: cleanCPF,
            id: { [Op.ne]: id },
          },
        });
        if (existingCPF) {
          return res.status(409).json({ error: "CPF is already registered for another user." });
        }
        user.cpf = cleanCPF;
      }

      if (password !== undefined) {
        const passwordValidation = UserController.validatePasswordLevel(password);
        if (!passwordValidation.isValid) {
          return res.status(400).json({ error: passwordValidation.message });
        }
        user.setPassword(password);
      }

      if (role !== undefined) {
        user.role = role;
      }

      await user.save();

      const userJson = user.toJSON();
      delete userJson.password;

      return res.status(200).json({
        message: "User updated successfully.",
        user: userJson,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID." });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      await user.destroy();
      return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}

export default UserController;
