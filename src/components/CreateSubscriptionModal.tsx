import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import AuthField from "@/src/components/auth/AuthField";
import AuthButton from "@/src/components/auth/AuthButton";
import { icons } from "@/src/constants/icons";

const FREQUENCIES = ["Monthly", "Yearly"] as const;
const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#8fd1bd",
  Cloud: "#cfe4f6",
  Music: "#f5c542",
  Other: "#fff8e7",
};

const parsePrice = (value: string) => {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("Monthly");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | "">("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const parsedPrice = parsePrice(price);
  const canSubmit = name.trim().length > 0 && parsedPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("");
    setNameError(null);
    setPriceError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const nextNameError = trimmedName ? null : "Enter a subscription name.";
    const nextPriceError = parsedPrice > 0 ? null : "Enter a price greater than 0.";
    setNameError(nextNameError);
    setPriceError(nextPriceError);
    if (nextNameError || nextPriceError) return;

    const selectedCategory = category || "Other";
    const startDate = dayjs();
    const renewalDate = startDate.add(1, frequency === "Yearly" ? "year" : "month");

    onCreate({
      id: `${slugify(trimmedName) || "subscription"}-${Date.now()}`,
      name: trimmedName,
      price: parsedPrice,
      currency: "USD",
      billing: frequency,
      category: selectedCategory,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      icon: icons.wallet,
      color: CATEGORY_COLORS[selectedCategory],
    });

    resetForm();
    onClose();
  };

  const frequencyOptions = useMemo(() => FREQUENCIES, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="modal-overlay"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable onPress={handleClose} className="modal-close" hitSlop={8}>
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="modal-body"
          >
            <View className="auth-form">
              <AuthField
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter subscription name"
                autoCapitalize="words"
                error={nameError}
              />
              <AuthField
                label="Price"
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={priceError}
              />

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {frequencyOptions.map((option) => {
                    const isActive = frequency === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setFrequency(option)}
                        className={clsx("picker-option", isActive && "picker-option-active")}
                      >
                        <Text className={clsx("picker-option-text", isActive && "picker-option-text-active")}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((option) => {
                    const isActive = category === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setCategory(option)}
                        className={clsx("category-chip", isActive && "category-chip-active")}
                      >
                        <Text className={clsx("category-chip-text", isActive && "category-chip-text-active")}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <AuthButton label="Add subscription" onPress={handleSubmit} disabled={!canSubmit} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
