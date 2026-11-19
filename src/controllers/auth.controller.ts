import { type Request, type Response } from "express";
import { AuthService } from "../services/auth.service.js";

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
    const user = await AuthService.register(req.body as RegisterBody);

    return res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  }

  static async login(req: Request, res: Response) {
    const { token, user } = await AuthService.login(req.body as LoginBody);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user,
    });
  }
}

export default AuthController;
