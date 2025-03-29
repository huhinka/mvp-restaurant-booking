import express from "express";
import helmet from "helmet";
import cors from "cors";
import errorHandler from "./infrastructure/error-handler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use(errorHandler);
