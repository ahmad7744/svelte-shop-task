export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

export interface QueuedOperation {
  id: string;
  type: "add" | "remove" | "update" | "clear";
  item?: CartItem;
  quantity?: number;
  timestamp: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  queue: QueuedOperation[];
  isProcessing: boolean;
}

// Create reactive cart state using a simple reactive object
const createReactiveState = <T>(initialState: T) => {
  let state = { ...initialState };
  const subscribers = new Set<() => void>();

  return {
    get current() {
      return state;
    },
    update(updater: (state: T) => T | void) {
      const result = updater(state);
      if (result !== undefined) {
        state = result;
      }
      subscribers.forEach((callback) => callback());
    },
    subscribe(callback: () => void) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  };
};

const cartStateReactive = createReactiveState<CartState>({
  items: [],
  total: 0,
  itemCount: 0,
  queue: [],
  isProcessing: false,
});

class CartService {
  private processingQueue = false;
  private queueDelay = 500; // 500ms delay for queue processing

  // Get current cart state
  getState() {
    return cartStateReactive.current;
  }

  // Subscribe to state changes
  subscribe(callback: () => void) {
    return cartStateReactive.subscribe(callback);
  }

  // Calculate totals
  private calculateTotals() {
    cartStateReactive.update((state) => {
      const total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      state.total = Math.round(total * 100) / 100; // Round to 2 decimal places
      state.itemCount = itemCount;
    });
  }

  // Generate unique operation ID
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add operation to queue
  private addToQueue(
    operation: Omit<QueuedOperation, "id" | "timestamp" | "status">
  ) {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      status: "pending",
    };

    cartStateReactive.update((state) => {
      state.queue.push(queuedOp);
    });

    this.processQueue();
    return queuedOp.id;
  }

  // Process queue asynchronously
  private async processQueue() {
    if (this.processingQueue) return;

    this.processingQueue = true;
    cartStateReactive.update((state) => {
      state.isProcessing = true;
    });

    while (cartStateReactive.current.queue.length > 0) {
      const operation = cartStateReactive.current.queue[0];

      // Update operation status
      cartStateReactive.update((state) => {
        state.queue[0].status = "processing";
      });

      try {
        // Simulate async processing delay
        await new Promise((resolve) => setTimeout(resolve, this.queueDelay));

        // Execute the operation
        await this.executeOperation(operation);

        cartStateReactive.update((state) => {
          state.queue[0].status = "completed";
        });
      } catch (error) {
        console.error("Cart operation failed:", error);
        cartStateReactive.update((state) => {
          state.queue[0].status = "failed";
        });
      }

      // Remove completed/failed operation from queue
      cartStateReactive.update((state) => {
        state.queue.shift();
      });
    }

    this.processingQueue = false;
    cartStateReactive.update((state) => {
      state.isProcessing = false;
    });
  }

  // Execute individual operations
  private async executeOperation(operation: QueuedOperation) {
    switch (operation.type) {
      case "add":
        if (operation.item) {
          this.executeAddItem(operation.item);
        }
        break;
      case "remove":
        if (operation.item) {
          this.executeRemoveItem(operation.item.id);
        }
        break;
      case "update":
        if (operation.item && operation.quantity !== undefined) {
          this.executeUpdateQuantity(operation.item.id, operation.quantity);
        }
        break;
      case "clear":
        this.executeClearCart();
        break;
    }
  }

  // Execute add item operation
  private executeAddItem(newItem: CartItem) {
    cartStateReactive.update((state) => {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === newItem.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        state.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        state.items.push({ ...newItem });
      }
    });

    this.calculateTotals();
  }

  // Execute remove item operation
  private executeRemoveItem(itemId: string) {
    cartStateReactive.update((state) => {
      state.items = state.items.filter((item) => item.id !== itemId);
    });
    this.calculateTotals();
  }

  // Execute update quantity operation
  private executeUpdateQuantity(itemId: string, quantity: number) {
    cartStateReactive.update((state) => {
      const itemIndex = state.items.findIndex((item) => item.id === itemId);
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
      }
    });
    this.calculateTotals();
  }

  // Execute clear cart operation
  private executeClearCart() {
    cartStateReactive.update((state) => {
      state.items = [];
    });
    this.calculateTotals();
  }

  // Public methods that add operations to queue
  addItem(item: Omit<CartItem, "quantity">, quantity: number = 1): string {
    const cartItem: CartItem = { ...item, quantity };
    return this.addToQueue({
      type: "add",
      item: cartItem,
    });
  }

  removeItem(itemId: string): string {
    const item = cartStateReactive.current.items.find(
      (item) => item.id === itemId
    );
    if (!item) throw new Error("Item not found in cart");

    return this.addToQueue({
      type: "remove",
      item,
    });
  }

  updateQuantity(itemId: string, quantity: number): string {
    const item = cartStateReactive.current.items.find(
      (item) => item.id === itemId
    );
    if (!item) throw new Error("Item not found in cart");

    return this.addToQueue({
      type: "update",
      item,
      quantity,
    });
  }

  clearCart(): string {
    return this.addToQueue({
      type: "clear",
    });
  }

  // Get queue status for specific operation
  getOperationStatus(operationId: string): QueuedOperation | null {
    return (
      cartStateReactive.current.queue.find((op) => op.id === operationId) ||
      null
    );
  }

  // Check if item is in cart
  isItemInCart(itemId: string): boolean {
    return cartStateReactive.current.items.some((item) => item.id === itemId);
  }

  // Get item quantity in cart
  getItemQuantity(itemId: string): number {
    const item = cartStateReactive.current.items.find(
      (item) => item.id === itemId
    );
    return item ? item.quantity : 0;
  }
}

// Export singleton instance
export const cartService = new CartService();
