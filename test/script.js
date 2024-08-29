import express, {json} from "express";
import {rtguard} from "../index.js";
import multer from "multer";

const rt = new rtguard({
    plevel: 3,
    allowedBodyTypes: ['*'],
    allowedMethods: [ 'PUT', 'GET', 'POST'],
    maxRequestSize: 8192,
    verbose: true,
    multer: multer().none()
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