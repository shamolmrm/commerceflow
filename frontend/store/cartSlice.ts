import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Cart, CartItem } from '@/types'

interface CartState {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
}

const initialState: CartState = {
  cart: null,
  isOpen: false,
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<Cart>) {
      state.cart = action.payload
    },
    clearCart(state) {
      state.cart = null
    },
    openCart(state) {
      state.isOpen = true
    },
    closeCart(state) {
      state.isOpen = false
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen
    },
    setCartLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setCart, clearCart, openCart, closeCart, toggleCart, setCartLoading } = cartSlice.actions
export default cartSlice.reducer

export const selectCart = (state: { cart: CartState }) => state.cart.cart
export const selectCartOpen = (state: { cart: CartState }) => state.cart.isOpen
export const selectCartItemCount = (state: { cart: CartState }) => state.cart.cart?.item_count ?? 0
export const selectCartTotal = (state: { cart: CartState }) => state.cart.cart?.total ?? 0
