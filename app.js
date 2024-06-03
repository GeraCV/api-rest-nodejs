import express, { json } from "express";
import cors from "cors";
import { moviesRouter } from './routes/movies.js'

const app = express()
app.disable('x-powered-by')
app.use(json())

const port = process.env.PORT ?? 3000

const corsOptions = {
    origin: ['http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

//normal methods: GET/HEAD/POST
//complex methods: PUT/PATCH/DELETE -> CORS PRE-Flight
//In the complex method exists special petition: OPTIONS

app.use('/movies', moviesRouter)


app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})