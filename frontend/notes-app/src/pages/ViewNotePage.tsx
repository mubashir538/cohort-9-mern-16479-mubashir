import {useState,useEffect} from 'react';
import {useParams,useNavigate,Link} from 'react-router-dom';
import {notesApi} from '../api/notes.api';
import type {Note} from '../api/notes.api';
import {ArrowLeft,Pencil,Trash2} from 'lucide-react';
import './ViewNotePage.css'

function ViewNotePage(){
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();

    const [note,setNote] = useState<Note | null>(null);
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState('');

    useEffect(()=>{
        if(!id) return;

        setIsLoading(true);
        notesApi.getbyId(id).then((response)=>{
            setNote(response.data.data.note);
        }).catch(()=>{
            setError('Failed to load note');
        }).finally(()=>{
            setIsLoading(false);
        })
    },[id]);


    async function handleDelete(){
        if(!id) return;
        const confirmed = window.confirm('Are you sure you want to delete this note?');
        if(!confirmed) return;

        try{
            await notesApi.delete(id);
            navigate('/dashboard');
        }
        catch(err){
            setError('Failed to delete note');
        }
    }

    if(isLoading){
        return <p className="ViewNoteLoadingText">Loading note...</p>
    }

    if(error || !note){
        return (
            <div className="ViewNotePage">

                <p className="ViewNoteError">{error || 'Note not found'}</p>
                <Link to="/dashboard" className="ViewNoteBackLink">
                <ArrowLeft size={16}/>
                Back to Dashboard
                </Link>

            </div>
        );
    }

    return (
        <div className="ViewNotePage">

        <div className="ViewNoteTopBar">

            <Link to="/dashboard" className="ViewNoteBackLink">
            <ArrowLeft size={16}/>
            Back
            </Link>

            <div className="ViewNoteActions">
                <Link to={`/notes/${note._id}/edit`} className="ViewNoteEditButton">
                <Pencil size={16}/>
                Edit
                </Link>

                <button onClick={handleDelete} className="ViewNoteDeleteButton">
                <Trash2 size={16}/>
                Delete
                </button>
            </div>

        </div>

            <h1 className="ViewNoteTitle">{note.title || 'Untitled Note'}</h1>
            <span className="ViewNoteMeta">Last edited on {new Date(note.updatedAt).toLocaleDateString()}</span>

            <div className="ViewNoteContent" dangerouslySetInnerHTML={{__html: note.content || '<p>No content yet</p>'}}>
            </div>

        </div>
    );
}

export default ViewNotePage;