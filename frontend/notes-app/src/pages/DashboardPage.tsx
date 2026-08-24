import {useAuth} from '../context/AuthContext';
import {useState, useCallback,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {notesApi,type Note} from '../api/notes.api';
import NoteCard from '../components/NoteCard';
import './DashboardPage.css'

function DashboardPage(){
    const {user, logout} = useAuth();

    const [notes,setNotes] = useState<Note[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState('');


    const fetchNotes=   useCallback(async (search: string,signal:AbortSignal)=> {
        setIsLoading(true);
        setError('');
        try{
            const response = await notesApi.getAll(search);
            setNotes(response.data.data.notes);
        }
        catch(err){
            if(signal.aborted){
                return;
            }
            setError('Can not Load Notes');
        }finally{
            if(!signal.aborted){
                setIsLoading(false);
            }
        }
    },[]);

    useEffect(()=>{
        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            fetchNotes(searchTerm,controller.signal);
        },400);
        return () => {
            clearTimeout(timeoutId);
            controller.abort();

        }
    },[searchTerm,fetchNotes]);


    async function handleDelete(noteId: string){
        const confirmed = window.confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try{
            await notesApi.delete(noteId);
            setNotes((prev)=> prev.filter((n)=> n._id !== noteId));
            await fetchNotes(searchTerm,new AbortController().signal);
        }catch(err){
            setError('Failed to delete note');
        }
    }

     async function handleLogout() {
        try {
            await logout();
        } catch {
            console.error('Failed to log out');
        }
    }

    return (<>
    <div className="DashboardPage">

    <div className="DashboardHeader">
        <div>
    <h1 className="DashboardHeaderTitle">Dashboard</h1>
        </div>

        <div className="DashboardHeaderActions">
    <Link to={'/profile'} className="DashboardProfileLink">View Profile</Link>
    <button onClick={()=> handleLogout()} className="DashboardLogoutButton">Logout</button>
        </div>
    </div>

    <div className="DashboardWelcomeCard">

        <div className="DashboardWelcomeDotGrid">
            <span className="DashboardDot"></span><span className="DashboardDot"></span><span className="DashboardDot"></span>
            <span className="DashboardDot"></span><span className="DashboardDot"></span><span className="DashboardDot"></span>
        </div>

        <span className="DashboardWelcomeEyebrow">Welcome back</span>
        <h2 className="DashboardWelcomeName">{user?.name}</h2>
        <p className="DashboardWelcomeSub">
        {notes.length === 0 ? "You don't have any notes yet, create your first one below" : `You have ${notes.length} note${notes.length===1?'':'s'} saved in your account`}
        </p>

    </div>

<div className="DashboardToolbar">
    <label htmlFor="search-notes">Search Notes</label>
<input id="search-notes" type="text" placeholder="Search Notes" className="DashboardSearchInput" value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}/>
<Link to={'/notes/new'} className="DashboardCreateLink">Create New Note</Link>
</div>

{error && <p className="DashboardError">{error}</p>}

{isLoading?(
    <p className="DashboardLoadingText">Loading...</p>
):
((notes.length === 0)?(
    <p className="DashboardEmptyText"> {searchTerm? 'No Notes match your Search': 'No Notes Yet  Create a New Note'}</p>
):(<div className="DashboardNotesGrid">
    {notes.map((note)=>(<NoteCard key={note._id} note={note} onDelete={handleDelete}/>))}
</div>)
)}

    </div>
    </>);
}


export default DashboardPage;