const express = require('express')
import type{ Request , Response} from 'express'
const app = express()

const users = [{name: 'Mriano', age: '32'}, {name: 'Neri', age: '31'}]

app.use('/', (req:Request, res:Response)=> {
  res.send('Welcome to NodeJs certification')
})

app.use('/users', (req:Request, res:Response)=> {
  res.send({users})
})

app.listen(3000, ()=> {
  console.log('server is runninh on port 3000')
})