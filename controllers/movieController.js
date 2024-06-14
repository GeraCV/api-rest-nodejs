import { movieModel } from '../models/movieModel.js';
import { validateMovie, validatePartialMovie } from '../schemas/validationMovie.js';

export class movieController {
    static async getAllMovies(req, res) {

        const { genre } = req.query

        const movies = await movieModel.getAllMovies({ genre })
        movies.length
            ? res.json({ data: movies })
            : res.status(404).json({ message: 'No se encontró información.' })
    }

    static async getMovieById(req, res) {
        const { id } = req.params
        const findedMovie = await movieModel.getMovieById({ id })

        findedMovie
            ? res.json({ data: findedMovie })
            : res.status(404).json({ message: 'La película solicitada no existe.' })
    }

    static async updateMovie(req, res) {
        const { id } = req.params
        const indexMovie = await movieModel.getMovieIndex({ id })
        if (indexMovie == -1)
            return res.status(404).json({ message: 'La película solicitada no existe.' })

        const isValidPartialMovieData = validatePartialMovie(req.body)

        if (!isValidPartialMovieData.success) {
            const errors = isValidPartialMovieData.error.formErrors.fieldErrors
            return res.status(422).json({ errors: errors })
        }

        const data = isValidPartialMovieData.data
        const resultUpdateMovie = await movieModel.updateMovie({ indexMovie, data })

        resultUpdateMovie
            ? res.status(200).json({ data: resultUpdateMovie, message: "La película se modificó correctamente." })
            : res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }

    static async createMovie(req, res) {
        const isValidMovie = validateMovie(req.body)
        if (!isValidMovie.success) {
            const errors = isValidMovie.error.formErrors.fieldErrors
            return res.status(422).json({ errors: errors, message: 'La información contiene errores.' })
        }
        const data = isValidMovie.data
        const resultCreateMovie = await movieModel.createMovie({ data })

        resultCreateMovie
            ? res.status(201).json({ data: resultCreateMovie, message: 'La película se agregó de manera correcta.' })
            : res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }
    static async deleteMovie(req, res) {
        const { id } = req.params
        const indexMovie = movieModel.getMovieIndex({ id })
        if (indexMovie == -1)
            return res.status(404).json({ message: 'El id no coincide con algún elemento.' })


        const resultDeleteMovie = await movieModel.deleteMovie({ indexMovie })
        resultDeleteMovie
            ? res.status(200).json({ message: 'La información se eliminó de manera correcta.' })
            : res.status(500).json({ message: 'Hubo un error al procesar la información.' })
    }
}