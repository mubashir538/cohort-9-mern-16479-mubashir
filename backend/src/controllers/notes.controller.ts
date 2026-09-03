import {Request,Response} from 'express';
import asyncHandler from '../utils/asyncHandler';
import notesService from '../services/notes.service';
import { createNoteSchema, updateNoteSchema, notesQuerySchema } from '../validators/notes.validator';
import type { CreateNoteInput, UpdateNoteInput } from '../validators/notes.validator';
import parseOrThrow from '../utils/parseOrThrow';

interface NoteParams{
    id : string;
}

const createNote = asyncHandler(async (req:Request<{},{},CreateNoteInput>, res:Response) => {
    const {title,content,isPinned,highlightColor} = parseOrThrow(createNoteSchema, req.body);
    
    const note = await notesService.createNote(req.userId!, title, content, {isPinned,highlightColor});
    res.status(201).json({success: true, data: {note}});
});

const getAllNotes = asyncHandler(async (req:Request, res:Response) => {
    const {search,sort} = parseOrThrow(notesQuerySchema, req.query);

   const notes = await notesService.getAllNotes(req.userId!, {searchTerm: search, sort});

   res.status(200).json({success: true, data: {notes}});

});

const getNoteById = asyncHandler(async (req:Request<NoteParams>, res:Response) => {
   const note = await notesService.getNotebyId(req.userId!, req.params.id);
   
   res.status(200).json({success: true, data: {note}});
});

const updateNote = asyncHandler(async (req:Request<NoteParams,{},UpdateNoteInput>, res:Response) => {
    const updates = parseOrThrow(updateNoteSchema, req.body);

    const note = await notesService.updateNote(req.userId!, req.params.id, updates);

res.status(200).json({success: true, data: {note}});

});

const deleteNote = asyncHandler(async (req:Request<NoteParams>, res:Response) => {
    await notesService.deleteNote(req.userId!, req.params.id);

    res.status(200).json({success: true, data: {message: 'Note deleted successfully'}});
})

export default{
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
}