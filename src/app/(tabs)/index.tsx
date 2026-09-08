import "@/global.css"
import dayjs from "dayjs";
import { styled } from "nativewind";
import { FlatList, Image, Text, View } from "react-native";
import { Link } from "expo-router";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import images from "@/src/constants/images";
import {HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS} from "@/src/constants/data";
import {HOME_BALANCE} from "@/src/constants/data";
import {icons} from "@/src/constants/icons";
import {formatCurrency} from "@/lib/utils";
import ListHeading from "@/src/components/ListHeading";
import UpcomingSubscriptionCard from "@/src/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/src/components/SubscriptionCard";
import { useState } from "react";

const SafeAreaView = styled(RNSafeAreaView);
/* SafeAreaView is a third-party component from react-native-safe-area-context and Native Wind needs the styled wrapper to enable className support*/

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background p-5">


        <FlatList 
          ListHeaderComponent={() => (
            <>
              <View className="home-header">
                <View className="home-user">
                  <Image source={images.avatar} className="home-avatar"/>
                  <Text className="home-user-name">{HOME_USER.name}</Text>
                  <Image source={icons.add} className="home-add-icon" />
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
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard 
              {...item} 
              expanded={expandedSubscriptionId=== item.id}
              onPress={() => setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id))}
            />
          )}
          extraData={(expandedSubscriptionId)}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
          contentContainerClassName="pb-30"
        />
    </SafeAreaView>
  );
}