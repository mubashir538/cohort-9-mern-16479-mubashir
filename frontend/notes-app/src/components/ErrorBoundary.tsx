import {Component,ReactNode} from 'react';

interface ErrorBoundaryProps{
    children: ReactNode;
}

interface ErrorBoundaryState{
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps,ErrorBoundaryState>{
    constructor(props: ErrorBoundaryProps){
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState{
        return {hasError: true};
    }

    componentDidCatch(error:Error): void{
        console.error('Error caught by Component Tree:',error);
    }

    render(): ReactNode{
        if(this.state.hasError){
            return (
                <div>
                    <h1>Something went wrong.</h1>
                    <p>Please refresh the page or try again later.</p>
                    <button onClick={()=>window.location.reload()}>Refresh</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;