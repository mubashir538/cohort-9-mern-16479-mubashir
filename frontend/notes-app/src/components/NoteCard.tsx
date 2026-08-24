import {useNavigate,Link} from 'react-router-dom';
import type {MouseEvent} from 'react';
import type {Note} from '../api/notes.api';
import {Trash2} from 'lucide-react';
import './NoteCard.css'

interface NoteCardProps {
    note: Note;
    onDelete: (id:string)=>void;
}

function stripHtml(html:string):string{
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent||temp.innerText||"";    
}

function NoteCard({note,onDelete}: NoteCardProps){
    const navigate = useNavigate();
    const preview = stripHtml(note.content).substring(0,140);

    function handleCardClick(){
        navigate(`/notes/${note._id}/edit`);
    }

    function handleDeleteClick(e:MouseEvent<HTMLButtonElement>){
        e.stopPropagation();
        onDelete(note._id);
    }

    return (
        <Link to={`/notes/${note._id}/edit`} className="NoteCardLink">
        <div className="NoteCard" onClick={handleCardClick}>
            <h3 className="NoteCardTitle">{note.title || 'Untitled Note'}</h3>
            <p className="NoteCardPreview">{preview || "No Content yet ..."}</p>

            <div className="NoteCardFooter">
                <span className="NoteCardDate">{new Date(note.updatedAt).toLocaleDateString()}</span>
                <div className="NoteCardActions">
                <button onClick={handleDeleteClick} className="NoteCardDeleteButton" aria-label="Delete note">
                <Trash2 size={15}/>
                </button>
                </div>

            </div>
            </div>
        </Link>
    );
}

export default NoteCard;