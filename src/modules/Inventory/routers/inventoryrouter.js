import { Router } from 'express';
import { httpHandler } from '../../../helpers/error-handler.js';
import { inventoryService } from '../services/inventoryservices.js';
import multer from 'multer';

const inventoryStorage = multer.diskStorage({
    destination: 'public/images/inventory',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + file.originalname)
    }
});
const inventoryUpload = multer({
    storage: inventoryStorage,
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Please upload a Image'))
        }
        cb(undefined, true)
    }
})



const router = Router();

// var upload = multer({ storage : storage }).array('userPhoto',2);

// app.get('/',function(req,res){
//       res.sendFile(__dirname + "/index.html");
// });

// app.post('/api/photo',function(req,res){
//     upload(req,res,function(err) {
//         //console.log(req.body);
//         //console.log(req.files);
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.end("File is uploaded");
//     });
// });

router.get('/',
    httpHandler(async (req, res) => {
        // const {id} = req.params
        const result = await inventoryService.getAllInventory()
        res.send(result)
    })
)
//var upload = multer({ storage : storage }).array('userPhoto',2);
router.post('/add',inventoryUpload.array('img',6),
    httpHandler(async (req, res,next) => {
        const reqfile = req.files
        const data = req.body
        const result = await inventoryService.addNewInventory(data,reqfile);
        res.send(result);
    })
);


// router.get(
//     '/fetch-all',
//     (async (req, res) => {
//         const {id} = req.params
//         const result = await inventoryService.getAllInventory();
//         res.send(result);
//     })
// );

router.get(
    '/fetch-single/:id',
    (async (req, res) => {
        const { id } = req.params
       // const data = req.body;
        const result = await inventoryService.getSingleInventory(id);
        res.send(result)
    })
);

router.put(
    '/update',
    (async (req, res) => {
        const data = req.body;
        const result = await inventoryService.updateInventory(data);
        res.send(result)
    })
);

// // router.delete(
// //     '/delete',
// //     (async (req, res) => {
// //         const result = await inventoryService.deleteInventory(req.body);
// //         res.send(result)
// //     })
// // );



export default router;

