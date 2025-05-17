import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
		},
		user_owner_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

export const License = mongoose.model("License", licenseSchema);
