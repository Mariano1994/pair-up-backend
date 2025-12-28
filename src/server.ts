const express = require('express')
const connectDB = require('./config/database.ts')

const app = express()


connectDB().then(()=> {
  console.log('Database connected successfully')
app.listen(3000, ()=> {
  console.log('server is runninh on port 3000')
})
}).catch((error: Error)=> {
  console.log('Can not connecto to database', error.message)
})

