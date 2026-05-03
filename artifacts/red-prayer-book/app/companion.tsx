import { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";

const API_BASE = `${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api`;

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

const SUGGESTIONS = [
  "Teach me the Jesus Prayer",
  "What is the Akathist Hymn?",
  "Help me with evening prayers",
  "Who is St. John Chrysostom?",
  "How do I prepare for Confession?",
  "Guide me through the Trisagion",
];

export default function CompanionScreen() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const streamingIdRef = useRef<string | null>(null);

  const startConversation = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/anthropic/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Spiritual Companion Chat" }),
      });
      if (!res.ok) throw new Error("Failed to start conversation");
      const conv: Conversation = await res.json();
      setConversation(conv);
    } catch {
      Alert.alert("Connection Error", "Could not reach the spiritual companion. Please try again.");
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversation || !text.trim() || loading) return;
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };
      const streamingId = `assistant-${Date.now()}`;
      streamingIdRef.current = streamingId;
      const streamingMsg: Message = {
        id: streamingId,
        role: "assistant",
        content: "",
        streaming: true,
      };
      setMessages((prev) => [...prev, userMsg, streamingMsg]);
      setInput("");
      setLoading(true);
      scrollToEnd();

      try {
        const res = await fetch(
          `${API_BASE}/anthropic/conversations/${conversation.id}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text.trim() }),
          }
        );

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.type === "delta" && typeof payload.text === "string") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: m.content + payload.text }
                      : m
                  )
                );
                scrollToEnd();
              } else if (payload.type === "done") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId ? { ...m, streaming: false } : m
                  )
                );
              }
            } catch {
            }
          }
        }
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? {
                  ...m,
                  content: "Glory to God. I encountered a difficulty — please try again.",
                  streaming: false,
                }
              : m
          )
        );
      } finally {
        setLoading(false);
        streamingIdRef.current = null;
        scrollToEnd();
      }
    },
    [conversation, loading, scrollToEnd]
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={{
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-end",
          marginBottom: spacing.m,
          gap: spacing.s,
          paddingHorizontal: spacing.s,
        }}
      >
        {!isUser && (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: C.byzantineCrimson,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: C.sacredGold,
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons name="cross" size={16} color={C.sacredGold} />
          </View>
        )}
        <View
          style={{
            maxWidth: "78%",
            backgroundColor: isUser ? C.byzantineCrimson : C.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: isUser ? C.sacredGold : C.hairline,
            padding: spacing.m,
          }}
        >
          <Text
            style={{
              color: isUser ? C.sacredGold : C.textPrimary,
              fontFamily: "serif",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {item.content}
            {item.streaming && (
              <Text style={{ color: C.sacredGold }}>▌</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  if (initializing) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.surfaceDeep, alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="cross" size={40} color={C.sacredGold} style={{ marginBottom: spacing.m }} />
        <ActivityIndicator color={C.sacredGold} size="large" />
        <Text style={{ color: C.textMuted, fontFamily: "serif", marginTop: spacing.m }}>
          Preparing your spiritual companion…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          borderBottomWidth: 1,
          borderColor: C.hairline,
          backgroundColor: C.surfaceElevated,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: spacing.m })}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: C.byzantineCrimson,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.sacredGold,
            marginRight: spacing.s,
          }}
        >
          <MaterialCommunityIcons name="cross" size={18} color={C.sacredGold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16 }}>
            Father Seraphim
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>
            Orthodox Spiritual Companion
          </Text>
        </View>
        <MaterialCommunityIcons name="dots-vertical" size={22} color={C.textMuted} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={{ flex: 1 }}>
            {/* Welcome */}
            <View style={{ alignItems: "center", paddingTop: spacing.xxl, paddingHorizontal: spacing.l, paddingBottom: spacing.l }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: C.byzantineCrimson,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: C.sacredGold,
                  marginBottom: spacing.m,
                }}
              >
                <MaterialCommunityIcons name="cross" size={34} color={C.sacredGold} />
              </View>
              <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 22, textAlign: "center", marginBottom: spacing.s }}>
                Glory to God for All Things
              </Text>
              <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 14, textAlign: "center", lineHeight: 22 }}>
                I am Father Seraphim, your Orthodox spiritual companion. Ask me about prayers, the saints, fasting, the sacraments, or anything on your heart.
              </Text>
            </View>

            {/* Suggestion chips */}
            <View style={{ paddingHorizontal: spacing.m, gap: spacing.s }}>
              <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: spacing.xs }}>
                Begin with a question
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                {SUGGESTIONS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => sendMessage(s)}
                    style={({ pressed }) => ({
                      backgroundColor: pressed ? C.byzantineCrimson : C.surfaceElevated,
                      borderWidth: 1,
                      borderColor: C.hairline,
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.m,
                      paddingVertical: 8,
                    })}
                  >
                    <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 13 }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={{ paddingVertical: spacing.m }}
            onContentSizeChange={scrollToEnd}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: spacing.s,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            borderTopWidth: 1,
            borderColor: C.hairline,
            backgroundColor: C.surfaceElevated,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              color: C.textPrimary,
              fontFamily: "serif",
              fontSize: 15,
              lineHeight: 22,
              backgroundColor: C.surface,
              borderRadius: radii.m,
              borderWidth: 1,
              borderColor: C.hairline,
              paddingHorizontal: spacing.m,
              paddingVertical: spacing.s,
              maxHeight: 120,
            }}
            placeholder="Ask Father Seraphim…"
            placeholderTextColor={C.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="default"
            editable={!loading}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                !input.trim() || loading ? C.surface : C.byzantineCrimson,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor:
                !input.trim() || loading ? C.hairline : C.sacredGold,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.sacredGold} />
            ) : (
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={!input.trim() ? C.textMuted : C.sacredGold}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
