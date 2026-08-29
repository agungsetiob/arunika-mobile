import React from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { Lightbulb } from "lucide-react-native";

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900 relative">
      <View
        className="absolute h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"
        style={{
          top: "50%",
          left: "50%",
          transform: [{ translateX: -128 }, { translateY: -128 }],
        }}
      />

      <Image
        source={require("../../assets/beraksi-logo.png")}
        className="absolute top-16 w-auto h-12"
        resizeMode="contain"
      />

      <View className="items-center z-10 gap-y-1">
        <View
          className="h-32 w-32 items-center justify-center rounded-full bg-orange-500"
        >
          <Lightbulb color="white" size={64} strokeWidth={2.5} />
        </View>
        <Text className="text-4xl font-extrabold text-white">ARUNIKA</Text>
        <Text className="text-xs font-bold uppercase text-orange-500">
          Smart PJU System
        </Text>
      </View>

      <ActivityIndicator
        size="large"
        color="#f97316"
        className="absolute bottom-20"
      />

      <View className="absolute bottom-10">
        <Text className="text-slate-300 text-xs font-medium">
          Kabupaten Tanah Bumbu
        </Text>
      </View>
    </View>
  );
}
