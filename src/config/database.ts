const mongoose = require('mongoose')
const URI = "mongodb+srv://pair_up:y3phNkYUeQkbKDH8@pairup.d6dlbnm.mongodb.net/pairup"


const connectDb = async () => {
  await mongoose.connect(URI)
}

module.exports = connectDb

