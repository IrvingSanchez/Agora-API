import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

import userRoutes from "./routes/users.routes.js";
import projectRoutes from "./routes/projects.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// ✅ Registrar rutas
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// Manejo básico de errores
app.use((req, res) => res.status(404).json({ message: "Not Found" }));

export default app;
