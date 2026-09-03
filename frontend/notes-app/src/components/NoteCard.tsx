import {Link} from 'react-router-dom';
import type {MouseEvent} from 'react';
import type {Note} from '../api/notes.api';
import {Trash2,Pin} from 'lucide-react';
import {getContrastTextColor} from '../utils/colorUtils';
import './NoteCard.css'

interface NoteCardProps {
    note: Note;
    onDelete: (id:string)=>void;
    onTogglePin: (id:string, isPinned:boolean)=>void;
    isPinning: boolean;
}

function stripHtml(html:string):string{
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent||temp.innerText||"";    
}

function NoteCard({note,onDelete,onTogglePin,isPinning}: Readonly<NoteCardProps>){
    const preview = stripHtml(note.content).substring(0,140);
    const textColor = note.highlightColor ? getContrastTextColor(note.highlightColor) : undefined;



    function handleDeleteClick(e:MouseEvent<HTMLButtonElement>){
        e.stopPropagation();
        onDelete(note._id);
    }

    function handlePinClick(){
        onTogglePin(note._id, !note.isPinned);
    }

    return (
        <div className={note.isPinned ? "NoteCard NoteCardPinned" : "NoteCard"} style={{backgroundColor: note.highlightColor ?? undefined, color: textColor}}>
            
        <Link to={`/notes/${note._id}/edit`} className="NoteCardLink">
            <h3 className="NoteCardTitle" style={{color: textColor}}>{note.title || 'Untitled Note'}</h3>
            <p className="NoteCardPreview" style={{color: textColor}}>{preview || "No Content yet ..."}</p>
        </Link>

            <div className="NoteCardFooter" style={{borderTopColor: textColor}}>
                <span className="NoteCardDate" style={{color: textColor}}>{new Date(note.updatedAt).toLocaleDateString()}</span>
                <div className="NoteCardActions" style={{color: textColor}}>
                <button onClick={handlePinClick} disabled={isPinning} className={note.isPinned ? "NoteCardPinButton NoteCardPinButtonActive" : "NoteCardPinButton"}  aria-label={note.isPinned ? "Unpin note" : "Pin note"}>
                <Pin size={15} fill={note.isPinned ? "currentColor" : textColor} stroke={note.isPinned ? "none" : textColor}/>
                </button>
                <button onClick={handleDeleteClick} className="NoteCardDeleteButton" aria-label="Delete note">
                <Trash2 size={15}/>
                </button>
                </div>

            </div>
            </div>
    );
}

export default NoteCard;