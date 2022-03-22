"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const jwt = require("jsonwebtoken");
exports.SessionController = {
    signIn: {
        post: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            // 로그인을 위한 이메일, 패스워드 받기
            const { user_id, password } = yield req.body;
            try {
                const findUser = yield __1.db
                    .collection("user")
                    .findOne({ user_id: req.body.user_id, password: req.body.password });
                if (findUser) {
                    const accessToken = jwt.sign({ name: user_id }, process.env.ACCESS_SECRET, { expiresIn: 60 * 60 });
                    // user_id을 playload에 담은 토큰을 쿠키로 전달
                    res.cookie("accessToken", accessToken, {
                        sameSite: "none",
                    });
                    console.log("logged in", accessToken);
                    return res.status(200).json({ message: "Successfully logged in" });
                }
            }
            catch (err) {
                console.log(err);
                return res.status(400).json({ message: "Bad request" });
            }
        }),
    },
    // logout, clear cookie
    signOut: {
        get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            function getCookie(name) {
                let matches = String(req.headers.cookie).match(new RegExp("(?:^|; )" +
                    name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
                    "=([^;]*)"));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            }
            const accessToken = getCookie("accessToken");
            const user_id = jwt.verify(accessToken, process.env.ACCESS_SECRET);
            try {
                res.clearCookie("accessToken", { sameSite: "none" });
                return res.status(200).json({ message: "Successfully logged out" });
            }
            catch (err) {
                console.log(err);
                return res.status(400).json({ message: "Failed logged out" });
            }
        }),
    },
};
