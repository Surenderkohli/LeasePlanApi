import { Router } from "express";
import md5 from "md5";
import multer from "multer";
import { httpHandler } from "../../../helpers/error-handler.js";
import { userServices } from "../services/userservices.js";



const userProfileStorage = multer.diskStorage({
    destination: 'public/images/profile',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + file.originalname)
    }
});
const profileUpload = multer({
    storage: userProfileStorage,
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Plz upload profile picture'))
        }
        cb(undefined, true)
    }
})



const router = Router()

router.get("/get-user", (async (req, res) => {
    const result = await userServices.getAllUser()
    res.send(result)
    }))

router.get("/get-single-user/:id",(async(req,res)=>{
    const { id } = req.params
    const result = await userServices.getSingleUser(id)
    res.send(result)
}))

router.post("/register", profileUpload.single('profile'),
    httpHandler(async (req, res) => {
        const reqfile = req.file.filename
        const password = md5(req.body.password)
        const name = req.body.name
        const email = req.body.email
        const phonenumber = req.body.phonenumber
        const address = req.body.address
        const data = { password, name, email, phonenumber, address }
        const result = await userServices.addNewUser(data, reqfile)
        res.send(result)
       
    }))


export default router;