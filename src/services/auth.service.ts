import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "../errors/AppError.js";
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

export class AuthService {
  static async register(body: RegisterBody) {
    return UserService.createUser(body, "client");
  }

  static async login(body: LoginBody) {
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      throw new BadRequestError("Fields email and password are required.");
    }

    if (!User.validateEmail(email)) {
      throw new BadRequestError("Invalid email format.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    const isPasswordValid = user ? await user.checkPassword(password) : false;

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
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

    return { token, user: user.toSafeObject() };
  }
}

export default AuthService;
