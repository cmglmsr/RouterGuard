import express, {json} from "express";
import {rtguard} from "../index.js";
import multer from "multer";

const rt = new rtguard({
    plevel: 3,
    allowedBodyTypes: ['*'],
    allowedMethods: [ 'PUT', 'GET', 'POST'],
    maxRequestSize: 8192,
    verbose: true,
    multer: (req) => {
        if (req.path.startsWith('/upload/images')) {
            return multer({ storage: multer.memoryStorage() }).single('image');
        } else if (req.path.startsWith('/upload/videos')) {
            return multer({ storage: multer.diskStorage({ destination: './uploads/videos' }) }).single('video');
        }
        return multer().any();
    }
})

const app = express()

app.listen(1234, 'localhost')
console.log('App is listening...')

app.use(rt.rtguard)

app.get('/', (req, res) => {
    return res.send('App root')
})

app.post('/', (req, res) => {
    return res.send('App post root')
})