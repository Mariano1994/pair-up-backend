import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

export interface ICollaborator {
	name: string;
	photoUrl: string | null | undefined;
	about: string | null | undefined;
	profissionalTitle: string | null | undefined;
}

export interface IProject extends mongoose.Document {
	title: string;
	authorId: mongoose.Types.ObjectId;
	category?: string;
	description?: string;
	coverPhoto?: string;
	status: "not started" | "in progress" | "finished" | "canceled";
	collaborators: ICollaborator[];
}

const projectShema = new Schema<IProject>(
	{
		title: { type: String, require: true },
		authorId: { type: mongoose.Schema.Types.ObjectId, require: true },
		category: { type: String },
		description: { type: String, require: false, default: null },
		coverPhoto: { type: String, default: null, require: false },
		status: {
			type: String,
			enum: ["not started", "in progress", "finished", "canceled"],
			default: "not started",
			validate: {
				validator: (v: string) => {
					return validator.isIn(v, [
						"not started",
						"in progress",
						"finished",
						"canceled",
					]);
				},
				message:
					"Status must be either not started, in progress, finished or canceled",
			},
		},
		collaborators: {
			type: [
				{
					name: { type: String, required: true },
					photoUrl: { type: String, required: false, default: null },
					about: { type: String, required: false, default: null },
					profissionalTitle: { type: String, required: false, default: null },
				},
			],
			default: [],
			require: false,
		},
	},
	{ timestamps: true },
);

const Project = mongoose.model<IProject>("Project", projectShema);
export default Project;
