import {Note } from '../models';
import type {INote} from '../models/note.model';
import AppError from '../utils/Errors';
import logger from '../config/logger';
import { Types } from 'mongoose';
import { log } from 'node:console';

   const MAX_LENGTH = 100;
    const escapeRegex = (value:string):string =>{
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

async function createNote(userId: string, title: string, content?: string): Promise<INote> {
    try{

        const note = await Note.create({ userId, title, content: content ?? '' });
        logger.info({userId,noteId: note._id.toString()},'Note created successfully');
        return note;
    }catch(error){
        logger.error({error,userId},"Failed to Create Note");
        throw new AppError('Failed to create Note',500,'NOTE_CREATE_FAILED');

    }


}


async function getAllNotes(userId: string, searchQuery?: string): Promise<INote[]> {
    const filter : Record<string,unknown> = {userId};
    

    if(searchQuery){

        if(searchQuery.length > MAX_LENGTH){
            throw new AppError('Search query is too long', 400, "SEARCH_QUERY_TOO_LONG");
        }
        const escapedSearch = escapeRegex(searchQuery);
        filter.$or = [
            {title: {$regex: escapedSearch, $options: 'i'}},
            {content: {$regex: escapedSearch, $options: 'i'}},
        ];
    }

    const notes = await Note.find(filter).sort({updatedAt: -1});
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
}

async function updateNote(userId:string, noteId:string, update: NoteUpdate):Promise<INote> {


    const note = await getNotebyId(userId, noteId);

    if(update.title !== undefined ){
        note.title = update.title;
    }
    if(update.content !== undefined){
        note.content = update.content;
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