import { readJSON } from '../utilities/readJSON.js';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const movies = readJSON('./movies.json');
import { getFullPath } from '../utilities/getFullPath.js';
const moviesFileFullPath = getFullPath('../movies.json');



export class movieModel {

    static async getAllMovies({ genre = false }) {

        return genre
            ? movies.filter(movie => {
                return movie.genre.some(g => g.toLowerCase() == genre.toLowerCase())
            })
            : movies
    }

    static async getMovieIndex({ id }) {
        return movies.findIndex(movie => movie.id == id)
    }

    static async getMovieById({ id }) {
        return movies.find(movie => movie.id == id)
    }

    static async updateMovie({ indexMovie, data }) {
        movies[indexMovie] = {
            ...movies[indexMovie],
            ...data
        }

        try {
            await writeFile(moviesFileFullPath, JSON.stringify(movies, null, 2))
            return movies[indexMovie]
        } catch (error) {
            return false
        }
    }

    static async createMovie({ data }) {
        const newMovie = {
            id: randomUUID(),
            ...data
        }

        movies.push(newMovie)

        try {
            await writeFile(moviesFileFullPath, JSON.stringify(movies, null, 2))
            return newMovie
        } catch {
            return false
        }
    }

    static async deleteMovie({ indexMovie }) {
        const deletedMovie = movies.splice(indexMovie, 1)
        if (!deletedMovie.length)
            return false

        try {
            await writeFile(moviesFileFullPath, JSON.stringify(movies, null, 2))
            return true
        } catch (error) {
            return false
        }
    }
}