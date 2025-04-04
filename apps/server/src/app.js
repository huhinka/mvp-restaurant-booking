import cors from "cors";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import { router as authRouter } from "./auth/auth.route.js";
import errorHandler from "./infrastructure/error-handler.js";
import { reservationRouters } from "./reservation/reservation.graphql.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/reservation", ...reservationRouters);

app.use(errorHandler);
