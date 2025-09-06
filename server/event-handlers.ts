import { registerAll as registerAllSubscriptionEvents } from "./subscriptions/events.js";

export const registerEventHandlers = () => {
  registerAllSubscriptionEvents();
};
