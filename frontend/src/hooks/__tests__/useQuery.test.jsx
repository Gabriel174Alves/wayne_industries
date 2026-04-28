import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useQuery } from '../useQuery'
import axios from 'axios'

vi.mock('axios')

describe('useQuery', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('fetches data and calls onSuccess', async () => {
    const data = [{ id: 1 }]
    axios.get.mockResolvedValue({ data })

    const onSuccess = vi.fn()
    const { result, waitForNextUpdate } = renderHook(() => useQuery('/api/test', { token: 'tok', onSuccess }))

    // initial state: loading true
    expect(result.current.loading).toBe(true)

    // wait for effect to finish
    await act(async () => {
      // wait small tick for promise to resolve
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(data)
    expect(onSuccess).toHaveBeenCalledWith(data)
  })

  it('handles errors and calls onError', async () => {
    const err = new Error('network')
    axios.get.mockRejectedValue(err)

    const onError = vi.fn()
    const { result } = renderHook(() => useQuery('/api/fail', { token: 'tok', onError }))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeTruthy()
    expect(onError).toHaveBeenCalled()
  })

  it('refetch function re-runs the fetcher', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1 }] }).mockResolvedValueOnce({ data: [{ id: 2 }] })

    const { result } = renderHook(() => useQuery('/api/refetch', { token: 'tok' }))

    await act(async () => { await Promise.resolve() })
    expect(result.current.data).toEqual([{ id: 1 }])

    await act(async () => { await result.current.refetch() })
    expect(result.current.data).toEqual([{ id: 2 }])
  })
})
