import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import HeaderBar from '@/components/HeaderBar';
import { colors } from '@/utils/theme';

const rows = [
  { 
    title: 'How to use the app?', 
    desc: 'Step-by-step guide on scanning materials and getting upcycling suggestions.',
    content: `1. Open the app and tap the "Capture" button
2. Point your camera at recyclable materials
3. Take a photo or select from gallery
4. The app will identify the material type
5. Browse suggested upcycling projects
6. Follow the tutorial videos for DIY instructions
7. Track your materials in the Inventory section`
  },
  { 
    title: 'Understanding Image-based recognition', 
    desc: 'Explanation of how image recognition of materials works.',
    content: `Our AI-powered image recognition system:

• Uses machine learning to identify 14+ material types
• Analyzes shape, texture, and color patterns
• Trained on thousands of recyclable material images
• Provides confidence scores for accuracy
• Works best with clear, well-lit photos
• Supports materials like cardboard, plastic, metal, fabric, and more

Tips for better recognition:
- Ensure good lighting
- Clean the material surface
- Fill the frame with the material
- Avoid cluttered backgrounds`
  },
  { 
    title: 'Terms of Service', 
    desc: 'Rules and conditions users must follow.',
    content: `By using this app, you agree to:

1. Use the app responsibly for recycling purposes
2. Not upload inappropriate or harmful content
3. Respect intellectual property rights
4. Follow local recycling guidelines and laws
5. Not attempt to reverse engineer the app
6. Report bugs or issues through proper channels

The app is provided "as is" without warranties. We reserve the right to update these terms and modify app features as needed.

For questions, contact our support team through the app.`
  },
  { 
    title: 'Privacy Policy', 
    desc: 'How data is collected, stored, and protected.',
    content: `We prioritize your privacy:

Data Collection:
• Photos you upload for material recognition
• Usage analytics to improve the app
• Account information (email, preferences)

Data Usage:
• Material recognition and project suggestions
• App improvement and feature development
• No sharing with third parties without consent

Data Protection:
• Encrypted data transmission
• Secure cloud storage
• Regular security audits
• You can delete your data anytime

Your photos are processed for recognition only and are not stored permanently unless you save them to your inventory.`
  },
];

export default function GuidesScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handlePress = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <HeaderBar title="Guides" />
      <Text style={styles.heading}>Guides</Text>
      {rows.map((r, index) => (
        <Pressable key={r.title} style={styles.row} onPress={() => handlePress(index)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{r.title}</Text>
            <Text style={styles.desc}>{r.desc}</Text>
            {expandedIndex === index && (
              <Text style={styles.content}>{r.content}</Text>
            )}
          </View>
          <Text style={styles.arrow}>
            {expandedIndex === index ? '⌃' : '⌄'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  heading: { fontSize: 24, fontWeight: '800', alignSelf: 'center', marginVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowTitle: { fontWeight: '700' },
  desc: { color: '#6b7280', marginTop: 4 },
  content: { 
    color: '#374151', 
    marginTop: 12, 
    lineHeight: 20, 
    fontSize: 14,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8
  },
  arrow: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8
  }
});


