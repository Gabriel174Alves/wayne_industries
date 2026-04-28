import { createContext, useContext, useReducer, useCallback } from 'react'

const InventoryContext = createContext(undefined)

const initialState = {
  allies: [],
  inventory: [],
  selectedItem: null,
  loading: false,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ALLIES':
      return { ...state, allies: action.payload, error: null }
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload, error: null }
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'ADD_INVENTORY_ITEM':
      return { ...state, inventory: [...state.inventory, action.payload] }
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      }
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      }
    default:
      return state
  }
}

export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setAllies = useCallback((allies) => {
    dispatch({ type: 'SET_ALLIES', payload: allies })
  }, [])

  const setInventory = useCallback((inventory) => {
    dispatch({ type: 'SET_INVENTORY', payload: inventory })
  }, [])

  const selectItem = useCallback((item) => {
    dispatch({ type: 'SELECT_ITEM', payload: item })
  }, [])

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const addInventoryItem = useCallback((item) => {
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item })
  }, [])

  const updateInventoryItem = useCallback((item) => {
    dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: item })
  }, [])

  const deleteInventoryItem = useCallback((itemId) => {
    dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: itemId })
  }, [])

  const value = {
    state,
    setAllies,
    setInventory,
    selectItem,
    setLoading,
    setError,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
  }

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider')
  }
  return context
}
