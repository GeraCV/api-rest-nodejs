import z from 'zod';

const movieSchema = z.object({
    title: z.string({ message: 'Must be a string' }),
    year: z.number({ message: 'Must be a number more than or equal to 2000' }).int().min(1950).max(2024),
    director: z.string({ message: 'Must be a string' }),
    duration: z.number().min(0).max(200),
    poster: z.string().url({ message: 'Must be a URL' }),
    genre: z.enum(['Action', 'Adventure', 'Fantasy', 'Drama', 'Romance', 'Animation', 'Sci-Fi']).array(),
    rate: z.number().min(0).max(10).default(8)
})

export const validateMovie = (movie) => {
    return movieSchema.safeParse(movie)
}

export const validatePartialMovie = (partialDataMovie) => {
    return movieSchema.partial().safeParse(partialDataMovie)
}