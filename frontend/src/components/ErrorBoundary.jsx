import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-hud-dark flex items-center justify-center border border-hud-border">
          <div className="max-w-md p-8 border border-hud-border bg-hud-dark text-center">
            <h2 className="text-2xl font-bold text-hud-highlight mb-4 font-mono">
              [ERRO CRÍTICO]
            </h2>
            <p className="text-hud-text mb-4 font-mono text-sm">
              {this.state.error?.message || 'Ocorreu um erro inesperado'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-6 py-2 border border-hud-border hover:border-hud-glow hover:shadow-hud-glow transition-all font-mono"
            >
              REINICIAR SISTEMA
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
