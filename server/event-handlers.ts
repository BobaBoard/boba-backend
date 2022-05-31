import { registerAll as registerAllSubscriptionEvents } from "./subscriptions/events";

export const registerEventHandlers = () => {
  registerAllSubscriptionEvents();
};
