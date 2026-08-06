import {Request,Response} from 'express';
import AppError from '../utils/Errors';
import asyncHandler from '../utils/asyncHandler';
import notesService from '../services/notes.service';


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
    const {title,content} = req.body;

    if(!title){
        throw new AppError('Title is Required', 400, "TITLE_REQUIRED");
    }

    const note = await notesService.createNote(req.userId!, title, content);
    res.status(201).json({success: true, data: {note}});
});

const getAllNotes = asyncHandler(async (req:Request, res:Response) => {
   const search= req.query.search as string || undefined;
   const notes = await notesService.getAllNotes(req.userId!, search);

   res.status(200).json({success: true, data: {notes}});

});

const getNoteById = asyncHandler(async (req:Request<NoteParams>, res:Response) => {
   const note = await notesService.getNotebyId(req.userId!, req.params.id);
   
   res.status(200).json({success: true, data: {note}});
});

const  updateNote = asyncHandler(async (req:Request<NoteParams,{},UpdateNoteBody>, res:Response) => {
const {title,content} = req.body;
const note = await notesService.updateNote(req.userId!, req.params.id, {title,content});

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