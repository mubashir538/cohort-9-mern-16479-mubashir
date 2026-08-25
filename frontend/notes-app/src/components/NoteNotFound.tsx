import {Link} from 'react-router-dom';
import {FileQuestion,ArrowLeft} from 'lucide-react';
import './NoteNotFound.css';

function NoteNotFound(){
    return (
        <div className="NoteNotFound">

            <div className="NoteNotFoundIconWrapper">
            <FileQuestion size={34} className="NoteNotFoundIcon"/>
            </div>

            <span className="NoteNotFoundEyebrow">404</span>

            <h1 className="NoteNotFoundTitle">Note Not Found</h1>

            <p className="NoteNotFoundText">This note does not exist or you no longer have access to it</p>

            <div className="NoteNotFoundDotGrid">
                <span className="NoteNotFoundDot"></span><span className="NoteNotFoundDot"></span><span className="NoteNotFoundDot"></span>
            </div>

            <Link to="/dashboard" className="NoteNotFoundLink">
            <ArrowLeft size={16}/>
            Back to Dashboard
            </Link>

        </div>
    );
}

export default NoteNotFound;