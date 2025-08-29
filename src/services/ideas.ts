export type Idea = {
  id: string;
  title: string;
  description: string;
  material: string;
  image?: string;
  steps?: string[];
  video?: string;
};

const allIdeas: Idea[] = [
  {
    id: '1',
    title: 'Planter from Plastic Bottle',
    material: 'Plastic',
    description: 'Cut and paint a plastic bottle to create a small planter.',
    image: 'local:project:WDI1',
    steps: [
      'Cut the bottle and smooth edges',
      'Paint and let dry',
      'Fill with soil and plant',
    ],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '2',
    title: 'Mosaic Lamp from Glass Jar',
    material: 'Glass',
    description: 'Decorate a jar to make a bedside lamp with LED lights.',
    image: 'local:project:WPI2',
    steps: [
      'Clean the jar',
      'Apply mosaic tiles',
      'Insert LED light',
    ],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '3',
    title: 'Desk Organizer from Cardboard',
    material: 'Cardboard',
    description: 'Use cardboard to craft compartments for stationery.',
    image: 'local:project:WPI3',
    steps: [
      'Cut cardboard pieces',
      'Glue to form boxes',
      'Decorate the exterior',
    ],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '4',
    title: 'Wind Chime from Aluminum Cans',
    material: 'Metal',
    description: 'Cut cans into shapes and hang to create a wind chime.',
    image: 'local:project:WPI4',
    steps: ['Cut and sand edges', 'Punch holes', 'Hang with thread'],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '5',
    title: 'Paper Beads Jewelry',
    material: 'Paper',
    description: 'Roll paper strips into beads for bracelets.',
    image: 'local:project:WPI5',
    steps: ['Cut strips', 'Roll and glue', 'String into bracelet'],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export function getIdeasForMaterial(material: string): Idea[] {
  if (material === 'all') return allIdeas;
  return allIdeas.filter((i) => i.material.toLowerCase() === material.toLowerCase());
}


