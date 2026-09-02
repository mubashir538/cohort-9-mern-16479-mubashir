import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NoteNotFound from './NoteNotFound'

describe('NoteNotFound', () => {

    it('shows the not found title', () => {
        render(
            <MemoryRouter>
                <NoteNotFound />
            </MemoryRouter>
        )

        expect(screen.getByText('Note Not Found')).toBeInTheDocument()
    })

    it('has a link back to dashboard', () => {
        render(
            <MemoryRouter>
                <NoteNotFound />
            </MemoryRouter>
        )

        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    })

})
