import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router();

// Crear usuario
router.post("/register", UserController.registerUser);

// Obtener todos los usuarios
router.get("/", UserController.getAllUsers);

// Obtener un usuario por ID
router.get("/:id", UserController.getUserById);

// Actualizar usuario
router.put("/:id", UserController.updateUser);

// Eliminar usuario
router.delete("/:id", UserController.deleteUser);

export default router;
