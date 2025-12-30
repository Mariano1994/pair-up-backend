import mongoose from "mongoose";

const connectDb = async () => {
	if (!process.env.URI) {
		return;
	}
	await mongoose.connect(process.env.URI);
};

export default connectDb;
