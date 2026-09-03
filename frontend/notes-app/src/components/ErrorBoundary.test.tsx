import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function BrokenChild(): never {
    throw new Error('boom')
}

describe('ErrorBoundary', () => {

    it('shows fallback ui when a child throws', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

        try {
            render(
                <ErrorBoundary>
                    <BrokenChild />
                </ErrorBoundary>
            )

            expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
        } finally {
            consoleError.mockRestore()
        }
    })

})
