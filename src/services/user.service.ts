import { Op } from "sequelize";
import { AppError } from "../errors/AppError.js";
import { Sale, User } from "../models/index.js";

interface UserInput {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  role?: string;
}

function sanitizeUser(user: User): Record<string, unknown> {
  const userJson = user.toJSON() as Record<string, unknown>;
  delete userJson.password;
  return userJson;
}

export class UserService {
  static validateRequiredForCreate(body: UserInput): void {
    const { name, email, password, cpf } = body;
    if (!name || !email || !password || !cpf) {
      throw new AppError("Fields name, email, password, and cpf are required.", 400);
    }
  }

  static validateCredentialsData(email: string, cpf: string, password: string): void {
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
  }

  static async ensureEmailAvailable(email: string): Promise<void> {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new AppError("Email is already registered.", 409);
    }
  }

  static async ensureCpfAvailable(cpf: string, ignoreUserId?: number): Promise<void> {
    const where = ignoreUserId
      ? { cpf, id: { [Op.ne]: ignoreUserId } }
      : { cpf };
    const existingCPF = await User.findOne({ where });
    if (existingCPF) {
      throw new AppError(
        ignoreUserId
          ? "CPF is already registered for another user."
          : "CPF is already registered.",
        409
      );
    }
  }

  static async createUser(body: UserInput, role = "client") {
    this.validateRequiredForCreate(body);
    const { name, email, password, cpf } = body;
    this.validateCredentialsData(email!, cpf!, password!);

    const cleanCPF = cpf!.replace(/\D/g, "");
    const normalizedEmail = email!.trim().toLowerCase();

    await this.ensureEmailAvailable(normalizedEmail);
    await this.ensureCpfAvailable(cleanCPF);

    const user = await User.create({
      name: name!.trim(),
      email: normalizedEmail,
      password: password!,
      cpf: cleanCPF,
      role,
    });

    return sanitizeUser(user);
  }

  static async updateUser(id: number, body: UserInput) {
    const { name, email, password, cpf, role } = body;

    if (!name || !email || !cpf || !password) {
      throw new AppError("Fields name, email, cpf, and password are required.", 400);
    }

    if (typeof email !== "string" || !User.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new AppError("Name cannot be empty.", 400);
    }

    if (!User.validateCPF(cpf)) {
      throw new AppError("Invalid CPF.", 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (email.trim().toLowerCase() !== user.email) {
      throw new AppError("Email cannot be updated.", 400);
    }

    const cleanCPF = cpf.replace(/\D/g, "");
    await this.ensureCpfAvailable(cleanCPF, id);

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
    return sanitizeUser(user);
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    const salesCount = await Sale.count({ where: { userId: id } });
    if (salesCount > 0) {
      throw new AppError("Cannot delete user because they have associated sales.", 400);
    }

    await user.destroy();
  }
}

export default UserService;
