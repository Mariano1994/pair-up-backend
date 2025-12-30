import mongoose from 'mongoose'

const connectDb = async () => {
  await mongoose.connect(process.env.URI!)
}

export default connectDb

