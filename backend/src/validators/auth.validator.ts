import { z } from 'zod';

export const signupSchema = z.object({
    name: z.string().trim().min(2,'Name must be at least 2 characters').max(100),
    email: z.pipe(z.string().trim().toLowerCase(), z.email({ error: 'Enter a valid email' })),
    password: z.string().min(8,'Password must be at least 8 characters').max(128)
        .regex(/[a-zA-Z]/,'Password needs at least one letter')
        .regex(/\d/,'Password needs at least one number'),
});

export const loginSchema = z.object({
    email: z.pipe(z.string().trim().toLowerCase(), z.email({ error: 'Enter a valid email' })),
    password: z.string().min(1,'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;