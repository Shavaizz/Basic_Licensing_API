import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user_routes.js";
import licenseRoutes from "./routes/license_routes.js";
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
console.log("PORT: ", PORT);
console.log("MONGO_URL:", MONGO_URL);
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
	return res.status(200).send("Route Working");
});
app.use("/api/licenses", licenseRoutes);
app.use("/api/user", userRoutes);
mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.log("App connected to database");
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.log("Error Encountered: " + error);
	});
