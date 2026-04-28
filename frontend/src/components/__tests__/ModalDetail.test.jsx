import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock recharts to avoid ResponsiveContainer/ResizeObserver issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive">{children}</div>,
  RadarChart: ({ children }) => <div data-testid="radar">{children}</div>,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Radar: () => null,
  Legend: () => null,
  Tooltip: () => null,
}))

import ModalDetail from '../ModalDetail'

describe('ModalDetail', () => {
  it('renders ally details with radar chart when ally provided', () => {
    const item = {
      name: 'Test Ally',
      biography: { 'full-name': 'Full Name', 'alter-egos': 'None' },
      powerstats: { Intelligence: 80, Strength: 60, Speed: 40 },
      image: 'https://example.com/avatar.png',
      work: { base: 'Batcave' }
    }

    render(<ModalDetail isOpen={true} item={item} onClose={() => {}} />)

    expect(screen.getByText('TEST ALLY')).toBeInTheDocument()
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText(/BASE DE OPERAÇÕES/i)).toBeInTheDocument()
    // RadarChart renders canvas or svg - check for presence by role or alt
    // The RadarChart component uses recharts; check for statistic text
    // Recharts is mocked; ensure responsive container rendered
    expect(screen.getByTestId('responsive')).toBeInTheDocument()
  })

  it('renders equipment details when non-ally item provided', () => {
    const item = {
      name: 'Gadget',
      quantity: 10,
      category: 'Equipment',
      description: 'Useful gadget'
    }

    render(<ModalDetail isOpen={true} item={item} onClose={() => {}} />)

    // Modal shows name as provided for non-ally items
    expect(screen.getByText('Gadget')).toBeInTheDocument()
    expect(screen.getByText(/QUANTIDADE/i)).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText(/CATEGORIA/i)).toBeInTheDocument()
  })
})
