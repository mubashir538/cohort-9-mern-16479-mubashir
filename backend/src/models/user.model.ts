import {Schema, model, Document, Types} from 'mongoose';

export interface IUser extends Document {
 _id: Types.ObjectId;
 name: string;
 email: string;
 passwordHashed: string;
 createdAt: Date;
 updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: {type:String, required: true, unique: true, lowercase: true, trim: true},
    passwordHashed: {type: String, required: true},
}, {timestamps: true});


const User = model<IUser>('User', userSchema);

export default User;