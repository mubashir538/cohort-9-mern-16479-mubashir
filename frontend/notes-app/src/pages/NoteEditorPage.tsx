import {useState,useEffect} from   'react';
import {useParams, useNavigate} from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'
import {notesApi} from '../api/notes.api';

function NoteEditorPage(){
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const isEditMode = id !== undefined;

    const [title,setTitle] = useState('');
    const [content,setContent] = useState('');
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(()=> {
        if(!isEditMode || !id) return;

        notesApi.getbyId(id).then((response)=>{
            const note = response.data.data.note;
            setTitle(note.title);
            setContent(note.content);
        }).catch(()=>{
            setError('Failed to load note');
        }).finally(()=>{
            setIsLoading(false);
        })
    },[id,isEditMode]);


    async function handleSave(){
        if(!title.trim()){
            setError('Title is required');
            return;
        }
        setIsSaving(true);
        setError('');

        try{
            if(isEditMode && id){
                await notesApi.update(id,title,content);
            }else{
                await notesApi.create(title,content);
            }
            navigate('/dashboard');
        }catch(err:any){
            const msg =  err.response?.data?.error?.message || "Could not save Note";
            setError(msg);
        }finally{
            setIsSaving(false);
        }
    }

    function handleCancel(){
        navigate('/dashboard');
    }

    if(isLoading){
        return <p>Loading note...</p>
    }

    return(
        <div>
            <label htmlFor="note-title"></label>
            <input id="note-title" type="text" placeholder="Note title" value ={title} onChange={(e)=>setTitle(e.target.value)}/>
            {error && <p>{error}</p>}
            
                <label htmlFor="note-content"></label>
                <ReactQuill id="note-content" placeholder='Content' area-label="note content" theme="snow" value={content} onChange={setContent}/>
                <div>
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSave} disabled={isSaving}>{isSaving?'Saving...':'Save'}</button>
                </div>
            
        </div>
    );
}

export default NoteEditorPage