import axiosClient from "./axiosClient";

export interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}


export const notesApi = {
    getAll: (search?: string,signal?:AbortSignal) =>
        axiosClient.get<{success: boolean; data: {notes: Note[]}}>('/notes',{params: search? {search}: {},signal}),

    getbyId: (id: string)=>
        axiosClient.get<{success: boolean; data: {note: Note}}>(`/notes/${id}`),

    create: (title:string, content: string)=>
            axiosClient.post<{success: boolean; data: {note: Note}}>('/notes',{title,content}),

    update: (id:string, title: string, content: string)=>
            axiosClient.put<{success: boolean; data: {note:Note}}>(`/notes/${id}`,{title,content}),

    delete: (id:string)=> axiosClient.delete<{success: boolean;data:{message:string}}>(`/notes/${id}`),
};


