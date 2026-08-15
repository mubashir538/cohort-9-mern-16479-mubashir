import {useAuth} from '../context/AuthContext';
import {useState, useCallback,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {notesApi,type Note} from '../api/notes.api';
import NoteCard from '../components/NoteCard';

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
    <div>
    <h1>Dashboard</h1>
    <h2>Welcome {user?.name}</h2>
    <Link to={'/profile'}>View Profile</Link>
    <button onClick={()=> handleLogout()}>Logout</button>
    </div>
<div>
<input type="text" placeholder="Search Notes" value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}/>
<Link to={'/notes/new'}>Create New Note</Link>
</div>
{error && <p>{error}</p>}

{isLoading?(
    <p>Loading...</p>
):
((notes.length === 0)?(
    <p> {searchTerm? 'No Notes match your Search': 'No Notes Yet  Create a New Note'}</p>
):(<div>
    {notes.map((note)=>(<NoteCard key={note._id} note={note} onDelete={handleDelete}/>))}
</div>)
)}
<div>

</div>

    </>);
}


export default DashboardPage;