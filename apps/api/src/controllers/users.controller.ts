import { Request, Response } from "express";
import { User } from "../models/user.model.js";

const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send("user-id is required");
  }

  try {
    const user = await User.findById(userId);

    if (userId) {
      res.status(200).json(user);
    } else {
      res.status(404).send("user not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving user");
  }
};

export default { getUserById };
