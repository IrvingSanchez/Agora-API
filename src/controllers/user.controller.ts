import { Request, Response } from "express";
import UserService from "../services/user.service.js";

export default class UserController {
    static async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const output = await UserService.registerUsers(req.body);
            res.status(200).json({ message: "Comando ejecutado con éxito", output });
        } catch (error: any) {
            res.status(500).json({ message: "Error al ejecutar el comando", error: error.message });
        }
    }
}