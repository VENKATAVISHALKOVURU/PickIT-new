import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shopRouter from "./shop";
import ordersRouter from "./orders";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopRouter);
router.use(ordersRouter);
router.use(analyticsRouter);

export default router;
