import { View } from "react-native";
import { router } from "expo-router";
import { BookView } from "@/components/book/BookView";
import { StackBar } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";

export default function BookScreen() {
  const C = usePalette();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="The printed book" onBack={() => router.back()} />
      <BookView />
    </View>
  );
}
