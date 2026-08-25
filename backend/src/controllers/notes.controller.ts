import {Request,Response} from 'express';
import AppError from '../utils/Errors';
import asyncHandler from '../utils/asyncHandler';
import notesService from '../services/notes.service';
import { createNoteSchema, updateNoteSchema, notesQuerySchema } from '../validators/notes.validator';
import parseOrThrow from '../utils/parseOrThrow';

interface CreateNoteBody{
    title: string;
    content?: string;
}

interface UpdateNoteBody{
    title?: string;
    content?: string;
}

interface NoteParams{
    id : string;
}

const createNote = asyncHandler(async (req:Request<{},{},CreateNoteBody>, res:Response) => {
    const {title,content,isPinned,highlightColor} = parseOrThrow(createNoteSchema, req.body);

    if(typeof title !== 'string' || title.trim().length === 0){
        throw new AppError('Title is Required', 400, "TITLE_REQUIRED");
    }

    if (typeof content !== 'string' && typeof content !== 'undefined'){
        throw new AppError('Content is Must be String', 400, 'INVALID_CONTENT');
    }
    
    const note = await notesService.createNote(req.userId!, title, content, {isPinned,highlightColor});
    res.status(201).json({success: true, data: {note}});
});

const getAllNotes = asyncHandler(async (req:Request, res:Response) => {
    const {search,sort} = parseOrThrow(notesQuerySchema, req.query);
   if (search !== undefined && typeof search !== 'string') {
       throw new AppError('Search must be a string', 400, 'INVALID_SEARCH');
   }
   const notes = await notesService.getAllNotes(req.userId!, {searchTerm: search, sort});

   res.status(200).json({success: true, data: {notes}});

});

const getNoteById = asyncHandler(async (req:Request<NoteParams>, res:Response) => {
   const note = await notesService.getNotebyId(req.userId!, req.params.id);
   
   res.status(200).json({success: true, data: {note}});
});

const  updateNote = asyncHandler(async (req:Request<NoteParams,{},UpdateNoteBody>, res:Response) => {

    const updates = parseOrThrow(updateNoteSchema, req.body);

     if((typeof updates.title !== 'string' || updates.title.trim().length === 0) && updates.title !== undefined){
        throw new AppError('Title is Required', 400, "TITLE_REQUIRED");
    }

    if (typeof updates.content !== 'string' && typeof updates.content !== 'undefined'){
        throw new AppError('Content is Must be String', 400, 'INVALID_CONTENT');
    }
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