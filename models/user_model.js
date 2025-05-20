import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		license: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "License",
			required: false,
		},
		role: {
			type: String,
			required: true,
			enum: ["Admin", "Superadmin"], // Only these two values allowed
		},
	},
	{
		timestamps: true,
	}
);
export const User = mongoose.model("User", userSchema);
