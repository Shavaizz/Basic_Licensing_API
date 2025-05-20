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
	// Displays all licenses
	try {
		const allLicenses = await License.find({});
		if (allLicenses.length < 0) {
			console.log("No Licenses Exist!");
			return res.status(200).send("No Licenses Exist!");
		} else {
			console.log("License: ", allLicenses.length);
			return res.status(200).json({
				count: allLicenses.length,
				data: allLicenses,
			});
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
		res.status(500).send(`Error Occured: ${error}`);
	}
});
router.post("/new-license", protect, authAdmin, async (req, res) => {
	// Creates a license
	try {
		const key = generateApiKey();
		const { user_owner_id } = req.body;
		if (!user_owner_id) {
			console.log("No User Owner Id In Request");
			return res.status(400).send("User ID Has not been submitted!");
		}
		const user = await User.findById(user_owner_id);
		if (user) {
			const newLicense = {
				key: key,
				user_owner_id: user_owner_id,
				active: false,
			};
			const createdLicense = await License.create(newLicense);
			return res.status(200).json({
				message: "New License Created!",
				key: createdLicense.key,
				user: user.username,
				active: createdLicense.active,
			});
		} else {
			return res.status(404).send("This user doesn't exist");
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
		res.status(500).send(`Error Occured: ${error}`);
	}
});
router.delete("/license-delete/:id", protect, authAdmin, async (req, res) => {
	// Delete A License
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
		res.status(500).send(`Error Occured: ${error}`);
	}
});
router.post("/owner-license-update", protect, async (req, res) => {
	// Change Owner Of A License
	try {
		const { id } = req.body;
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
		res.status(500).send(`Error Occured: ${error}`);
	}
});
router.get("/checkauth/:id", async (req, res) => {
	// Checking Validity Of A License
	try {
		const { id } = req.params; // License
		if (!id) {
			return res
				.status(400)
				.json({ message: "License has not been submitted" });
		}
		const license = await License.findById(id);
		if (license && license.active == true) {
			return res.status(200).json({ message: "License exists and is active" });
		} else if (license && license.active == false) {
			return res
				.status(200)
				.json({ message: "License exists and is inactive" });
		} else {
			return res
				.status(404)
				.json({ message: "Submitted License doesn't exist!" });
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
		res.status(500).send(`Error Occured: ${error}`);
	}
});
router.post("/change_license_status", protect, async (req, res) => {
	// Change License State Active: T/F
	try {
		const req_sent_by_user = req.user;
		const req_user_role = req.user.role;
		const { license_id, active } = req.body;
		if (!req_sent_by_user || !req_user_role || !license_id) {
			return res
				.status(404)
				.send(
					"Either Req User can not be received, Req User role can not be received or license key is missing from request body! Fill all the necessary data!"
				);
		}
		const license = await License.findById(license_id);
		const license_owner = license.user_owner_id;
		if (license_owner == req.user._id || req.user.role == "Superadmin") {
			console.log("License Status Being Changed!");
			console.log(
				`Data Received, Req User: ${req_sent_by_user}, Req User Role: ${req_user_role}, License: ${license}`
			);
			license.active = active;
			await license.save();
			return res
				.status(200)
				.send(`License Status Changed, New State: ${license.active}`);
		} else {
			return res
				.status(403)
				.send(`License State can not be modified by an unauthorized user`);
		}
	} catch (error) {
		console.log(`Error Occured: ${error}`);
		res.status(500).send(`Error Occured: ${error}`);
	}
});
export default router;
