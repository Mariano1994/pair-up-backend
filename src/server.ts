import 'dotenv/config'
import type {Request, Response} from 'express'
import express from 'express'
import connectDB from './config/database.ts'
import User from './models/user.ts'

const app = express()

app.use(express.json())

app.post('/signup', async(req:Request, res:Response)=> {

  try {

    const {firstName, lastName, email, password, age, gender} = req.body
    
  const userData = {
    firstName,
    lastName,
    email,
    password,
    age,
    gender
  }

  const user = new User(userData)
  await user.save()

  res.status(201).send('User creates succssfully')

  } catch (error ) {
    console.log(error.message)
    res.status(400).send(error.message)
  }


})

connectDB().then(()=> {
  console.log('Database connected successfully')
app.listen(3000, ()=> {
  console.log('server is runninh on port 3000')
})
}).catch((error: Error)=> {
  console.log('Can not connecto to database', error.message)
})

