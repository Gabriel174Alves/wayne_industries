import React from 'react'
import { render, screen } from '@testing-library/react'
import SummaryCards from '../SummaryCards'

describe('SummaryCards', () => {
  it('renders counts and logs', () => {
    const allies = [{ name: 'A' }, { name: 'B' }]
    const inventory = [{ quantity: 2 }, { quantity: 3 }]
    const logs = ['log1', 'log2']

    render(<SummaryCards allies={allies} inventory={inventory} logs={logs} />)

    expect(screen.getByText(/ALIADOS ATIVOS/i)).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // allies count
    expect(screen.getByText(/TOTAL DE ITENS/i)).toBeInTheDocument()
    // total items = 5
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/LOGS RECENTES/i)).toBeInTheDocument()
    expect(screen.getByText('log2')).toBeInTheDocument()
  })
})
