import mongoose from 'mongoose'
const {Schema} = mongoose


 const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  age: Number,
  gender: String
})


const User = mongoose.model('User', userSchema)

export default User