import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { colors } from "@/src/constants/theme";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import { useSubscriptions } from "@/src/context/SubscriptionsContext";

const SafeAreaView = styled(RNSafeAreaView);

const matchesQuery = (subscription: Subscription, query: string) => {
  const haystack = [
    subscription.name,
    subscription.category,
    subscription.plan,
    subscription.billing,
    subscription.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

const Subscriptions = () => {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSubscriptions = useMemo(() => {
    if (!normalizedQuery) return subscriptions;
    return subscriptions.filter((subscription) => matchesQuery(subscription, normalizedQuery));
  }, [normalizedQuery, subscriptions]);

  useEffect(() => {
    posthog.capture("subscriptions_tab_viewed");
  }, [posthog]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title">Subscriptions</Text>

      <View className="auth-input-wrap my-5">
        <TextInput
          className="auth-input"
          value={query}
          onChangeText={setQuery}
          placeholder="Search subscriptions"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">
            {subscriptions.length === 0 ? "No subscriptions yet." : "No matching subscriptions."}
          </Text>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))
            }
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
