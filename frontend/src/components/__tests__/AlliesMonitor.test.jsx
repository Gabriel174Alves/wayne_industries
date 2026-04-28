import React from 'react'
import { render, screen } from '@testing-library/react'
import AlliesMonitor from '../AlliesMonitor'

describe('AlliesMonitor', () => {
  it('renders when allies provided', () => {
    const allies = [
      { id: '1', name: 'Alpha', powerstats: { Intelligence: 80 } },
      { id: '2', name: 'Beta', powerstats: { Strength: 60 } }
    ]

    render(<AlliesMonitor allies={allies} />)

    expect(screen.getByText(/MONITOR DE ALIADOS/i)).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })
})
