import {Schema, model, Document,Types} from 'mongoose';

export interface INote extends Document{
    _id : Types.ObjectId;
    title : string;
    content : string;
    isPinned : boolean;
    highlightColor : string | null;
    userId : Types.ObjectId;
    createdAt : Date;
    updatedAt : Date;
}


const noteSchema = new Schema<INote>({
    title: { type: String, required: true, trim: true },
    content: {type:String, default: ''},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    isPinned: {type: Boolean, default: false},
    highlightColor: {type: String, default: null},
}, {timestamps: true});


noteSchema.index({ userId: 1});
noteSchema.index({ userId: 1, isPinned: -1});
const Note = model<INote>('Note', noteSchema);

export default Note;