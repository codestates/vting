import { Router } from "express";
import { VoterController } from "../controllers/voter";

const router = Router();

// router.post("/", controller.post);

router.get("/test", VoterController.test.get);
router.patch("/:accessCode", VoterController.vote.patch);

// router.delete("/:id", VoterController.delete.delete);
// router.patch("/:id", VoterController.undergoing.patch);

export default router;
