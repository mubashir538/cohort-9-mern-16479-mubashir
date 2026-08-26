import {useAuth} from '../context/AuthContext';
import {useState, useCallback,useEffect,useRef} from 'react';
import {Link} from 'react-router-dom';
import {notesApi,type Note,type SortOption} from '../api/notes.api';
import NoteCard from '../components/NoteCard';
import './DashboardPage.css'

function DashboardPage(){
    const {user, logout} = useAuth();

    const [notes,setNotes] = useState<Note[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption,setSortOption] = useState<SortOption>('updatedAt_desc');
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState('');
    const [pendingPinIds,setPendingPinIds] = useState<Set<string>>(new Set());
    const pinRequestIdRef = useRef<Record<string,number>>({});
    const listRequestIdRef = useRef(0);


    const fetchNotes=   useCallback(async (search: string,sort:SortOption,signal:AbortSignal)=> {
        const requestId = ++listRequestIdRef.current;
        setIsLoading(true);
        setError('');
        try{
            const response = await notesApi.getAll({search,sort},signal);
            if(requestId !== listRequestIdRef.current){
                return;
            }
            setNotes(response.data.data.notes);
        }
        catch(err){
            if(signal.aborted){
                return;
            }
            if(requestId !== listRequestIdRef.current){
                return;
            }
            setError('Can not Load Notes');
        }finally{
            if(!signal.aborted && requestId === listRequestIdRef.current){
                setIsLoading(false);
            }
        }
    },[]);

    useEffect(()=>{
        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            fetchNotes(searchTerm,sortOption,controller.signal);
        },400);
        return () => {
            clearTimeout(timeoutId);
            controller.abort();

        }
    },[searchTerm,sortOption,fetchNotes]);


    async function handleDelete(noteId: string){
        const confirmed = window.confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try{
            await notesApi.delete(noteId);
            setNotes((prev)=> prev.filter((n)=> n._id !== noteId));
        }catch(err){
            setError('Failed to delete note');
        }
    }

    async function handleTogglePin(noteId:string, isPinned:boolean){
        const requestId = (pinRequestIdRef.current[noteId] ?? 0) + 1;
        pinRequestIdRef.current[noteId] = requestId;
        setNotes((prev)=> prev.map((n)=> n._id===noteId ? {...n, isPinned} : n));
        setPendingPinIds((prev)=> new Set(prev).add(noteId));

        try{
            await notesApi.togglePin(noteId,isPinned);
            if(pinRequestIdRef.current[noteId] !== requestId){
                return;
            }
            await fetchNotes(searchTerm,sortOption,new AbortController().signal);
        }catch(err){
            if(pinRequestIdRef.current[noteId] !== requestId){
                return;
            }
            setError('Failed to update pin');
            setNotes((prev)=> prev.map((n)=> n._id===noteId ? {...n, isPinned: !isPinned} : n));
        }
        finally{
            if(pinRequestIdRef.current[noteId] === requestId){
                setPendingPinIds((prev)=>{
                    const next = new Set(prev);
                    next.delete(noteId);
                    return next;
                });
            }   
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
    <label htmlFor="search-notes" className="DashboardVisuallyHidden">Search Notes</label>
<input id="search-notes" type="text" placeholder="Search Notes" className="DashboardSearchInput" value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}/>
<label htmlFor="sort-notes" className="DashboardVisuallyHidden">Sort By</label>
    <select id="sort-notes" className="DashboardSortSelect" value={sortOption} onChange={(e)=> setSortOption(e.target.value as SortOption)}>
        <option value="updatedAt_desc">Recently Updated</option>
        <option value="updatedAt_asc">Oldest Updated</option>
        <option value="createdAt_desc">Newest</option>
        <option value="createdAt_asc">Oldest</option>
        <option value="title_asc">Title A-Z</option>
        <option value="title_desc">Title Z-A</option>
    </select>
<Link to={'/notes/new'} className="DashboardCreateLink">Create New Note</Link>
</div>

{error && <p className="DashboardError">{error}</p>}

{isLoading?(
    <p className="DashboardLoadingText">Loading...</p>
):
((notes.length === 0)?(
    <p className="DashboardEmptyText"> {searchTerm? 'No Notes match your Search': 'No Notes Yet  Create a New Note'}</p>
):(<div className="DashboardNotesGrid">
        {notes.map((note)=>(<NoteCard key={note._id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} isPinning={pendingPinIds.has(note._id)}/>))}
</div>)
)}

    </div>
    </>);
}


export default DashboardPage;