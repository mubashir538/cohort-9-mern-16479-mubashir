import {useAuth} from '../context/AuthContext';
import {useState, useCallback,useEffect,useRef, type ReactElement} from 'react';
import {Link} from 'react-router-dom';
import {notesApi,type Note,type SortOption} from '../api/notes.api';
import NoteCard from '../components/NoteCard';
import './DashboardPage.css'

function DashboardPage(): ReactElement{
    const {user, logout} = useAuth();

    const [notes,setNotes] = useState<Note[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption,setSortOption] = useState<SortOption>('updatedAt_desc');
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState('');
    const [pendingPinIds,setPendingPinIds] = useState<Set<string>>(new Set());
    const pinRequestIdRef = useRef<Record<string, number>>({});
    const listRequestIdRef = useRef(0);
    const listAbortControllerRef = useRef<AbortController | null>(null);
    const searchTermRef = useRef(searchTerm);
    const sortOptionRef = useRef(sortOption);
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


    useEffect(() => {
        searchTermRef.current = searchTerm;
    }, [searchTerm]);
    
    useEffect(() => {
        sortOptionRef.current = sortOption;
    }, [sortOption]);

    const fetchNotes=   useCallback(async (search: string,sort:SortOption,signal:AbortSignal): Promise<void> => {
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
            console.error(err);
            setError('Can not Load Notes');
        }finally{
            if(!signal.aborted && requestId === listRequestIdRef.current){
                setIsLoading(false);
            }
        }
    },[]);

    useEffect(()=>{
        const controller = new AbortController();

        listAbortControllerRef.current?.abort();
        listAbortControllerRef.current = controller;

        debounceTimeoutRef.current = setTimeout(() => {
            debounceTimeoutRef.current = null;
            fetchNotes(searchTerm,sortOption,controller.signal);
        },400);
        return () => {
            if (debounceTimeoutRef.current !== null) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
            listAbortControllerRef.current?.abort();
            listAbortControllerRef.current = null;

        }
    },[searchTerm,sortOption,fetchNotes]);


    async function handleDelete(noteId: string): Promise<void>{
        const confirmed = window.confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try{
            await notesApi.delete(noteId);
            setNotes((prev)=> prev.filter((n)=> n._id !== noteId));
        }catch(err){
            console.error(err);
            setError('Failed to delete note');
        }
    }

    async function handleTogglePin(noteId:string, isPinned:boolean): Promise<void>{
        const requestId = (pinRequestIdRef.current[noteId] ?? 0) + 1;
        pinRequestIdRef.current[noteId] = requestId;
        setNotes((prev)=> prev.map((n)=> n._id===noteId ? {...n, isPinned} : n));
        setPendingPinIds((prev)=> new Set(prev).add(noteId));

        try{
            await notesApi.togglePin(noteId,isPinned);
            if(pinRequestIdRef.current[noteId] !== requestId){
                return;
            }
            listRequestIdRef.current++;
            if (debounceTimeoutRef.current !== null) {
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
            }
            listAbortControllerRef.current?.abort();
            const refreshController = new AbortController();
            listAbortControllerRef.current = refreshController;
            await fetchNotes(searchTermRef.current,sortOptionRef.current,refreshController.signal);
        }catch(err){
            if(pinRequestIdRef.current[noteId] !== requestId){
                return;
            }
            console.error(err);
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

     async function handleLogout(): Promise<void> {
        try {
            await logout();
        } catch (err) {
            console.error('Failed to log out', err);
        }
    }

    function getWelcomeText(): string {
        if (notes.length === 0) {
            return "You don't have any notes yet, create your first one below";
        }

        const noteLabel = notes.length === 1 ? 'note' : 'notes';
        return `You have ${notes.length} ${noteLabel} saved in your account`;
    }

    function renderNotesSection() {
        if (isLoading) {
            return <p className="DashboardLoadingText">Loading...</p>;
        }

        if (notes.length === 0) {
            const emptyText = searchTerm ? 'No Notes match your Search' : 'No Notes Yet  Create a New Note';
            return <p className="DashboardEmptyText">{emptyText}</p>;
        }

        return (
            <div className="DashboardNotesGrid">
                {notes.map((note)=>(<NoteCard key={note._id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} isPinning={pendingPinIds.has(note._id)}/>))}
            </div>
        );
    }

    return (
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
        {getWelcomeText()}
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

{renderNotesSection()}

    </div>
    );
}


export default DashboardPage;