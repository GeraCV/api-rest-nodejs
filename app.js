const express = require("express");
const cors = require("cors");
const movies = require('./movies.json');
const crypto = require('node:crypto');
const fs = require('fs');
const { validateMovie, validatePartialMovie } = require('./schemas/validationMovie');
const moviesFile = './movies.json'

const app = express()
app.disable('x-powered-by')
app.use(express.json())

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

app.patch('/movies/:id', (req, res) => {
    const { id } = req.params
    const indexMovie = movies.findIndex(movie => movie.id == id)
    if (indexMovie == -1)
        return res.status(404).json({ message: 'La película solicitada no existe.' })

    const isValidPartialMovieData = validatePartialMovie(req.body)

    if (!isValidPartialMovieData.success) {
        const errors = isValidPartialMovieData.error.formErrors.fieldErrors
        res.status(422).json(errors)
    } else {
        const updateMovie = {
            ...movies[indexMovie],
            ...isValidPartialMovieData.data
        }

        fs.readFile(moviesFile, (error, data) => {
            if (error)
                return res.status(500).json({ message: 'Hubo un error al leer el archivo.' })

            const movies = JSON.parse(data)
            movies[indexMovie] = updateMovie
            fs.writeFile(moviesFile, JSON.stringify(movies, null, 2), (error) => {
                error
                    ? res.status(500).json({ message: 'Hubo un error al intentar guardar la información.' })
                    : res.status(200).json({ data: movies[indexMovie] })
            })
        })
    }
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const indexMovie = movies.findIndex(el => el.id == id)
    if (indexMovie == -1)
        return res.status(404).json({ message: 'El id no coincide con algún elemento.' })

    const deletedMovie = movies.splice(indexMovie, 1)

    if (!deletedMovie.length)
        return res.status(500).json({ message: 'Hubo un error al intentar eliminar la información.' })

    fs.readFile(moviesFile, (error, data) => {
        if (error)
            return res.status(500).json({ message: 'Hubo un error al leer el archivo.' })

        const movies = JSON.parse(data)
        movies.splice(indexMovie, 1)

        fs.writeFile(moviesFile, JSON.stringify(movies, null, 2), (error) => {
            error
                ? res.status(500).json({ message: 'Hubo un error al intentar eliminar la información.' })
                : res.status(200).json({ message: 'La información se eliminó de manera correcta.' })
        })
    })
})

app.post('/movies', (req, res) => {
    const isValidMovie = validateMovie(req.body)
    if (!isValidMovie.success) {
        const errors = isValidMovie.error.formErrors.fieldErrors
        res.status(422).json(errors)
    } else {
        const newMovie = {
            id: crypto.randomUUID(),
            ...isValidMovie.data
        }

        fs.readFile('./movies.json', (err, data) => {
            if (err)
                return res.status(500).json({ message: 'Hubo un error al intentar leer el archivo.' })

            let movies = JSON.parse(data)
            movies.push(newMovie)

            fs.writeFile('./movies.json', JSON.stringify(movies, null, 2), (error) => {
                error
                    ? res.status(500).json({ message: 'Hubo un error al intentar guardar la información.' })
                    : res.status(201).json({ data: newMovie })
            })
        });
    }
})

app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})