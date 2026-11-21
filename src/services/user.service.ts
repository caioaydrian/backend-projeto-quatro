import { Op } from "sequelize";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/AppError.js";
import { Sale, User } from "../models/index.js";

interface UserInput {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  role?: string;
}

export class UserService {
  static validateRequiredForCreate(body: UserInput): void {
    const { name, email, password, cpf } = body;
    if (!name || !email || !password || !cpf) {
      throw new BadRequestError("Fields name, email, password, and cpf are required.");
    }
  }

  static validateCredentialsData(email: string, cpf: string, password: string): void {
    if (!User.validateEmail(email)) {
      throw new BadRequestError("Invalid email format.");
    }
    if (!User.validateCPF(cpf)) {
      throw new BadRequestError("Invalid CPF.");
    }
    const passwordValidation = User.validatePasswordLevel(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.message ?? "Invalid password.");
    }
  }

  static async ensureEmailAvailable(email: string): Promise<void> {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictError("Email is already registered.");
    }
  }

  static async ensureCpfAvailable(cpf: string, ignoreUserId?: number): Promise<void> {
    const where = ignoreUserId ? { cpf, id: { [Op.ne]: ignoreUserId } } : { cpf };
    const existingCPF = await User.findOne({ where });
    if (existingCPF) {
      throw new ConflictError(
        ignoreUserId ? "CPF is already registered for another user." : "CPF is already registered."
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

    return user.toSafeObject();
  }

  static async updateUser(id: number, body: UserInput) {
    const { name, email, password, cpf, role } = body;

    if (email !== undefined) {
      throw new BadRequestError("Email cannot be modified or updated.");
    }

    if (!name || !cpf || !password) {
      throw new BadRequestError("Fields name, cpf, and password are required.");
    }

    if (typeof name !== "string" || !name.trim()) {
      throw new BadRequestError("Name cannot be empty.");
    }

    if (!User.validateCPF(cpf)) {
      throw new BadRequestError("Invalid CPF.");
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const cleanCPF = cpf.replace(/\D/g, "");
    await this.ensureCpfAvailable(cleanCPF, id);

    const passwordValidation = User.validatePasswordLevel(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestError(passwordValidation.message ?? "Invalid password.");
    }

    user.name = name.trim();
    user.cpf = cleanCPF;
    user.setPassword(password);

    if (role !== undefined) {
      user.role = role;
    }

    await user.save();
    return user.toSafeObject();
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const salesCount = await Sale.count({ where: { userId: id } });
    if (salesCount > 0) {
      throw new BadRequestError("Cannot delete user because they have associated sales.");
    }

    await user.destroy();
  }
}

export default UserService;
