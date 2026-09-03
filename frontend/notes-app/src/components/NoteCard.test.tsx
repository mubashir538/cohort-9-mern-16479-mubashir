import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NoteCard from './NoteCard'
import type { Note } from '../api/notes.api'

const note: Note = {
    _id: 'note-1',
    title: 'Test Note',
    content: '<p>Hello there</p>',
    userId: 'user-1',
    isPinned: false,
    highlightColor: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('NoteCard', () => {

    it('shows the note title', () => {
        render(
            <MemoryRouter>
                <NoteCard note={note} onDelete={jest.fn()} onTogglePin={jest.fn()} isPinning={false} />
            </MemoryRouter>
        )

        expect(screen.getByText('Test Note')).toBeInTheDocument()
    })

    it('calls onDelete when delete is clicked', () => {
        const onDelete = jest.fn()

        render(
            <MemoryRouter>
                <NoteCard note={note} onDelete={onDelete} onTogglePin={jest.fn()} isPinning={false} />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByLabelText('Delete note'))

        expect(onDelete).toHaveBeenCalledWith('note-1')
    })

    it('calls onTogglePin when pin is clicked', () => {
        const onTogglePin = jest.fn()

        render(
            <MemoryRouter>
                <NoteCard note={note} onDelete={jest.fn()} onTogglePin={onTogglePin} isPinning={false} />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByLabelText('Pin note'))

        expect(onTogglePin).toHaveBeenCalledWith('note-1', true)
    })

})
