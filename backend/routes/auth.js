import express from "express";
const router  = express.Router()

router.get('/', (req, res)=>{
    const obj = {
        name : 'hi',
        email : 'hello@gmail.com'
    }

    res.json(obj)
})

export default router;