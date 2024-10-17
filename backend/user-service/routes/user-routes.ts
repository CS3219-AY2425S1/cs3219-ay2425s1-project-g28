import express from "express";

import {
  createImageLink,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
  verifyUser,
} from "../controller/user-controller";
import {
  verifyAccessToken,
  verifyIsAdmin,
  verifyIsOwnerOrAdmin,
} from "../middleware/basic-access-control";

const router = express.Router();

router.get("/", verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch(
  "/:id/privilege",
  verifyAccessToken,
  verifyIsAdmin,
  updateUserPrivilege
);

router.post("/", createUser);

router.post("/images", createImageLink);

router.get("/:id", getUser);

router.get("/verify-email/:email/:token", verifyUser);

router.patch("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.delete("/:id", verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

export default router;
