import "@/global.css"
import dayjs from "dayjs";
import { styled } from "nativewind";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import images from "@/src/constants/images";
import {HOME_BALANCE, UPCOMING_SUBSCRIPTIONS} from "@/src/constants/data";
import { useUser } from "@clerk/expo";
import {icons} from "@/src/constants/icons";
import {formatCurrency} from "@/lib/utils";
import ListHeading from "@/src/components/ListHeading";
import UpcomingSubscriptionCard from "@/src/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import CreateSubscriptionModal from "@/src/components/CreateSubscriptionModal";
import { useSubscriptions } from "@/src/context/SubscriptionsContext";
import { useState } from "react";
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);
/* SafeAreaView is a third-party component from react-native-safe-area-context and Native Wind needs the styled wrapper to enable className support*/

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const displayName = user?.firstName || user?.fullName || "there";

  const handleSubscriptionPress = (item: Subscription) => {
    setExpandedSubscriptionId((currentId) => {
      const isExpanding = currentId !== item.id;
      if (isExpanding) {
        posthog.capture('subscription_expanded', {
          subscription_name: item.name,
          subscription_billing: item.billing,
          ...(item.category? { subscription_category: item.category } : {}),
        });
      }
      return isExpanding ? item.id : null;
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-background p-5">


        <FlatList 
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar"/>
                  <Text className="home-user-name">{displayName}</Text>
                  <Pressable onPress={() => setIsCreateOpen(true)} hitSlop={8}>
                    <Image source={icons.add} className="home-add-icon" />
                  </Pressable>
                </View>
              </View>

              <View className="home-balance-card">
                  <Text className="home-balance-label">Balance</Text>

                  <View className="home-balance-row">
                    <Text className="home-balance-amount">
                      {formatCurrency(HOME_BALANCE.amount)}
                    </Text>
                    <Text className="home-balance-date">
                      {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                    </Text>
                  </View>
              </View>

              <View className="mb-5">
                <ListHeading title="Upcoming" />
                
                <FlatList 
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />)}
                    keyExtractor={( item ) => item.id} 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                />
              </View>
              <ListHeading title="All Subscriptions" />
            </>
          )}
          data={subscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard 
              {...item} 
              expanded={expandedSubscriptionId === item.id}
              onPress={() => handleSubscriptionPress(item)}
            />
          )}
          extraData={(expandedSubscriptionId)}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
          contentContainerClassName="pb-30"
        />
        <CreateSubscriptionModal
          visible={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={addSubscription}
        />
    </SafeAreaView>
  );
}