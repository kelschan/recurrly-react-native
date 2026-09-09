import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { HOME_SUBSCRIPTIONS } from "@/src/constants/data";

type SubscriptionsContextValue = {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export const SubscriptionsProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptions, setSubscriptions] = useState(HOME_SUBSCRIPTIONS);

  const value = useMemo(
    () => ({
      subscriptions,
      addSubscription: (subscription: Subscription) => {
        setSubscriptions((current) => [subscription, ...current]);
      },
    }),
    [subscriptions],
  );

  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>;
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within SubscriptionsProvider");
  }
  return context;
};
