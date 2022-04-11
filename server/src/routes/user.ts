import { Router } from "express";
import { UserController } from "../controllers/user";

const router = Router();

// router.post("/", controller.post);

router.post("/check", UserController.userCheck.post);
router.post("/", UserController.signup.post);
// router.post("/oauth", UserController.oauth.post);
router.delete("/", UserController.resign.delete);
router.get("/", UserController.userInfo.get);
router.patch("/", UserController.userInfo.patch);

export default router;
