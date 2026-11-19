import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { User } from "../models/index.js";
import { UserService } from "./user.service.js";

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

function sanitizeUser(user: User): Record<string, unknown> {
  const userJson = user.toJSON() as Record<string, unknown>;
  delete userJson.password;
  return userJson;
}

export class AuthService {
  static async register(body: RegisterBody) {
    return UserService.createUser(body, "client");
  }

  static async login(body: LoginBody) {
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      throw new AppError("Fields email and password are required.", 400);
    }

    if (!User.validateEmail(email)) {
      throw new AppError("Invalid email format.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
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

    return { token, user: sanitizeUser(user) };
  }
}

export default AuthService;
