import type {Request, Response, NextFunction} from 'express'

const auth = (req: Request, res:Response, next:NextFunction) => {

  const token = 'authenticated'

  if(token === 'authenticated') {
    next()
  } else {
    res.send('Unautorized')
  }
}


module.exports = {auth}