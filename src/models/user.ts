import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		profissionalTitle: { type: String, required: false },
		email: {
			type: String,
			required: true,
			lowercase: true,
			unique: true,
			validate: {
				validator: (v: string) => {
					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
				},
				message: "Invalid email format",
			},
			message: "This email is already in use",
			trim: true,
		},
		password: {
			type: String,
			required: true,
			validate: {
				validator: (v: string) => {
					return v.length >= 8;
				},
				message: "Password must be at least 8 characters long",
			},
		},
		age: {
			type: Number,
			required: false,
			validate: {
				validator: (v: number) => {
					return v >= 18;
				},
				message: "Age must be at least 18 years old",
			},
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
			message: "Gender must be either male, female, or other",
		},
		photoUrl: { type: String, default: null, required: false },
		skills: { type: [String], default: [], required: false },
		about: { type: String, default: null, required: false },
	},
	{ timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
