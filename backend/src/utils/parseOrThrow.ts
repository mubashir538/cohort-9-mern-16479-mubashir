import {ZodSchema} from 'zod';
import AppError from './Errors';

function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        const message = result.error.issues.map(({ message }) => message).join(', ');
        throw new AppError(message, 400, 'VALIDATION_ERROR');
    }

    return result.data;
}

export default parseOrThrow;