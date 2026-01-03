import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: {
		type: String,
		required: true,
		unique: true,
		message: "This email is already in use",
	},
	password: { type: String, required: true },
	age: { type: Number, required: true },
	gender: {
		type: String,
		enum: ["male", "female", "other"],
		message: "Gender must be either male, female, or other",
	},
});

const User = mongoose.model("User", userSchema);

export default User;
