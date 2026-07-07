import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { setCart, openCart, selectCart, selectCartItemCount } from '@/store/cartSlice'

export function useCart() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const cart = useSelector(selectCart)
  const itemCount = useSelector(selectCartItemCount)

  const refreshCart = useCallback(async () => {
    try {
      const { data } = await api.get('/cart/')
      dispatch(setCart(data))
      return data
    } catch {}
  }, [dispatch])

  const addToCart = useCallback(async (productId: number, variantId?: number, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add/', { product_id: productId, variant_id: variantId, quantity })
      dispatch(setCart(data))
      dispatch(openCart())
      toast.success('Added to cart!')
      return data
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add to cart')
      throw err
    }
  }, [dispatch])

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    try {
      const { data } = await api.patch(`/cart/${itemId}/`, { quantity })
      dispatch(setCart(data))
      return data
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update cart')
      throw err
    }
  }, [dispatch])

  const removeItem = useCallback(async (itemId: number) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}/`)
      dispatch(setCart(data))
      toast.success('Removed from cart')
      return data
    } catch (err: any) {
      toast.error('Failed to remove item')
      throw err
    }
  }, [dispatch])

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const { data } = await api.post('/cart/apply-coupon/', { code })
      await refreshCart()
      toast.success(`Coupon applied! You saved $${data.discount.toFixed(2)}`)
      return data
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid coupon code'
      toast.error(msg)
      throw err
    }
  }, [refreshCart])

  return {
    cart,
    itemCount,
    refreshCart,
    addToCart,
    updateItem,
    removeItem,
    applyCoupon,
  }
}
