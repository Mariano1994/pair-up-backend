import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

interface IUser extends mongoose.Document {
	name: string;
	profissionalTitle?: string | null;
	email: string;
	password: string;
	age?: number | null;
	gender?: "male" | "female" | "other" | null;
	photoUrl?: string | null;
	skills?: string[];
	about?: string | null;
	getJWTToken(): Promise<string>;
}

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
					return validator.isEmail(v);
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
					return validator.isStrongPassword(v);
				},
				message:
					"Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
			},
		},
		age: {
			type: Number,
			required: false,
			validate: {
				validator: (v: number) => {
					return validator.isInt(v.toString(), { min: 18 });
				},
				message: "Age must be at least 18 years old",
			},
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
			validate: {
				validator: (v: string) => {
					return validator.isIn(v, ["male", "female", "other"]);
				},
				message: "Gender must be either male, female, or other",
			},
		},
		photoUrl: { type: String, default: null, required: false },
		skills: { type: [String], default: [], required: false },
		about: { type: String, default: null, required: false },
	},
	{ timestamps: true },
);

/**
 * Generates a JSON Web Token (JWT) for the current user instance.
 * The token includes the user's _id as the subject ("sub") and is valid for 7 days.
 * Throws an error if the JWT secret key is not found in environment variables.
 */
userSchema.methods.getJWTToken = async function () {
	// check if jwt secret key is present
	if (!process.env.SECRET_KEY_JWT) {
		throw new Error("Server configuration error: JWT secret key not found");
	}

	const token = jwt.sign({ sub: this._id }, process.env.SECRET_KEY_JWT, {
		expiresIn: "7d",
	});

	return token;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
