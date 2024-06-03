import { Router } from "express";
import { readJSON } from '../utilities/readJSON.js';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { validateMovie, validatePartialMovie } from '../schemas/validationMovie.js';
const moviesFile = '../movies.json';
const movies = readJSON('./movies.json');

export const moviesRouter = Router()

moviesRouter.get('/', (req, res) => {
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

moviesRouter.get('/:id', (req, res) => {
    const { id } = req.params
    const findedMovie = movies.find(movie => movie.id == id)
    findedMovie
        ? res.json({ data: findedMovie })
        : res.status(404).json({ message: 'La película solicitada no existe.' })
})

moviesRouter.patch('/:id', async (req, res) => {
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

moviesRouter.post('/', async (req, res) => {
    const isValidMovie = validateMovie(req.body)
    if (!isValidMovie.success) {
        const errors = isValidMovie.error.formErrors.fieldErrors
        return res.status(422).json({ data: errors, message: 'La información contiene errores.' })
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

moviesRouter.delete('/:id', async (req, res) => {
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