import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InventoryManager from '../InventoryManager'
import axios from 'axios'

vi.mock('axios')

describe('InventoryManager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('edits quantity and calls API then onRefresh', async () => {
    const item = { id: 1, name: 'Test Item', category: 'Equipment', quantity: 3 }
    const onRefresh = vi.fn()
    axios.put.mockResolvedValue({ data: { message: 'Item atualizado' } })

    render(<InventoryManager inventory={[item]} token={'tok'} onRefresh={onRefresh} />)

    // Click Edit
    const editBtn = screen.getByText(/Editar/i)
    fireEvent.click(editBtn)

    // Change qty
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '10' } })

    // Click Save
    const saveBtn = screen.getByText(/Salvar/i)
    fireEvent.click(saveBtn)

    await waitFor(() => expect(axios.put).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalled()
  })

  it('deletes item when role is admin and confirm is true', async () => {
    const item = { id: 2, name: 'Delete Item', category: 'Equipment', quantity: 1 }
    const onRefresh = vi.fn()
    localStorage.setItem('authRole', 'admin')
    axios.delete.mockResolvedValue({ data: { message: 'Item excluído' } })

    // mock confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<InventoryManager inventory={[item]} token={'tok'} onRefresh={onRefresh} />)

    const deleteBtn = screen.getByText(/Excluir/i)
    fireEvent.click(deleteBtn)

    await waitFor(() => expect(axios.delete).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
