import express, { NextFunction, Request, Response } from "express";
import UserService from "./user.service";
import { generateToken, verifyToken } from "../../utils/jwt";

const UserController = {
  register: async (
    req: Request,
    res: Response<{ message: string; data?: any }>,
    next: NextFunction
  ) => {
    try {
      const { team, ...userData } = req.body;
      const filePath = req.file?.path;

      if (!team) {
        return res.status(400).send({ message: "팀 정보가 필요합니다." });
      }

      const newUser = await UserService.register(userData, team, filePath);

      return res.status(201).send({ message: "회원가입 성공", data: newUser });
    } catch (e) {
      next(e);
    }
  },
  logIn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_ID, password } = req.body;
      const { user, accessToken, refreshToken, team } = await UserService.logIn(
        user_ID,

        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).send({
        message: "로그인 성공",
        data: {
          user_ID: user.user_ID,
          name: user.name,
          avatar: user.avatar,
          team: team,
        },
        accessToken,
      });
    } catch (e) {
      next(e);
    }
  },
  refreshAccessToken: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "리프레시 토큰이 필요합니다." });
      }

      const decoded = verifyToken(refreshToken);
      const userId = (decoded as any).userId;

      const newAccessToken = generateToken(userId);
      res.status(200).send({ accessToken: newAccessToken });
    } catch (e) {
      next(e);
    }
  },
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(400).send({ message: "로그아웃할 유저가 없습니다." });
      }
      await UserService.logout(refreshToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(200).send({ message: "로그아웃 성공" });
    } catch (e) {
      next(e);
    }
  },

  updateUserInformation: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const updateData = req.body;
      await UserService.updateUserInformation(userId, updateData);
      res.status(200).send({ message: "유저 정보 수정 성공" });
    } catch (e) {
      next(e);
    }
  },

  findUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { searchInfo } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await UserService.findUser(
        searchInfo as string,
        page,
        limit
      );
      res.status(200).send({ message: "유저 검색 성공", data: users });
    } catch (e) {
      next(e);
    }
  },
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await UserService.getAllUsers(page, limit);
      res.status(200).send({ message: "모든 유저 조회 성공", data: users });
    } catch (e) {
      next(e);
    }
  },
};
export default UserController;