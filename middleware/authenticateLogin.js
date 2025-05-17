import jwt from "jsonwebtoken";
import { User } from "../models/user_model.js";
const SECRET = process.env.JWT_SECRET;
const protect = async (req,res,next)=>{
	let token 
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
		try {
			token = req.headers.authorization.split(" ")[1];
			const decoded = jwt.verify(token, SECRET)
			req.user = await User.findById(decoded.id).select('-password')
			next()
		} catch (error) {
			console.log(error)
			res.status(401).send("Not Authorized");
		}
	}	
	if(!token){
		res.status(401).send("Not Authorized, Token Not Found");
	}
}
export default protect