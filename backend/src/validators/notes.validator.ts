import {z} from 'zod';

const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Invalid hex color code');

export const createNoteSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    content: z.string().trim().optional(),
    isPinned: z.boolean().optional(),
    highlightColor: hexColorSchema.nullable().optional(),
});

export const updateNoteSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').optional(),
    content: z.string().trim().optional(),
    isPinned: z.boolean().optional(),
    highlightColor: hexColorSchema.nullable().optional(),
}).refine((data)=>data.title!==undefined || data.content !== undefined || data.isPinned !== undefined || data.highlightColor !== undefined,
{message: 'At least one field must be provided to update the note'});


export const sortOptionSchema = z.enum([
    'updatedAt_desc',
    'updatedAt_asc',
    'title_asc',
    'title_desc',
    'createdAt_desc',
    'createdAt_asc'
]);

export const notesQuerySchema = z.object({
    search : z.string().trim().optional(),
    sort : sortOptionSchema.optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NotesQueryInput = z.infer<typeof notesQuerySchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;