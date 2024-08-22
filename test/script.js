import express, {json} from "express";
import {rtguard} from "../index.js";

const rt = new rtguard({
    plevel: 10,
    maxRequestSize: 30000,
    verbose: true
})

const app = express()

app.listen(1234, 'localhost')
console.log('App is listening...')

app.use(json())
app.use(rt.rtguard)

app.get('/', (req, res) => {
    return res.send('App root')
})

app.post('/', (req, res) => {
    return res.send('App post root')
})