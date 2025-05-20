const SECRET = process.env.JWT_SECRET;
const authAdmin = async (req, res, next) => {
	try {
		console.log("Admin Check - User Performed An Action:", req.user); // Debugging
		if (req.user && req.user.role == "Superadmin") {
			console.log(`Admin Check Successful for: ${req.user.username}`);
			return next();
		} else {
			return res.status(403).send("Not Authorized As Admin");
		}
	} catch (error) {
		console.log(
			`Error Occured While Authenticating Superadmin Privilages, Error: ${error}`
		);
		return res.status(403).send("Error Encountered Try Again Later!");
	}
};
export default authAdmin;
