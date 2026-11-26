export type CanonicalHour = {
  id: string;
  name: string;
  subtitle: string;
  greekName: string;
  timeLabel: string;
  startHour: number;
  endHour: number;
  icon: string;
  accentColor: string;
  verse: string;
  verseRef: string;
  shortPrayer: string;
  fullPrayer: string;
  intention: string;
};

export const CANONICAL_HOURS: CanonicalHour[] = [
  {
    id: "midnight",
    name: "Midnight Office",
    subtitle: "Vigil of the Night",
    greekName: "Μεσονυκτικόν",
    timeLabel: "Midnight — Dawn",
    startHour: 0,
    endHour: 6,
    icon: "weather-night",
    accentColor: "#4A2C4E",
    verse: "At midnight I rise to give thanks to You because of Your righteous judgments.",
    verseRef: "Psalm 118:62",
    shortPrayer: "Behold, the Bridegroom cometh at midnight, and blessed is the servant whom He shall find watching.",
    intention: "Vigil & watchfulness of soul",
    fullPrayer: `O Lord, our God, Who hast no evening, no night, no sleep, and no slumber — Who art the Keeper of Israel and Watcher over all creation — we rise in the stillness of night to offer Thee the sacrifice of praise.

At this midnight hour, while the world slumbers, grant us watchful hearts, that we may not be found sleeping when the Bridegroom cometh. Purify our souls of the darkness of sin; illumine us with the uncreated light of Thy countenance.

We confess that in the day just past we have sinned against Thee in thought, word, and deed. Yet Thy mercies are new every morning. In this sacred silence, before the rising of the sun, hear our supplication.

O All-Holy Trinity — Father, Son, and Holy Spirit — receive this midnight prayer as incense rising before Thy throne. Keep us, Thy servants, through the remaining hours of night, and grant us to behold the light of a new day in Thy service.

Glory to Thee, O Lord, glory to Thee.

Amen.`,
  },
  {
    id: "matins",
    name: "Matins",
    subtitle: "Morning Prayer of Praise",
    greekName: "Ὄρθρος",
    timeLabel: "Dawn — 9 AM",
    startHour: 6,
    endHour: 9,
    icon: "weather-sunset-up",
    accentColor: "#C97A24",
    verse: "In the morning Thou hearest my voice; in the morning I plead my case to Thee, and I watch.",
    verseRef: "Psalm 5:3",
    shortPrayer: "Glory to God in the highest, and on earth peace, goodwill toward men.",
    intention: "Praise & new beginnings",
    fullPrayer: `O Lord, our God, Who hast brought us from the depths of night unto the light of a new morning — glory to Thee! Thou Who art the True Light, the Sun of Righteousness, Who shinest upon all creation with the rays of Thy divine mercy.

With the holy angels and all the heavenly hosts, we lift our voices in the dawn hymn: Holy, Holy, Holy, Lord of Sabaoth! Heaven and earth are full of Thy glory!

Open our lips, O Lord, that our mouths may show forth Thy praise. Accept the first-fruits of this day as an offering upon Thine altar. Let no word pass our lips today that is unworthy of Thy presence; let no thought arise in our hearts that is far from Thee.

As the sun rises to give light to the earth, so let the Sun of Righteousness arise upon us with healing in His wings. Drive away the darkness of all passion and every temptation that seeks to obscure Thy image within us.

We praise Thee, we bless Thee, we worship Thee, and we glorify Thee — Father, Son, and Holy Spirit — now and ever and unto the ages of ages.

Amen.`,
  },
  {
    id: "first",
    name: "First Hour",
    subtitle: "Prayer of the Morning Light",
    greekName: "Πρώτη Ὥρα",
    timeLabel: "9 AM — 12 PM",
    startHour: 9,
    endHour: 12,
    icon: "white-balance-sunny",
    accentColor: "#D4AF37",
    verse: "Let the words of my mouth and the meditation of my heart be acceptable in Thy sight, O Lord, my strength and my Redeemer.",
    verseRef: "Psalm 18:14",
    shortPrayer: "In the morning, O Lord, hear my voice. In the morning I will stand before Thee and keep watch.",
    intention: "Dedicating the day's work to God",
    fullPrayer: `O Christ our God, Who at this first hour didst appear to Thy disciples after Thy holy Resurrection — to Thee, the Eternal Light, we now commit this day and all its labor.

Thou Who art the Way, the Truth, and the Life: be Thou the Way of all our steps today, that we stray not into foolishness or sin. Be Thou the Truth in all our words, that we speak no falsehood nor idle vanity. Be Thou the Life of all our deeds, that nothing we do today be lifeless and fruitless before Thee.

Grant wisdom to our minds, strength to our bodies, and charity to our hearts. Let us not be conformed to the spirit of this age, but transformed by the renewal of our minds, that we may prove what is that good and acceptable and perfect will of God.

Preserve us from the temptations of this day — from pride, from anger, from sloth, from the distraction of worldly care. Let us remember, amid all our busyness, that one thing is needful: to sit at Thy feet and hear Thy word.

To Thee, O Holy Trinity, be all glory, honor, and worship — now and ever and unto the ages of ages.

Amen.`,
  },
  {
    id: "third",
    name: "Third Hour",
    subtitle: "Hour of the Holy Spirit",
    greekName: "Τρίτη Ὥρα",
    timeLabel: "12 PM — 3 PM",
    startHour: 12,
    endHour: 15,
    icon: "fire",
    accentColor: "#E39C3D",
    verse: "Create in me a clean heart, O God, and renew a right spirit within me.",
    verseRef: "Psalm 50:10",
    shortPrayer: "O Lord, Who at the Third Hour didst send down the All-Holy Spirit upon Thine apostles — take Him not from us, but renew Him in us.",
    intention: "Invoking the Holy Spirit's presence",
    fullPrayer: `O Lord Jesus Christ, our God — Who at this Third Hour didst send down from the Father the All-Holy, Life-creating Spirit upon Thine holy Apostles in the upper room in Jerusalem — we, unworthy as we are, implore Thee: send down the same Spirit upon us.

Come, O Comforter, O Spirit of Truth, and take up Thine abode within us. Cleanse us from every defilement of flesh and spirit. Soften the hardness of our hearts. Pierce through the fog of our self-will and make us docile instruments of Thy love.

Where we are cold, warm us with the fire of Thy divine love. Where we are proud, humble us with the memory of our creatureliness. Where we are in doubt, enlighten us. Where we have sinned, grant us compunction and true repentance.

O Holy Spirit, Breath of God, Treasury of good things and Giver of life — dwell in us, move us, pray in us, for we know not how to pray as we ought. Make intercession for us with groanings that cannot be uttered.

To the Father, and to the Son, and to the Holy Spirit — one God in Holy Trinity — be glory and thanksgiving now and ever and unto the ages of ages.

Amen.`,
  },
  {
    id: "sixth",
    name: "Sixth Hour",
    subtitle: "Hour of the Holy Cross",
    greekName: "Ἕκτη Ὥρα",
    timeLabel: "3 PM — 6 PM",
    startHour: 15,
    endHour: 18,
    icon: "cross",
    accentColor: "#8B0E1A",
    verse: "He was wounded for our transgressions; He was bruised for our iniquities. The chastisement of our peace was upon Him.",
    verseRef: "Isaiah 53:5",
    shortPrayer: "O Lord Jesus Christ, crucified for us at the sixth hour — bow down Thine ear and save us.",
    intention: "The Crucifixion & redemptive suffering",
    fullPrayer: `O Lord Jesus Christ, our God — Who at this Sixth Hour, for our salvation, didst willingly ascend the holy and life-giving Cross — we bow before the immensity of Thy love.

At this hour, darkness covered the earth. The sun hid its face before the suffering of its Creator. The rocks were rent; the veil of the temple was torn in two. And Thou, O Lord of glory, hung upon the wood of the Cross for us and for our salvation.

We stand before Thy Cross as the holy myrrh-bearing women stood — with sorrow and with awe, with love and with gratitude. For in Thy death Thou hast trampled death; in Thy suffering Thou hast healed our wounds; in Thy condemnation Thou hast set us free.

Grant us, O Lord, to take up our own cross daily and follow Thee — to deny ourselves, to die to our passions, to live not for ourselves but for Thee Who died and rose again for our sake.

We venerate Thy most pure Passion, O Christ. We glorify Thy Resurrection. And we ask for the mercy of Thy Judgment.

Amen.`,
  },
  {
    id: "ninth",
    name: "Ninth Hour",
    subtitle: "Hour of Christ's Repose",
    greekName: "Ἐνάτη Ὥρα",
    timeLabel: "6 PM — 9 PM",
    startHour: 18,
    endHour: 21,
    icon: "weather-sunset",
    accentColor: "#276A3D",
    verse: "Father, into Thy hands I commend my spirit.",
    verseRef: "Luke 23:46",
    shortPrayer: "O Thou Who at the Ninth Hour didst taste death in the flesh for our sake — mortify the passions of our flesh and save us.",
    intention: "Evening surrender & committing the day to God",
    fullPrayer: `O Lord Jesus Christ, our God — Who at this Ninth Hour, having accomplished all things that were written of Thee, didst bow Thy head upon the Cross and commit Thy spirit into the hands of God Thy Father — into those same hands we now commend ourselves and all that belongs to us.

The day draws toward its close. We stand at evening's gate, holding before Thee the deeds and words and thoughts of this day — many of which fill us with shame and sorrow. Yet we do not despair, for we know that Thy mercy is greater than all our sins.

Accept our evening offering, O Lord. Receive us not according to our deeds, but according to Thine infinite compassion. As the good thief at Thy right hand received paradise from Thy lips at this very hour — so say to our hearts: "Today thou shalt be with Me."

Grant us peaceful evening hours, free from anxiety and vain thought. Strengthen us to fulfill what remains of this day in godliness. And when at last we lay down to sleep, let us rest in Thy peace.

Into Thy hands, O Lord, we commend our spirit.

Amen.`,
  },
  {
    id: "vespers",
    name: "Vespers",
    subtitle: "Evening Prayer of Thanksgiving",
    greekName: "Ἑσπερινός",
    timeLabel: "9 PM — 12 AM",
    startHour: 21,
    endHour: 24,
    icon: "candle",
    accentColor: "#4A2C4E",
    verse: "Let my prayer arise as incense before Thee; the lifting up of my hands as the evening sacrifice.",
    verseRef: "Psalm 140:2",
    shortPrayer: "O Gladsome Light of the holy glory of the immortal, heavenly, holy blessed Father — O Jesus Christ!",
    intention: "Gratitude for the day & evening rest",
    fullPrayer: `O Gladsome Light of the holy glory of the immortal Father — heavenly, holy, blessed Jesus Christ! Now that we have come to the setting of the sun, and behold the light of evening, we praise God: Father, Son, and Holy Spirit.

For it is meet at all times to worship Thee with voices of praise, O Son of God and Giver of Life. Therefore all the world doth glorify Thee.

O Lord, look down from heaven and see, for we have become as flowers of the field — blooming for a season and then fading. Let the evening of this day find us in Thy peace. As the earth receives the sun's last rays, so receive our evening prayer as a fragrant offering.

We give Thee thanks for all the gifts of this day: for the breath of life, for bread, for those who love us, for the beauty of Thy creation, and above all for the salvation wrought in Christ our Lord.

Forgive us every sin of this day — known and unknown, whether of our own will or by weakness. Refresh us with Thy peace as we pass from this day's labors into the rest of the night.

O Lord, keep us this evening without sin. Blessed art Thou, O Lord God of our fathers, and praised and glorified is Thy name unto the ages.

Amen.`,
  },
];

export function getCurrentHour(): CanonicalHour {
  const hour = new Date().getHours();
  const found = CANONICAL_HOURS.find(
    (h) => hour >= h.startHour && hour < h.endHour
  );
  return found ?? CANONICAL_HOURS[CANONICAL_HOURS.length - 1];
}

export function getNextHour(current: CanonicalHour): CanonicalHour {
  const idx = CANONICAL_HOURS.findIndex((h) => h.id === current.id);
  return CANONICAL_HOURS[(idx + 1) % CANONICAL_HOURS.length];
}

export function getPrevHour(current: CanonicalHour): CanonicalHour {
  const idx = CANONICAL_HOURS.findIndex((h) => h.id === current.id);
  return CANONICAL_HOURS[(idx - 1 + CANONICAL_HOURS.length) % CANONICAL_HOURS.length];
}

export function formatTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
