import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const requireSelf = createRequire(import.meta.url) //create require instance

export const readJSON = (pathFile) => {
    const fullPath = resolve(process.cwd(), pathFile) //get full path file;
    return requireSelf(fullPath) //load file in memory
}