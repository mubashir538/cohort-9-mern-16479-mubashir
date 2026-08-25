import {Note } from '../models';
import type {INote} from '../models/note.model';
import type {SortOption} from '../validators/notes.validator';
import AppError from '../utils/Errors';
import logger from '../config/logger';
import { Types } from 'mongoose';


function tokenizedSearch(term:string):string[] {
    const Words = term.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
    const tokens: string[] = [];

    for (const word of Words) {
        const spaced = word
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
            .replace(/([a-zA-Z])([0-9])/g, '$1 $2')
            .replace(/([0-9])([a-zA-Z])/g, '$1 $2');

        tokens.push(...spaced.split(' '));
    }
    return Array.from(new Set(tokens.filter((t) => t.length > 0)));
}


function buildSortPage(sort? : SortOption): Record<string, 1 |-1>{
    const [field, direction] = (sort ?? 'updatedAt_desc').split('_');
  return {
    isPinned: -1,
    [field]: direction === 'asc' ? 1 : -1,
  };
}

interface CreateNoteOptions {
    isPinned?: boolean;
    highlightColor?: string | null;
  }



async function createNote(userId: string, title: string, content?: string, options: CreateNoteOptions = {}): Promise<INote> {
    try{

        const note = await Note.create({ userId, title, content: content ?? '', isPinned: options.isPinned ?? false, highlightColor: options.highlightColor ?? null });

        logger.info({userId,noteId: note._id.toString()},'Note created successfully');
        return note;
    }catch(error){
        logger.error({error,userId},"Failed to Create Note");
        throw new AppError('Failed to create Note',500,'NOTE_CREATE_FAILED');

    }
}

interface GetAllNotesOptions {
    searchTerm?: string;
    sort?: SortOption;
  }


async function getAllNotes(userId: string, options: GetAllNotesOptions = {}): Promise<INote[]> {
    const {searchTerm, sort} = options;
    let filter : Record<string,unknown> = {userId};
    

    if(searchTerm){
        const tokens = tokenizedSearch(searchTerm);

        if (tokens.length > 0){
            filter = {
                ...filter,
                $or: tokens.flatMap((token) => [
                    {title: {$regex: token, $options: 'i'}},
                    {content: {$regex: token, $options: 'i'}},
                ]),
            }
        }
    }

    const sortPage = buildSortPage(sort)
    const notes = Note.find(filter).sort(sortPage);
    return notes;
}

async function getNotebyId(userId:string, noteId:string):Promise<INote> {

    if (!Types.ObjectId.isValid(noteId)) {
        throw new AppError('Invalid note id', 400, "INVALID_NOTE_ID");
    }

    const note = await Note.findOne({_id: noteId, userId: userId})

    if (!note) {
        throw new AppError('Note not found', 404, "NOTE_NOT_FOUND");
    }
    return note;
}


interface NoteUpdate{
    title?: string;
    content?: string;
    isPinned?: boolean;
    highlightColor?: string | null;
}

async function updateNote(userId:string, noteId:string, update: NoteUpdate):Promise<INote> {


    const note = await getNotebyId(userId, noteId);

    if(update.title !== undefined ){
        note.title = update.title;
    }
    if(update.content !== undefined){
        note.content = update.content;
    }
    if(update.isPinned !== undefined){
        note.isPinned = update.isPinned;
    }
    if(update.highlightColor !== undefined){
        note.highlightColor = update.highlightColor;
    }

    try{
    await note.save();
    logger.info({userId,noteId},'Note updated successfully');
    return note;
}catch(error){
    logger.error({error,userId,noteId},"Failed to Update Note");
    throw new AppError('Failed to update Note',500,'NOTE_UPDATE_FAILED');

}
}


async function deleteNote(userId:string,noteId:string): Promise<void> {

    
    const note = await getNotebyId(userId, noteId);

    try{
        await note.deleteOne();
        logger.info({userId,noteId},'Note deleted successfully');
     }catch(error){
        logger.error({error,userId,noteId},"Failed to Delete Note");
        throw new AppError('Failed to Delete Note',500,'NOTE_DELETE_FAILED');

    }
}

export default {
    createNote,
    getAllNotes,
    getNotebyId,
    updateNote,
    deleteNote
}