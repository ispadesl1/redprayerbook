import { View, Text } from 'react-native';
import { colors } from '@/theme/colors';

type Props = {
  index: number;
  side: 'left' | 'right';
};

const PRAYER_TEXTS: Record<number, { title: string; body: string }> = {
  0: {
    title: 'Morning Prayer',
    body: 'O Lord, grant me to greet the coming day in peace. Help me in all things to rely upon Thy holy will. In every hour of the day reveal Thy will to me. Bless my dealings with all who surround me. Teach me to treat all that comes to me throughout the day with peace of soul and with firm conviction that Thy will governs all.',
  },
  1: {
    title: 'Evening Prayer',
    body: 'O Lord our God, in whom we believe and whose name we invoke above every other name: grant us, as we go to our rest, refreshment of body and soul. Keep us from all the fantasies of the Evil One, and from the temptations that assail us.',
  },
  2: {
    title: 'Prayer Before Meals',
    body: 'O Lord Jesus Christ our God, bless us and the food and drink we are about to receive, for Thou art holy, always, now and ever and unto the ages of ages. Amen.',
  },
  3: {
    title: 'Prayer for the Living',
    body: 'O God, our Lord and Savior, remember all those whom we have not remembered out of ignorance, or forgetfulness, or the multitude of names. Thou who knowest each man\'s age and his surname, knowest each one from his mother\'s womb.',
  },
  4: {
    title: 'The Lord\'s Prayer',
    body: 'Our Father, who art in heaven, hallowed be Thy Name. Thy Kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil.',
  },
};

export function StaticPage({ index, side }: Props) {
  const pageNum = index + 1;
  const prayer = PRAYER_TEXTS[index % Object.keys(PRAYER_TEXTS).length];
  const isOdd = index % 2 !== 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isOdd ? '#FDF6EC' : '#F5EBDD',
        borderRightWidth: side === 'left' ? 2 : 0,
        borderLeftWidth: side === 'right' ? 2 : 0,
        borderColor: colors.incenseSmoke,
        padding: 24,
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: 'rgba(212,175,55,0.3)',
          flex: 1,
          padding: 12,
        }}
      >
        <Text
          style={{
            fontSize: 9,
            letterSpacing: 2,
            textAlign: 'center',
            color: colors.incenseSmoke,
            marginBottom: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
          }}
        >
          Red Prayer Book
        </Text>

        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 18,
            color: colors.byzantineCrimson,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          ✟  {prayer?.title ?? `Page ${pageNum}`}  ✟
        </Text>

        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(139,14,26,0.3)',
            marginBottom: 16,
          }}
        />

        <Text
          style={{
            fontFamily: 'serif',
            fontSize: 14,
            color: colors.deepOnyx,
            lineHeight: 22,
            textAlign: 'justify',
          }}
        >
          {prayer?.body ?? ''}
        </Text>
      </View>

      <Text
        style={{
          textAlign: side === 'left' ? 'left' : 'right',
          color: colors.incenseSmoke,
          fontSize: 10,
          marginTop: 8,
        }}
      >
        {pageNum}
      </Text>
    </View>
  );
}
