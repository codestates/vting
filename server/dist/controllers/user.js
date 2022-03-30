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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const __1 = require("..");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SALT_ROUNDS = 6;
const bcrypt = require("bcrypt");
exports.UserController = {
    //회원가입과 탈퇴시 모두 사용가능한 체크
    userCheck: {
        post: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { user_id, password } = req.body;
                console.log(user_id);
                if (user_id) {
                    const findUserWithId = yield __1.db
                        .collection("user")
                        .findOne({ user_id: user_id });
                    console.log(findUserWithId);
                    if (!findUserWithId) {
                        return res.status(200).json({
                            message: "It doesn't match",
                        });
                    }
                    else {
                        return res.status(200).json({
                            message: "Success verified",
                        });
                    }
                }
                else if (password) {
                    if (req.headers.authorization &&
                        req.headers.authorization.split(" ")[0] === "Bearer") {
                        let authorization = req.headers.authorization;
                        let token = authorization.split(" ")[1];
                        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
                        const findUserWithPw = yield __1.db
                            .collection("user")
                            .findOne({ user_id: decoded.user_id });
                        var check = yield bcrypt.compare(password, findUserWithPw.password);
                        console.log("check", check);
                        if (!check) {
                            return res.status(200).json({
                                message: "It doesn't match",
                            });
                        }
                        else {
                            return res.status(200).json({
                                message: "Success verified",
                            });
                        }
                    }
                }
            }
            catch (_a) {
                return res.status(400).json({ message: "Bad Request" });
            }
        }),
    },
    signup: {
        post: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            const { user_id, nickname, password, image, vote } = req.body;
            try {
                if (user_id && password && nickname) {
                    bcrypt.genSalt(SALT_ROUNDS, function (err, salt) {
                        if (err) {
                            console.log("genSalt Error: " + err);
                        }
                        else {
                            console.log("salt", salt);
                            bcrypt.hash(password, salt, function (err, hash) {
                                console.log("hash", hash);
                                __1.db.collection("user").insertOne({
                                    user_id: req.body.user_id,
                                    nickname: req.body.nickname,
                                    password: hash,
                                    image: req.body.image,
                                    vote: req.body.vote,
                                }, (err, data) => __awaiter(this, void 0, void 0, function* () {
                                    const accessToken = jsonwebtoken_1.default.sign({ user_id }, process.env.ACCESS_SECRET, {
                                        expiresIn: 60 * 60 * 60,
                                    });
                                    // user_id을 playload에 담은 토큰을 쿠키로 전달
                                    res.cookie("accessToken", accessToken, {
                                        sameSite: "none",
                                        secure: true,
                                    });
                                    let findUserId = yield __1.db
                                        .collection("user")
                                        .findOne({ user_id: req.body.user_id });
                                    console.log(findUserId._id);
                                    return res.status(201).json({
                                        data: {
                                            user_data: {
                                                _id: findUserId._id,
                                                user_id: req.body.user_id,
                                                nickname: req.body.nickname,
                                                image: req.body.image,
                                                vote: req.body.vote,
                                            },
                                            accessToken: accessToken,
                                        },
                                        message: "Successfully Signed Up",
                                    });
                                }));
                                if (err) {
                                    console.log("bycrpt hash method error : ", err.message);
                                }
                                else {
                                }
                            });
                        }
                    });
                }
                else {
                    return res.status(203).json({
                        data: null,
                        message: "Please fill in all required spaces",
                    });
                }
            }
            catch (err) {
                console.log(err);
                res.status(400).json({ message: "Sign up failed" });
            }
        }),
    },
    // oauth.post,
    resign: {
        delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            if (req.headers.authorization &&
                req.headers.authorization.split(" ")[0] === "Bearer") {
                let authorization = req.headers.authorization;
                let token = authorization.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
                try {
                    // 유저 정보 삭제하기
                    yield __1.db.collection("user").deleteOne({ user_id: decoded.user_id });
                    // 쿠키에 토큰 삭제하기
                    yield res.clearCookie("accessToken", {
                        sameSite: "none",
                        secure: true,
                    });
                    return res
                        .status(200)
                        .json({ message: "Successfully account deleted" });
                }
                catch (err) {
                    console.log(err);
                    return res.status(400).json({ message: "Bad request" });
                }
            }
        }),
    },
    userInfo: {
        get: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            if (req.headers.authorization &&
                req.headers.authorization.split(" ")[0] === "Bearer") {
                let authorization = req.headers.authorization;
                let token = authorization.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
                try {
                    const findUser = yield __1.db
                        .collection("user")
                        .findOne({ user_id: decoded.user_id });
                    if (findUser) {
                        return res.status(200).json({
                            data: {
                                _id: findUser._id,
                                nickname: findUser.nickname,
                                user_id: findUser.user_id,
                                image: findUser.image,
                                vote: findUser.vote,
                            },
                        });
                    }
                    else {
                        return res.status(400).json({ message: "Bad request" });
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
        }),
        patch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
            const { nickname, password, image } = req.body;
            if (req.headers.authorization &&
                req.headers.authorization.split(" ")[0] === "Bearer") {
                let authorization = req.headers.authorization;
                let token = authorization.split(" ")[1];
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET);
                try {
                    const findUser = yield __1.db
                        .collection("user")
                        .findOne({ user_id: decoded.user_id });
                    yield __1.db.collection("user").updateOne({ user_id: decoded.user_id }, 
                    //바디가 들어온것만 바꿈
                    {
                        $set: {
                            nickname: req.body.nickname || findUser.nickname,
                            image: req.body.image || findUser.image,
                            password: req.body.password || findUser.password,
                        },
                    });
                    return res.status(200).json({ message: "Successfully updated" });
                }
                catch (_b) {
                    return res.status(400).json({ message: "Bad request" });
                }
            }
        }),
    },
};
