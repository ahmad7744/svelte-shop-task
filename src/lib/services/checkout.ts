export interface CheckoutState {
  canCheckout: boolean;
  lastCheckoutTime: number | null;
  cooldownRemaining: number;
  isProcessing: boolean;
}

// Create reactive checkout state using a simple reactive object
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

const checkoutStateReactive = createReactiveState<CheckoutState>({
  canCheckout: true,
  lastCheckoutTime: null,
  cooldownRemaining: 0,
  isProcessing: false,
});

class CheckoutService {
  private cooldownPeriod = 10000; // 10 seconds in milliseconds
  private countdownInterval: number | null = null;

  // Get current checkout state
  getState() {
    return checkoutStateReactive.current;
  }

  // Subscribe to state changes
  subscribe(callback: () => void) {
    return checkoutStateReactive.subscribe(callback);
  }

  // Start countdown timer
  private startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      if (checkoutStateReactive.current.lastCheckoutTime) {
        const elapsed =
          Date.now() - checkoutStateReactive.current.lastCheckoutTime;
        const remaining = Math.max(0, this.cooldownPeriod - elapsed);

        checkoutStateReactive.update((state) => {
          state.cooldownRemaining = Math.ceil(remaining / 1000);

          if (remaining <= 0) {
            state.canCheckout = true;
            state.cooldownRemaining = 0;
          }
        });

        if (remaining <= 0) {
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
          }
        }
      }
    }, 100); // Update every 100ms for smooth countdown
  }

  // Process checkout
  async processCheckout(
    cartItems: unknown[],
    totalAmount: number
  ): Promise<{ success: boolean; message: string }> {
    // Check if checkout is allowed
    if (!checkoutStateReactive.current.canCheckout) {
      return {
        success: false,
        message: `Please wait ${checkoutStateReactive.current.cooldownRemaining} seconds before checking out again.`,
      };
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      return {
        success: false,
        message: "Your cart is empty. Add some items before checking out.",
      };
    }

    try {
      checkoutStateReactive.update((state) => {
        state.isProcessing = true;
      });

      // Simulate checkout processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mark checkout as completed
      checkoutStateReactive.update((state) => {
        state.lastCheckoutTime = Date.now();
        state.canCheckout = false;
        state.isProcessing = false;
      });

      // Start countdown
      this.startCountdown();

      return {
        success: true,
        message: `Successfully processed checkout for $${totalAmount.toFixed(2)}!`,
      };
    } catch (error: unknown) {
      checkoutStateReactive.update((state) => {
        state.isProcessing = false;
      });
      return {
        success: false,
        message: `Checkout failed. Please try again. ${error}`,
      };
    }
  }

  // Reset checkout state (for testing purposes)
  reset() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    checkoutStateReactive.update((state) => {
      state.canCheckout = true;
      state.lastCheckoutTime = null;
      state.cooldownRemaining = 0;
      state.isProcessing = false;
    });
  }

  // Get formatted countdown time
  getFormattedCountdown(): string {
    if (checkoutStateReactive.current.cooldownRemaining <= 0) return "";

    const seconds = checkoutStateReactive.current.cooldownRemaining;
    return `${seconds}s`;
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();
