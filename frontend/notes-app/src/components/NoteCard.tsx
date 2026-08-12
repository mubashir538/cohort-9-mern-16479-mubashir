import {Link} from 'react-router-dom';
import type {Note} from '../api/notes.api';

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
    const preview = stripHtml(note.content).substring(0,120);

    return (
        <div>
            <Link to={`/notes/${note._id}`}>
                <h3>{note.title}</h3>
            </Link>
            <p>{preview || "No Content yet ..."}</p>
            <span>{new Date(note.updatedAt).toLocaleDateString()} </span>
            <button onClick={()=>onDelete(note._id)}>Delete</button>
        </div>
    );
}

export default NoteCard;