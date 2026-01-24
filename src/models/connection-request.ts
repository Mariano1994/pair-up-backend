import mongoose from "mongoose";
import validator from "validator";

const { Schema } = mongoose;

export interface IConnectionRequest extends mongoose.Document {
	fromUserId: mongoose.Schema.Types.ObjectId;
	toUserId: mongoose.Schema.Types.ObjectId;
	status: "pendding" | "accepted" | "rejected";
}

const connectionRequestSchema = new Schema(
	{
		fromUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // Reference to USER collection
			require: true,
		},
		toUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		status: {
			type: String,
			enum: ["pendding", "accepted", "rejected"],
			default: "pendding",
			require: true,
			validator: (v: string) => {
				return validator.isIn(v, ["pendding", "accepted", "rejected"]);
			},
			message: `{VALUE} is not valid statud`,
		},
	},
	{ timestamps: true },
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequest = mongoose.model<IConnectionRequest>(
	"ConnectionResquest",
	connectionRequestSchema,
);

export default ConnectionRequest;
