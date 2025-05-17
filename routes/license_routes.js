import express from "express";
import { License } from "../models/license_model.js";
import { User } from "../models/user_model.js";
import authAdmin from "../middleware/authenticateSuperAdmin.js"; // For superadminonly
import protect from "../middleware/authenticateLogin.js"; // For a user's action

const router = express.Router();
const generateApiKey = (length = 32) => {
	let apiKey = "";
	for (let i = 0; i < 32; i++) {
		const digit = Math.floor(Math.random() * 10);
		apiKey += digit;
	}
	return apiKey;
};
router.get("/", async (req, res) => {
	console.log("Licensing API Routing Setup Correctly!");
	res.status(200).send("This is working!");
});
router.get("/get-all-licenses", protect, authAdmin, async (req, res) => {
	try {
		const allLicenses = await License.find({});
		if (allLicenses.length < 0) {
			console.log("No Licenses Exist!");
		} else {
			console.log("License: ", allLicenses.length);
			return res.status(200).json({
				count: allLicenses.length,
				data: allLicenses,
			});
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
	}
});
router.post("/license-create", protect, authAdmin, async (req, res) => {
	try {
		const key = generateApiKey();
		const { user_owner_id } = req.body;
		if (!user_owner_id) {
			console.log("No User Owner Id In Request");
			return res.status(401).send("User ID Has not been submitted!");
		}
		const user = await User.findOne({ user_owner_id });
		if (user) {
			const newLicense = {
				key: key,
				user_owner_id: user_owner_id,
			};
			const createdLicense = await License.create(newLicense);
			return res
				.status(200)
				.send("New License Created For The User: ", +createdLicense);
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
	}
});
router.delete("/license-delete/:id", protect, authAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) {
			console.log("No License Id In Request");
			return res.status(401).send("License ID Has not been submitted!");
		}
		const result = await License.findByIdAndDelete(id);
		const remainingLicenses = await License.find({});
		res
			.status(200)
			.send(`License Has Been Deleted, Remaining Are: ${remainingLicenses}`);
		console.log(`License of ID: ${id}, Has Been Deleted!`);
	} catch (error) {
		console.log(`Error Occured: ${error}`);
	}
});
router.post("/license-update/:id", protect, async (req, res) => {
	// Update Owner Of A License, Get the license id from the params, get the user owner id from
	try {
		const { id } = req.params;
		const { new_user_owner_id } = req.body;
		if (!new_user_owner_id) {
			return res.status(400).json({ message: "New owner ID is required" });
		}
		if (!id) {
			console.log("No License Id In Request");
			return res.status(401).send("License ID Has not been submitted!");
		}
		const license = await License.findById(id);
		if (!license) {
			console.log("An invalid license was submitted!");
			res.status(400).send("Invalid License ID submitted!");
		}
		license.user_owner_id = new_user_owner_id;
		await license.save();
		res.status(200).send(`New License: ${license}`);
	} catch (error) {
		console.log(`Error Occured: ${error}`);
	}
});
export default router;
