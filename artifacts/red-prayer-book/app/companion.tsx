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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ServiceConnect } from "@/components/ServiceConnect";
import { usePalette } from "@/hooks/usePalette";
import { apiBase, probeService, type ServiceState } from "@/lib/service";
import { fonts } from "@/theme/typography";
import { spacing } from "@/theme/spacing";

const API_BASE = apiBase() ?? "";

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
  const C = usePalette();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [service, setService] = useState<ServiceState>(apiBase() ? "checking" : "connect");
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
      setService("connect");
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    if (!apiBase()) {
      setService("connect");
      return;
    }
    probeService().then((next) => {
      if (!cancel) setService(next);
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (service === "ready") {
      setInitializing(true);
      startConversation();
    }
  }, [service, startConversation]);

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
        <View style={{ flex: 1, maxWidth: "100%", borderBottomWidth: 1, borderBottomColor: C.rule, paddingVertical: 12 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 14, lineHeight: 18, color: C.rubric, fontVariant: ["small-caps"], letterSpacing: 0.4 }}>
            {isUser ? "You" : "Companion"}
          </Text>
          <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, marginTop: 4 }}>
            {item.content}
            {item.streaming ? <Text style={{ fontFamily: fonts.regular, color: C.rubric }}> ▌</Text> : null}
          </Text>
        </View>
      </View>
    );
  };

  if (service !== "ready") {
    return <ServiceConnect title="Companion" onBack={() => router.back()} />;
  }

  if (initializing) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.surfaceDeep, alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="cross" size={40} color={C.sacredGold} style={{ marginBottom: spacing.m }} />
        <ActivityIndicator color={C.sacredGold} size="large" />
        <Text style={{ color: C.textMuted, fontFamily: fonts.regular, marginTop: spacing.m }}>
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
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <Text style={{ color: C.ink, fontFamily: fonts.medium, fontSize: 22, lineHeight: 28 }}>
            Companion
          </Text>
          <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 16, lineHeight: 22 }}>
            The service is not available in this build
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={{ flex: 1 }}>
            {/* Welcome */}
            <View style={{ paddingTop: 28, paddingHorizontal: 22, paddingBottom: 12 }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18, lineHeight: 24, textAlign: "center" }}>✠</Text>
              <Text style={{ color: C.ink, fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, textAlign: "center", marginTop: 12 }}>
                Glory to God for all things
              </Text>
              <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, textAlign: "center", marginTop: 10 }}>
                Ask about prayers, the saints, fasting, or the sacraments. The companion needs a service that is not running here.
              </Text>
            </View>
            <View style={{ paddingHorizontal: 22 }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, fontVariant: ["small-caps"], letterSpacing: 0.6, marginBottom: 4 }}>
                Begin with a question
              </Text>
              {SUGGESTIONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => sendMessage(s)}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: C.rule,
                    backgroundColor: pressed ? C.highlight : "transparent",
                  })}
                >
                  <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 18, lineHeight: 26 }}>{s}</Text>
                </Pressable>
              ))}
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
              color: C.ink,
              fontFamily: fonts.regular,
              fontSize: 18,
              lineHeight: 26,
              backgroundColor: "transparent",
              borderBottomWidth: 1,
              borderBottomColor: C.ink2,
              minHeight: 44,
              paddingHorizontal: 4,
              paddingVertical: 8,
              maxHeight: 120,
              ...(Platform.OS === "web" ? ({ outline: "none" } as object) : null),
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
              minWidth: 44,
              minHeight: 44,
              paddingHorizontal: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: !input.trim() || loading ? "transparent" : C.rubric,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.rubric} />
            ) : (
              <Text style={{ color: !input.trim() ? C.ink2 : C.onRubric, fontFamily: fonts.semibold, fontSize: 16 }}>
                Send
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
