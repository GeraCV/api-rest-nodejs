import express, { json } from "express";
import cors from "cors";
import { readJSON } from './utilities/readJSON.js'
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { validateMovie, validatePartialMovie } from './schemas/validationMovie.js';
const moviesFile = './movies.json'
const movies = readJSON('./movies.json')

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

app.get('/movies', (req, res) => {
    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(movie => {
            return movie.genre.some(g => g.toLowerCase() == genre.toLowerCase())
        })

        filteredMovies.length
            ? res.json({ data: filteredMovies })
            : res.status(404).json({ message: 'El genero solicitado no existe.' })

    } else {
        res.json({ data: movies })
    }
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const findedMovie = movies.find(movie => movie.id == id)
    findedMovie
        ? res.json({ data: findedMovie })
        : res.status(404).json({ message: 'La película solicitada no existe.' })
})

app.patch('/movies/:id', async (req, res) => {
    const { id } = req.params
    const indexMovie = movies.findIndex(movie => movie.id == id)
    if (indexMovie == -1)
        return res.status(404).json({ message: 'La película solicitada no existe.' })

    const isValidPartialMovieData = validatePartialMovie(req.body)

    if (!isValidPartialMovieData.success) {
        const errors = isValidPartialMovieData.error.formErrors.fieldErrors
        return res.status(422).json(errors)
    }

    movies[indexMovie] = {
        ...movies[indexMovie],
        ...isValidPartialMovieData.data
    }

    try {
        await writeFile(moviesFile, JSON.stringify(movies, null, 2))
        res.status(200).json({ data: movies[indexMovie], message: "La película se modificó correctamente." })
    } catch {
        res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }
})

app.delete('/movies/:id', async (req, res) => {

    const { id } = req.params
    const indexMovie = movies.findIndex(el => el.id == id)
    if (indexMovie == -1)
        return res.status(404).json({ message: 'El id no coincide con algún elemento.' })

    const deletedMovie = movies.splice(indexMovie, 1)
    if (!deletedMovie.length)
        return res.status(500).json({ message: 'Hubo un error al intentar eliminar la información.' })

    try {
        await writeFile(moviesFile, JSON.stringify(movies, null, 2))
        res.status(200).json({ message: 'La información se eliminó de manera correcta.' })
    } catch (error) {
        res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }
})

app.post('/movies', async (req, res) => {
    const isValidMovie = validateMovie(req.body)
    if (!isValidMovie.success) {
        const errors = isValidMovie.error.formErrors.fieldErrors
        return res.status(422).json({data: errors, message: 'La información contiene errores.'})
    }

    const newMovie = {
        id: randomUUID(),
        ...isValidMovie.data
    }

    movies.push(newMovie)

    try {
        await writeFile(moviesFile, JSON.stringify(movies, null, 2))
        res.status(201).json({ data: newMovie, message: 'La película se agregó de manera correcta.' })
    } catch (error) {
        res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }
})

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})