import { Request, Response } from "express";
import UserService from "../services/user.service.js";

export default class UserController {
    static async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const output = await UserService.registerUsers(req.body);
            res.status(201).json({ message: "Usuario creado con éxito", data: output });
        } catch (error: any) {
            res.status(500).json({ message: "Error al crear el usuario", error: error.message });
        }
    }

    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsers();
            res.status(200).json({ message: "Usuarios recuperados con éxito", data: users });
        } catch (error: any) {
            res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
        }
    }

    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return;
            }
            res.status(200).json({ message: "Usuario encontrado", data: user });
        } catch (error: any) {
            res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
        }
    }

    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const updatedUser = await UserService.updateUser(req.params.id, req.body);
            if (!updatedUser) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return;
            }
            res.status(200).json({ message: "Usuario actualizado con éxito", data: updatedUser });
        } catch (error: any) {
            res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
        }
    }

    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await UserService.deleteUser(req.params.id);
            if (!deleted) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return;
            }
            res.status(200).json({ message: "Usuario eliminado con éxito" });
        } catch (error: any) {
            res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
        }
    }
}