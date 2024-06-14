import { Router } from "express";
import { movieController } from "../controllers/movieController.js";

export const moviesRouter = Router()

moviesRouter.get('/', movieController.getAllMovies)

moviesRouter.post('/', movieController.createMovie)

moviesRouter.get('/:id', movieController.getMovieById)

moviesRouter.patch('/:id', movieController.updateMovie)

moviesRouter.delete('/:id', movieController.deleteMovie)