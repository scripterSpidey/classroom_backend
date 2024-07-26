import express from "express";
import { AdminRepo } from "../infrastructure/repositories/admin.repo";
import { AdminInteractor } from "../application/interactor/admin.interactor";
import { AdminContoller } from "../presentation/gateway/admin.gateway";

const router = express.Router();

const adminRepo = new AdminRepo();
const adminInteractor = new AdminInteractor(adminRepo);
const adminController = new AdminContoller(adminInteractor);

router.post('/login',adminController.onLogin.bind(adminController))

export default router;