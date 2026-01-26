import mongoose from "mongoose";
import validator from "validator";

export interface ICollaborationRequestProps extends mongoose.Document {
	collaboratorId: mongoose.Schema.Types.ObjectId;
	projectId: mongoose.Schema.Types.ObjectId;
	status: "pendding" | "accepted" | "rejected";
}

const { Schema } = mongoose;

const collaborationRequestSchema = new Schema(
	{
		collaboratorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
		status: {
			type: String,
			enum: ["pendding", "accepted", "rejected"],
			default: "pendding",
			required: true,
			validator: (v: string) => {
				return validator.isIn(v, ["pendding", "accepted", "rejected"]);
			},
			message: `{VALUE} is not a valid status`,
		},
	},
	{ timestamps: true },
);

export const CollaborationRequest = mongoose.model<ICollaborationRequestProps>(
	"CollaborationRequest",
	collaborationRequestSchema,
);
