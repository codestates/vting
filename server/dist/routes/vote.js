"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vote_1 = require("../controllers/vote");
const router = (0, express_1.Router)();
// router.post("/", controller.post);
router.get("/test", vote_1.VoteController.test.get);
router.post("/", vote_1.VoteController.create.post);
router.get("/:accessCode", vote_1.VoteController.show_vote.get);
router.delete("/:accessCode", vote_1.VoteController.delete.delete);
router.patch("/:accessCode", vote_1.VoteController.undergoingAndPublic.patch);
exports.default = router;
