import {Note } from '../models';
import type {INote} from '../models/note.model';
import AppError from '../utils/Errors';
import logger from '../config/logger';


async function createNote(userId: string, title: string, content?: string): Promise<INote> {
    const note = await Note.create({ userId, title, content: content ?? '' });

    logger.info({userId,noteId: note._id.toString()},'Note created successfully');

    return note;
}


async function getAllNotes(userId: string, searchQuery?: string): Promise<INote[]> {
    const filter : Record<string,unknown> = {userId};

    if(searchQuery){
        filter.$or = [
            {title: {$regex: searchQuery, $options: 'i'}},
            {content: {$regex: searchQuery, $options: 'i'}},
        ];
    }

    const notes = await Note.find(filter).sort({updatedAt: -1});
    return notes;
}

async function getNotebyId(userId:string, noteId:string):Promise<INote> {
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

    await note.save();
    logger.info({userId,noteId},'Note updated successfully');
    return note;
}


async function deleteNote(userId:string,noteId:string): Promise<void> {
    const note = await getNotebyId(userId, noteId);

    await note.deleteOne();
    logger.info({userId,noteId},'Note deleted successfully');
}

export default {
    createNote,
    getAllNotes,
    getNotebyId,
    updateNote,
    deleteNote
}