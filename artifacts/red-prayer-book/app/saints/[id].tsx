import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ManuscriptScroll, Ornament, ReadingText, SmallCaps, StackBar } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";

const NICHOLAS = {
  name: "Saint Nicholas the Wonderworker",
  feast: "December 6 / 19",
  life: `Saint Nicholas was born in the city of Patara in the province of Lycia in Asia Minor. His wealthy parents, who raised him in piety and virtue, reposed after a short illness, leaving their child in the hands of God.

The uncle of Saint Nicholas, Bishop Nicholas of Patara, seeing that his nephew was given over to continual prayer and study of the Holy Scripture, tonsured him a reader, and then ordained him a presbyter.

Saint Nicholas performed many miracles throughout his life, providing for the poor in secret, defending the innocent, and calming storms at sea. He reposed peacefully in old age, and his relics were found to be incorrupt.`,
};

export default function SaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const C = usePalette();
  const nicholas = (id ?? "nicholas") === "nicholas";

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="Lives of the Saints" onBack={() => router.back()} />
      <ManuscriptScroll>
        {nicholas ? (
          <>
            <SmallCaps>From the book</SmallCaps>
            <Text style={{ fontFamily: fonts.medium, fontSize: 32, lineHeight: 38, color: C.ink, marginTop: 8 }}>
              {NICHOLAS.name}
            </Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, marginTop: 6 }}>
              Feast {NICHOLAS.feast}
            </Text>
            <Ornament />
            <ReadingText text={NICHOLAS.life} size={20} dropCap />
          </>
        ) : (
          <>
            <Text style={{ fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, color: C.ink }}>
              This life is not in the book
            </Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, marginTop: 12 }}>
              The prayer book includes a life of Saint Nicholas. Other commemorations are listed on the calendar, from orthocal.info, and are not given a biography here.
            </Text>
          </>
        )}
      </ManuscriptScroll>
    </View>
  );
}
