type EventCallback = (data: any) => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        this.listeners.set(
          event,
          callbacks.filter((cb) => cb !== callback)
        );
      }
    };
  }

  publish(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error handling event "${event}":`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  USER_LOGGED_IN: "USER_LOGGED_IN",
  USER_LOGGED_OUT: "USER_LOGGED_OUT",
  ROLE_CHANGED: "ROLE_CHANGED",
  QUOTE_CREATED: "QUOTE_CREATED",
  PRO_BOOKED: "PRO_BOOKED",
  PRODUCT_ADDED_TO_CART: "PRODUCT_ADDED_TO_CART",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  COURSE_ENROLLED: "COURSE_ENROLLED",
  TICKET_CREATED: "TICKET_CREATED",
};
