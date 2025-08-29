import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable, Animated, Easing, useWindowDimensions, ImageBackground } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/utils/theme';
import { useNavigation } from '@react-navigation/native';
import { images } from '@/assets/images';

const initialWindow = Dimensions.get('window');

type Slide =
  | { id: string; type: 'image'; title: string; text: string; bg: any }
  | { id: string; type: 'how'; title: string; points: string[] }
  | { id: string; type: 'features'; title: string; points: string[] }
  | { id: string; type: 'mission'; title: string; text: string }
  | { id: string; type: 'vision'; title: string; text: string }
  | { id: string; type: 'privacy'; title: string; text: string };

const slides: Slide[] = [
  { id: 'i1', type: 'image', title: 'Scan your material', text: 'Open the camera and tap the scan button.', bg: images.guidePages.page1 },
  { id: 'i2', type: 'image', title: 'We detect it for you', text: 'See the highlighted material and confidence.', bg: images.guidePages.page2 },
  { id: 'i3', type: 'image', title: 'Material Box', text: 'Save recognized items to your box for later use.', bg: images.guidePages.page3 },
  { id: 'i4', type: 'image', title: 'Project Ideas', text: 'Pick a guide and upcycle step-by-step.', bg: images.guidePages.page5 },
  {
    id: '1',
    type: 'how',
    title: 'How it works',
    points: [
      'Scan a material using your camera or gallery',
      'AI detects the material and confidence',
      'Get disposal tips or upcycling ideas instantly',
    ],
  },
  {
    id: '2',
    type: 'features',
    title: 'What you get',
    points: [
      'Smart detection with bounding box overlay',
      'Disposal guidance tailored to material',
      'Curated upcycling ideas and step-by-step guides',
    ],
  },
  {
    id: '3',
    type: 'mission',
    title: 'Our Mission',
    text:
      'Empower communities to reduce waste by recognizing materials and guiding responsible recycling and creative upcycling.',
  },
  {
    id: '4',
    type: 'vision',
    title: 'Our Vision',
    text:
      'A world where every discarded material finds its next life—making sustainability simple, accessible, and engaging.',
  },
  {
    id: '5',
    type: 'privacy',
    title: 'Privacy & Permissions',
    text:
      'We only use your camera when you scan, and images stay on-device unless you enable cloud detection. You can change backends in Settings at any time.',
  },
];

function RevealText({ text, style, delay = 0, wordDelay = 60 }: { text: string; style: any; delay?: number; wordDelay?: number }) {
  const words = String(text ?? '').split(' ');
  const anims = useRef(words.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    anims.forEach((a) => a.setValue(0));
    Animated.stagger(
      wordDelay,
      anims.map((a, i) =>
        Animated.timing(a, { toValue: 1, duration: 300, delay: delay + i * wordDelay, useNativeDriver: true })
      )
    ).start();
  }, [text]);
  return (
    <Text style={style}>
      {words.map((w, i) => (
        <Animated.Text
          key={`${w}-${i}`}
          style={{ opacity: anims[i], transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </Animated.Text>
      ))}
    </Text>
  );
}

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const listRef = useRef<FlatList<Slide>>(null);
  const { width, height, scale, fontScale } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const bgShift = useRef(new Animated.Value(0)).current;
  const bubble = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(0)).current;
  const featuresIndex = slides.findIndex((s) => s.type === 'features');
  const missionIndex = slides.findIndex((s) => s.type === 'mission');
  const visionIndex = slides.findIndex((s) => s.type === 'vision');
  const featureAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const ideaScale = useRef(new Animated.Value(0)).current;
  const ideaY = useRef(new Animated.Value(12)).current;
  const ideaGlow = useRef(new Animated.Value(0)).current;
  const headNod = useRef(new Animated.Value(0)).current;
  const howAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const titleAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const leafAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const earthSpin = useRef(new Animated.Value(0)).current;
  const starAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 5000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgShift, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bgShift, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubble, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(bubble, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockScale, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(lockScale, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(earthSpin, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    starAnims.forEach((v, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 800 + idx * 200, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 800 + idx * 200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, [rotate, pulse]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 110] });
  const bubbleScale = bubble.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const bgTranslateX = bgShift.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] });
  const lockBounce = lockScale.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const earthSpinDeg = earthSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    if (index === featuresIndex) {
      featureAnims.forEach((v) => v.setValue(0));
      Animated.stagger(
        150,
        featureAnims.map((v) => Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }))
      ).start();

      
      ideaScale.setValue(0);
      ideaY.setValue(12);
      ideaGlow.setValue(0);
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(ideaScale, { toValue: 1.2, duration: 350, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
          Animated.timing(ideaY, { toValue: -12, duration: 350, useNativeDriver: true }),
          Animated.timing(ideaGlow, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
        Animated.timing(ideaScale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      // Subtle glow pulse and head nodding
      Animated.loop(
        Animated.sequence([
          Animated.timing(ideaGlow, { toValue: 0.6, duration: 800, useNativeDriver: true }),
          Animated.timing(ideaGlow, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(headNod, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(headNod, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
    if (index === 0) {
      howAnims.forEach((v) => v.setValue(0));
      Animated.stagger(
        150,
        howAnims.map((v) => Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }))
      ).start();
    }
    if (index === missionIndex) {
      leafAnims.forEach((v, i) => {
        v.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.timing(v, { toValue: 1, duration: 1600 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(v, { toValue: 0, duration: 1600 + i * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        ).start();
      });
    }
    titleAnim.setValue(0);
    bodyAnim.setValue(0);
    Animated.parallel([
      Animated.timing(titleAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(bodyAnim, { toValue: 1, duration: 450, delay: 100, useNativeDriver: true }),
    ]).start();
  }, [index]);

  const next = () => {
    if (index >= slides.length - 1) {
      navigation.navigate('SignUp' as never);
      return;
    }
    const nextIndex = Math.min(index + 1, slides.length - 1);
    listRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
    setIndex(nextIndex);
  };

  const prev = () => {
    if (index <= 0) return;
    const prevIndex = Math.max(index - 1, 0);
    listRef.current?.scrollToOffset({ offset: prevIndex * width, animated: true });
    setIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
        renderItem={({ item }) => {
          if (item.type === 'image') {
            return (
              <View style={[styles.slide, { width }]}> 
                <View style={[styles.phoneFrame, { width: Math.min(width * 0.8, 340), height: Math.min(width * 1.2, 560) }]}>
                  <ImageBackground source={item.bg} style={StyleSheet.absoluteFillObject as any} imageStyle={{ borderRadius: 24 }}>
                    <View style={styles.imageShade} />
                    <View style={styles.imageCaption}> 
                      <RevealText text={item.title} style={styles.imgTitle} delay={50} wordDelay={70} />
                      <RevealText text={item.text} style={styles.imgText} delay={140} wordDelay={30} />
                    </View>
                  </ImageBackground>
                </View>
              </View>
            );
          }
          if (item.type === 'how') {
            return (
              <View style={[styles.slide, { width }]}> 
                <View style={styles.animWrap}>
                  <Animated.View style={[styles.pulse, { transform: [{ scale: pulseScale }] }]} />
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <MaterialCommunityIcons name="recycle" size={88} color="#16a34a" />
                  </Animated.View>
                </View>
                <View style={styles.scanner}>
                  <Animated.View style={[styles.scannerBeam, { transform: [{ translateY: scanY }] }]} />
                </View>
                <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
                  <RevealText text={item.title} style={styles.title} delay={50} wordDelay={70} />
                </Animated.View>
                <View style={styles.points}>
                  {item.points.map((p, i) => (
                    <Animated.View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        alignSelf: 'center',
                        opacity: howAnims[i],
                        transform: [{ translateY: howAnims[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                      }}
                    >
                      <MaterialCommunityIcons name="check-circle" size={18} color="#16a34a" />
                      <RevealText text={p} style={styles.point} delay={80 + i * 80} wordDelay={24} />
                    </Animated.View>
                  ))}
                </View>
              </View>
            );
          }
          if (item.type === 'features') {
            return (
              <View style={[styles.slide, { width }]}> 
                <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
                  <RevealText text={item.title} style={styles.title} delay={50} wordDelay={70} />
                </Animated.View>
                <View style={styles.ideaWrap}>
                  <Animated.View
                    style={{
                      transform: [
                        { rotate: headNod.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) },
                      ],
                    }}
                  >
                    <MaterialCommunityIcons name="account-circle" size={72} color="#111827" />
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.bulbWrap,
                      { opacity: ideaGlow, transform: [{ translateY: ideaY }, { scale: ideaScale }] },
                    ]}
                  >
                    <MaterialCommunityIcons name="lightbulb-on" size={36} color="#f59e0b" />
                  </Animated.View>
                </View>
                <View style={styles.points}>
                  {item.points.map((p, i) => (
                    <Animated.View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        alignSelf: 'center',
                        opacity: featureAnims[i],
                        transform: [{ translateY: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                      }}
                    >
                      <MaterialCommunityIcons name="star-circle" size={18} color="#111827" />
                      <RevealText text={p} style={styles.point} delay={80 + i * 80} wordDelay={24} />
                    </Animated.View>
                  ))}
                </View>
              </View>
            );
          }
          return (
            <View style={[styles.slide, { width }]}> 
              <Animated.View style={[styles.bubbleBg, { transform: [{ translateX: bgTranslateX }, { scale: bubbleScale }] }]} />
              <Animated.View style={{ opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
                <RevealText text={item.title} style={styles.title} delay={50} wordDelay={70} />
              </Animated.View>
              <Animated.View style={{ opacity: bodyAnim, transform: [{ translateY: bodyAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }}>
                <RevealText text={item.text} style={[styles.body, styles.textWrap]} delay={120} wordDelay={35} />
              </Animated.View>
              {item.type === 'mission' ? (
                <View style={styles.missionArt}>
                  {leafAnims.map((v, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.leaf,
                        i === 1 && styles.leafMid,
                        i === 2 && styles.leafRight,
                        {
                          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                          transform: [
                            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, -8] }) },
                            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] }) },
                            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '10deg'] }) },
                          ],
                        },
                      ]}
                    >
                      <MaterialCommunityIcons name="leaf" size={26} color="#16a34a" />
                    </Animated.View>
                  ))}
                </View>
              ) : item.type === 'vision' ? (
                <View style={styles.visionArt}>
                  <Animated.View style={{ transform: [{ rotate: earthSpinDeg }] }}>
                    <MaterialCommunityIcons name="earth" size={78} color="#0ea5e9" />
                  </Animated.View>
                  {starAnims.map((v, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.star,
                        i === 1 && styles.starMid,
                        i === 2 && styles.starRight,
                        { opacity: v },
                      ]}
                    />
                  ))}
                </View>
              ) : item.type === 'privacy' ? (
                <View style={styles.privacyWrap}>
                  <Animated.View style={{ transform: [{ scale: lockBounce }] }}>
                    <MaterialCommunityIcons name="shield-check" size={84} color="#0ea5e9" />
                  </Animated.View>
                </View>
              ) : null}
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <Pressable onPress={prev} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Pressable onPress={next} hitSlop={10}>
          <Ionicons name={index === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={24} color="#111" />
        </Pressable>
      </View>

      <Pressable style={styles.skip} onPress={() => navigation.navigate('SignUp' as never)}>
        <Text style={styles.skipText}>{index === slides.length - 1 ? 'DONE' : 'SKIP'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  mockDevice: {
    width: Math.min(initialWindow.width * 0.5, 360),
    height: Math.min(initialWindow.width * 0.8, 540),
    borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  caption: { marginTop: 16, color: '#111', textAlign: 'center' },
  animWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, width: 140, height: 140 },
  pulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#DCFCE7' },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  body: { color: '#111827', textAlign: 'center', paddingHorizontal: 16, fontSize: 16, lineHeight: 22 },
  textWrap: { maxWidth: 520, alignSelf: 'center' },
  points: { gap: 8, paddingHorizontal: 12, width: '100%', maxWidth: 680 },
  point: { color: '#111827', textAlign: 'left', fontSize: 16, lineHeight: 22, flexShrink: 1 },
  scanner: { width: 200, maxWidth: '80%', height: 140, borderRadius: 16, backgroundColor: 'white', overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  scannerBeam: { position: 'absolute', left: 0, right: 0, height: 10, backgroundColor: 'rgba(22,163,74,0.25)' },
  bubbleBg: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#E0F2FE', opacity: 0.6 },
  privacyWrap: { marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  missionArt: { marginTop: 10, height: 60, alignItems: 'center', justifyContent: 'center' },
  leaf: { position: 'absolute', left: '40%' },
  leafMid: { left: '48%' },
  leafRight: { left: '56%' },
  visionArt: { marginTop: 10, height: 90, alignItems: 'center', justifyContent: 'center' },
  star: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fde68a', left: '35%', top: 10 },
  starMid: { left: '50%', top: 0 },
  starRight: { left: '65%', top: 18 },
  ideaWrap: { marginVertical: 8, alignItems: 'center', justifyContent: 'center' },
  bulbWrap: { position: 'absolute', bottom: 46 },
  phoneFrame: { borderRadius: 24, overflow: 'hidden', borderWidth: 6, borderColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8 },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  imageCaption: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  imgTitle: { color: 'white', fontWeight: '900', fontSize: 20 },
  imgText: { color: 'white', marginTop: 6 },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#111827', width: 18 },
  skip: { position: 'absolute', top: 18, right: 16 },
  skipText: { fontWeight: '700' },
});


