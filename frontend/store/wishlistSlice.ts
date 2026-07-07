import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WishlistItem } from '@/types'

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist(state, action: PayloadAction<WishlistItem[]>) {
      state.items = action.payload
    },
    addToWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.find((item) => item.id === action.payload.id)
      if (!exists) state.items.push(action.payload)
    },
    removeFromWishlist(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearWishlist(state) {
      state.items = []
    },
    setWishlistLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setWishlist, addToWishlist, removeFromWishlist, clearWishlist, setWishlistLoading } = wishlistSlice.actions
export default wishlistSlice.reducer

export const selectWishlist = (state: { wishlist: WishlistState }) => state.wishlist.items
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length
export const selectIsInWishlist = (productId: number) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => item.product.id === productId)
