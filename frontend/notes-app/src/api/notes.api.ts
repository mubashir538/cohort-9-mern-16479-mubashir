import axiosClient from "./axiosClient";


export type SortOption =
    'updatedAt_desc'
    | 'updatedAt_asc'
    | 'createdAt_desc'
    | 'createdAt_asc'
    | 'title_asc'
    | 'title_desc';

export interface Note {
    _id: string
    title: string
    content: string
    userId: string
    isPinned: boolean
    highlightColor: string | null
    createdAt: string
    updatedAt: string
}

interface GetAllParams {
    search?: string
    sort?: SortOption
}

interface CreateNoteOptions {
    isPinned?: boolean
    highlightColor?: string | null
}

interface UpdateNoteOptions {
    title?: string
    content?: string
    isPinned?: boolean
    highlightColor?: string | null
}


export const notesApi = {
    getAll: (params: GetAllParams,signal?:AbortSignal) =>
        axiosClient.get<{success: boolean; data: {notes: Note[]}}>('/notes',{params,signal}),

    getbyId: (id: string)=>
        axiosClient.get<{success: boolean; data: {note: Note}}>(`/notes/${id}`),

    create: (title:string, content: string, options: CreateNoteOptions = {})=>
            axiosClient.post<{success: boolean; data: {note: Note}}>('/notes',{title,content,...options}),

    update: (id:string, updates: UpdateNoteOptions)=>
            axiosClient.put<{success: boolean; data: {note:Note}}>(`/notes/${id}`,updates),

    delete: (id:string)=> axiosClient.delete<{success: boolean;data:{message:string}}>(`/notes/${id}`),

    togglePin: (id: string, isPinned: boolean) => axiosClient.put<{ success: boolean, data: { note: Note } }>(`/notes/${id}`, { isPinned }),

};


