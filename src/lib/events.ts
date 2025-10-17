// Simple event system for refreshing data across components

type EventCallback = () => void

class EventManager {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }
}

export const eventManager = new EventManager()

// Event types
export const EVENTS = {
  PRODUCTS_UPDATED: 'products_updated',
  STOCK_UPDATED: 'stock_updated',
  CART_UPDATED: 'cart_updated'
} as const
