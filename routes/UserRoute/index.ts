import { Request, Response, Router } from "express";
import { check, validationResult } from "express-validator";
import { encode, decode } from "js-base64";
import { Error } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../model/UserModel";
import { authMiddleware, AuthRequest } from "../../middleware";
import { JWT_SECRET } from "../../config";

async function validateUsername(username: string) {
  const user = await User.findOne({ username });
  if (user) return false;
  return true;
}

// Create a new instance of the Express Router
const UserRouter = Router();

// @route    GET api/users
// @desc     Get user by token
// @access   Private
UserRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select([
      "-password",
      "-mnemonic",
      "-role",
      "-referrerlId",
    ]);

    res.json(user)
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).send({ error: err });
  }
});

// @route    GET api/users/username
// @desc     Is username available
// @access   Public
UserRouter.get("/username", async (req, res) => {
  try {
    const { username } = req.query;
    const isValid = await validateUsername(username as string);
    return res.json({ isValid });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send({ error });
  }
});

// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post(
  "/signup",
  check("username", "Username is required").notEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("confirmPassword", "Passwords do not match").custom(
    (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }
  ),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const { username, email, password, encodedReferrer } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: "User already exists" });
      }

      const isValid = await validateUsername(username);
      if (!isValid)
        return res.status(400).json({ error: "Username already exists" });

      let referrerId: string | null = null;
      if (encodedReferrer) {
        const referrerEmail = decode(encodedReferrer);
        const referrer = await User.findOne({ email: referrerEmail });
        referrerId = referrer?._id.toString() || null;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        inviteLink: encode(email),
        referrerId,
      });

      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1day" });
      return res.json({ token });
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error });
    }
  }
);

// @route    POST api/users/signin
// @desc     Authenticate user & get token
// @access   Public
UserRouter.post(
  "/signin",
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "Invalid Email" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: "5 days" }, (err, token) => {
        if (err) throw err;
        return res.json({
          token,
        });
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).send({ error: error });
    }
  }
);

export default UserRouter;
