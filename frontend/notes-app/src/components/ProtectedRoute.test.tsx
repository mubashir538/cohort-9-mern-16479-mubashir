import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

jest.mock('../context/AuthContext')

const mockUseAuth = useAuth as jest.Mock

describe('ProtectedRoute', () => {

    it('shows loading text while auth is loading', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true })

        render(
            <MemoryRouter>
                <ProtectedRoute><p>Secret</p></ProtectedRoute>
            </MemoryRouter>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders children when user is authenticated', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false })

        render(
            <MemoryRouter>
                <ProtectedRoute><p>Secret</p></ProtectedRoute>
            </MemoryRouter>
        )

        expect(screen.getByText('Secret')).toBeInTheDocument()
    })

    it('does not render children when user is not authenticated', () => {
        mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false })

        render(
            <MemoryRouter>
                <ProtectedRoute><p>Secret</p></ProtectedRoute>
            </MemoryRouter>
        )

        expect(screen.queryByText('Secret')).not.toBeInTheDocument()
    })

})
