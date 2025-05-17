import { User } from "../models/user_model.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authAdmin from "../middleware/authenticateSuperAdmin.js" // For superadminonly
import protect from "../middleware/authenticateLogin.js"; // For a user's action
const router = express.Router();
// Both Protect and authAdmin to be used in unison to work, in order: protect, authAdmin async
router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		if (user && (await bcrypt.compare(password, user.password))) {
			const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
				expiresIn: "24h",
			});
			res.status(200).json({
				user: { id: user._id, username: user.username, role:user.role},
				token,
			});
		} else {
			res.status(401).json({ message: "Invalid username or password" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error logging in.", error });
	}
});
router.post("/logout", (req, res) => {
	res.status(200).json({ message: "Logged out successfully" });
});
router.post("/register",protect,authAdmin,async (req, res) => {
	try {
		if (!req.body) {
			console.log("No request body!");
			req.body = {};
		}
		const { username, password, role } = req.body;
		if (!username || !password || !role) {
			console.log(
				"Either Username Or Password Not Given! Request Body:",
				req.body
			);
			return res.status(400).send("All Fields Are Required! ");
		}
		const doesExistUser = await User.findOne({ username });
		if (doesExistUser) {
			console.log("User Already Exists");
			res.status(409).send("User Already Exists");
		} else {
			const validRoles = ['Admin', 'Superadmin'];
			if (!validRoles.includes(role)) {
				console.log("Invalid Role Type Attempted To Be Registered!")
				return res.status(400).send("Invalid role. Valid roles are Admin and SuperAdmin.");
			}
			const usernameOfUser = req.body.username;
			const reqPass = req.body.password;
			const hashedPassword = await bcrypt.hash(reqPass, 10);
			const newUser = {
				username: usernameOfUser,
				password: hashedPassword,
				role: role
			};
			const createdUser = await User.create(newUser);
			return res.status(200).send(`New User Created Successfully!, ${createdUser}`);
		}
	} catch (error) {
		console.log("Error Occured: ", error);
	}
});
export default router;
