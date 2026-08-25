import {useState,useEffect,useRef} from   'react';
import {useParams, useNavigate} from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'
import {notesApi} from '../api/notes.api';
import './NoteEditorPage.css';
import {Pin} from 'lucide-react';
import {PRESET_HIGHLIGHT_COLORS} from '../utils/colorUtils';
import NoteNotFound from '../components/NoteNotFound';
import axios from 'axios';

function NoteEditorPage(){
    const {id} = useParams<{id:string}>();
    const navigate = useNavigate();
    const isEditMode = id !== undefined;

    const [title,setTitle] = useState('');
    const [content,setContent] = useState('');
    const [isPinned,setIsPinned] = useState(false);
    const [highlightColor,setHighlightColor] = useState<string|null>(null);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [notFound,setNotFound] = useState(false);

    const quillRef = useRef<ReactQuill>(null);

    useEffect(()=> {
        if(!isEditMode || !id) return;

        notesApi.getbyId(id).then((response)=>{
            const note = response.data.data.note;
            setTitle(note.title);
            setContent(note.content);
            setIsPinned(note.isPinned);
            setHighlightColor(note.highlightColor);
        }).catch((err)=>{
            if(axios.isAxiosError(err) && err.response?.status === 404){
                setNotFound(true);
            }else{
                setError('Failed to load note');
            }
        }).finally(()=>{
            setIsLoading(false);
        })
    },[id,isEditMode]);

    useEffect(()=>{
        const editor = quillRef.current?.getEditor()
        if (editor) {
                editor.root.setAttribute('aria-label', 'Note content')
            }
    },[])

    function handleTogglePin(){
        setIsPinned((prev)=> !prev);
    }
    async function handleSave(){
        if(!title.trim()){
            setError('Title is required');
            return;
        }
        setIsSaving(true);
        setError('');

        try{
            if(isEditMode && id){
                await notesApi.update(id,{title,content,isPinned,highlightColor});
            }else{
                await notesApi.create(title,content,{isPinned,highlightColor});
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

    if(notFound){
        return <NoteNotFound/>
    }

    if(isLoading){
        return <p>Loading note...</p>
    }

    return(
        <div className="NoteEditorPage">
            <div className="NoteEditorTopRow">
            <label htmlFor="note-title" className="NoteEditorVisuallyHidden">Title</label>
            <input id="note-title" type="text"  className="NoteEditorTitleInput" placeholder="Note title" value ={title} onChange={(e)=>setTitle(e.target.value)}/>


            <button type="button" onClick={handleTogglePin} className={isPinned ? "NoteEditorPinButton NoteEditorPinButtonActive" : "NoteEditorPinButton"} aria-label={isPinned ? "Unpin note" : "Pin note"}>
            <Pin size={16} fill={isPinned ? "currentColor" : "none"}/>
                {isPinned ? 'Pinned' : 'Pin'}
            </button>   
            </div>
            <div className="NoteEditorHighlightRow">
                 <span className="NoteEditorHighlightLabel">Highlight</span>

                <button type="button" onClick={()=> setHighlightColor(null)} className={highlightColor === null ? "NoteEditorColorSwatch NoteEditorColorSwatchNone NoteEditorColorSwatchActive" : "NoteEditorColorSwatch NoteEditorColorSwatchNone"} aria-label="No highlight" />
                {PRESET_HIGHLIGHT_COLORS.map((colorOption)=> (

                    <button key={colorOption.hex} type="button" onClick={()=> setHighlightColor(colorOption.hex)} className={highlightColor === colorOption.hex ? "NoteEditorColorSwatch NoteEditorColorSwatchActive" : "NoteEditorColorSwatch"} style={{backgroundColor: colorOption.hex}} aria-label={colorOption.name}/>

                ))}

                <input
                    type="color"
                    value={highlightColor ?? '#ffffff'}
                    onChange={(e)=> setHighlightColor(e.target.value)}
                    className="NoteEditorColorCustomInput"
                    aria-label="Custom highlight color"
                />

            </div>
            {error && <p className="NoteEditorError">{error}</p>}

                <label htmlFor="note-content" className="NoteEditorVisuallyHidden">Content</label>

                <div className="NoteEditorContentWrapper">
                <ReactQuill id="note-content" placeholder='Content' area-label="note content" theme="snow" value={content} onChange={setContent}/>
                </div>

                <div className="NoteEditorActions">
                    <button onClick={handleCancel} className="NoteEditorCancelButton">Cancel</button>
                    <button onClick={handleSave} className="NoteEditorSaveButton" disabled={isSaving}>{isSaving?'Saving...':'Save'}</button>
                </div>

        </div>
    );
}

export default NoteEditorPage