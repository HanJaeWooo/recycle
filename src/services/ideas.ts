export type Idea = {
  id: string;
  title: string;
  description: string;
  material: string;
  image?: string;
  steps?: string[];
  video?: string;
  youtubeQuery?: string;
};

// All 26 video tutorials that have actual video files in the repository
const allIdeas: Idea[] = [
  // Bottle Caps (2 videos)
  {
    id: 'bottle-caps-1',
    title: 'Cellphone Stand made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Create a functional cellphone stand using recycled bottle caps.',
    image: 'local:video:bottle-caps-cellphone-stand',
    steps: ['Clean and dry bottle caps', 'Stack and glue caps in a stand formation', 'Let dry completely', 'Place phone to test stability'],
  },
  {
    id: 'bottle-caps-2',
    title: 'Coaster made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Make decorative coasters from colorful bottle caps.',
    image: 'local:video:bottle-caps-coaster',
    steps: ['Arrange colorful caps in circular coaster pattern', 'Apply strong adhesive to bond caps together', 'Cut and attach felt backing for protection', 'Allow to cure before using'],
  },
  
  // Cardboard (2 videos)
  {
    id: 'cardboard-1',
    title: 'Cat Scratcher made from Cardboard',
    material: 'Cardboard',
    description: 'Build a cat scratcher using recycled cardboard boxes.',
    image: 'local:video:cardboard-cat-scratcher',
    steps: ['Cut cardboard boxes into uniform strips', 'Roll strips tightly and glue edges', 'Stack rolled pieces in a frame', 'Secure and let your cat enjoy'],
  },
  {
    id: 'cardboard-2',
    title: 'Clothes Folder made from Cardboard',
    material: 'Cardboard',
    description: 'Create a clothes folding board from cardboard.',
    image: 'local:video:cardboard-clothes-folder',
    steps: ['Measure and cut cardboard into folding template', 'Create hinges using strong tape', 'Smooth all edges to prevent snags', 'Test with folding a shirt'],
  },
  
  // Chiffon (2 videos)
  {
    id: 'chiffon-1',
    title: 'Ribbon Hair Tie made from Chiffon',
    material: 'Chiffon',
    description: 'Make elegant hair ties using chiffon fabric ribbons.',
    image: 'local:video:chiffon-hair-tie',
    steps: ['Cut chiffon fabric into long strips', 'Loop through elastic hair tie', 'Create decorative bow or knot', 'Trim ends neatly'],
  },
  {
    id: 'chiffon-2',
    title: 'Wallet made from Chiffon',
    material: 'Chiffon',
    description: 'Sew a delicate wallet using chiffon fabric.',
    image: 'local:video:chiffon-wallet',
    steps: ['Cut chiffon to wallet dimensions', 'Sew compartments for cards and cash', 'Attach snap or button closure', 'Add decorative elements if desired'],
  },
  
  // Copper (2 videos)
  {
    id: 'copper-1',
    title: 'Rings made from Copper coil',
    material: 'Coppers',
    description: 'Craft decorative rings from copper wire coils.',
    image: 'local:video:copper-rings',
    steps: ['Cut copper wire to ring size', 'Wrap around mandrel to form band', 'Create decorative coil pattern', 'Polish with cloth until shiny'],
  },
  {
    id: 'copper-2',
    title: 'Tree made from Copper',
    material: 'Coppers',
    description: 'Create a decorative copper wire tree sculpture.',
    image: 'local:video:copper-tree',
    steps: ['Twist copper wires to form tree trunk', 'Branch out wires for limbs', 'Coil wire tips for leaf details', 'Mount on wooden base'],
  },
  
  // Corduroy (2 videos)
  {
    id: 'corduroy-1',
    title: 'Bookmark made from Corduroy',
    material: 'Corduroy',
    description: 'Sew simple bookmarks from corduroy fabric.',
    image: 'local:video:corduroy-bookmark',
    steps: ['Cut corduroy into bookmark rectangles', 'Fold and sew edges neatly', 'Attach ribbon to top for easy pulling', 'Press flat and trim threads'],
  },
  {
    id: 'corduroy-2',
    title: 'Square bookmark made from Corduroy',
    material: 'Corduroy',
    description: 'Make square-shaped bookmarks with corduroy.',
    image: 'local:video:corduroy-square-bookmark',
    steps: ['Cut corduroy into square shapes', 'Layer and sew pieces together', 'Add decorative embroidery or stitching', 'Press and finish edges'],
  },
  
  // Cotton (2 videos)
  {
    id: 'cotton-1',
    title: 'Eye Glass pouch made from Cotton',
    material: 'Cotton',
    description: 'Sew a protective eyeglass pouch from cotton fabric.',
    image: 'local:video:cotton-eyeglass-pouch',
    steps: ['Cut cotton fabric to pouch dimensions', 'Sew three sides leaving opening', 'Add soft fleece lining inside', 'Sew opening closed with button clasp'],
  },
  {
    id: 'cotton-2',
    title: 'Scissor Pouch made from Cotton',
    material: 'Cotton',
    description: 'Create a scissor holder pouch using cotton fabric.',
    image: 'local:video:cotton-scissor-pouch',
    steps: ['Measure scissors for proper fit', 'Cut cotton and sew pouch shape', 'Add velcro or button closure', 'Reinforce stress points with stitching'],
  },
  
  // Hangers (2 videos)
  {
    id: 'hanger-1',
    title: 'Book Holder made from Hanger',
    material: 'Hangers',
    description: 'Repurpose wire hangers into a book holder stand.',
    image: 'local:video:hanger-book-holder',
    steps: ['Bend wire hanger into book holder shape', 'Create slanted rest for book pages', 'Form stable base to prevent tipping', 'Add padding to protect book covers'],
  },
  {
    id: 'hanger-2',
    title: 'Shoe Organizer made from Hanger',
    material: 'Hangers',
    description: 'Transform hangers into a shoe organization system.',
    image: 'local:video:hanger-shoe-organizer',
    steps: ['Shape each hanger for shoe placement', 'Connect multiple hangers with wire', 'Mount securely on door or wall', 'Test with shoes to ensure stability'],
  },
  
  // Metal Cans (2 videos)
  {
    id: 'metal-can-1',
    title: 'Candle Holder made from Metal Can',
    material: 'Metal cans',
    description: 'Create decorative candle holders from recycled metal cans.',
    image: 'local:video:metal-can-candle-holder',
    steps: ['Clean can and remove all labels', 'Use hammer and nail to punch decorative pattern', 'Place candle inside and light safely', 'Display as ambient lighting'],
  },
  {
    id: 'metal-can-2',
    title: 'Mini stove made from Metal Can',
    material: 'Metal cans',
    description: 'Build a small camping stove from a metal can.',
    image: 'local:video:metal-can-mini-stove',
    steps: ['Cut ventilation holes near bottom', 'Create fuel chamber in center', 'Add wire or cut tabs for pot stand', 'Test with small fuel source outdoors'],
  },
  
  // Plastic Bottles (2 videos)
  {
    id: 'plastic-bottle-1',
    title: 'Flower made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Craft colorful flowers from plastic bottle material.',
    image: 'local:video:plastic-bottle-flower',
    steps: ['Cut plastic bottle into petal shapes', 'Gently heat edges to curve petals', 'Paint petals in bright colors', 'Assemble and glue petals around center'],
  },
  {
    id: 'plastic-bottle-2',
    title: 'PAROL made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Make a traditional Filipino parol lantern from plastic bottles.',
    image: 'local:video:plastic-bottle-parol',
    steps: ['Cut bottle into star-shaped panels', 'Create bamboo or wire frame', 'Attach panels to frame', 'Add LED lights inside for illumination'],
  },
  
  // Cups (2 videos)
  {
    id: 'plastic-cup-1',
    title: 'Mini Basket made from Plastic Cup',
    material: 'Cups',
    description: 'Transform plastic cups into small storage baskets.',
    image: 'local:video:plastic-cup-mini-basket',
    steps: ['Cut plastic cup into strips keeping base intact', 'Weave strips into basket pattern', 'Attach decorative handle', 'Use for small storage'],
  },
  {
    id: 'plastic-cup-2',
    title: 'Mini dustbin made from Plastic Cup',
    material: 'Cups',
    description: 'Create miniature desk dustbins from plastic cups.',
    image: 'local:video:plastic-cup-mini-dustbin',
    steps: ['Clean and dry plastic cup', 'Decorate exterior with paint or washi tape', 'Add weight or non-slip base', 'Use as desk waste bin'],
  },
  
  // Utensils (2 videos)
  {
    id: 'utensils-1',
    title: 'Flower Vase made from Utensils',
    material: 'Utensils',
    description: 'Arrange old utensils into a unique flower vase.',
    image: 'local:video:utensils-flower-vase',
    steps: ['Clean vintage utensils thoroughly', 'Arrange forks and spoons around vase', 'Secure with strong glue or wire', 'Fill with flowers and display'],
  },
  {
    id: 'utensils-2',
    title: 'Wall Decor made from Utensils',
    material: 'Utensils',
    description: 'Create artistic wall decorations using vintage utensils.',
    image: 'local:video:utensils-wall-decor',
    steps: ['Design pattern with old utensils', 'Arrange on wooden backing board', 'Glue or wire securely in place', 'Add hanging hardware to back'],
  },
  
  // Wood (2 videos)
  {
    id: 'wood-1',
    title: 'Book Shelf made from Wood',
    material: 'Woods',
    description: 'Build a simple bookshelf from reclaimed wood.',
    image: 'local:video:wood-book-shelf',
    steps: ['Measure and cut wood planks to size', 'Sand all surfaces smooth', 'Assemble with screws or nails', 'Apply wood stain or paint finish'],
  },
  {
    id: 'wood-2',
    title: 'Wall Mounted Organizer made from Wood',
    material: 'Woods',
    description: 'Create a wall-mounted storage organizer from wood.',
    image: 'local:video:wood-wall-organizer',
    steps: ['Sketch organizer design with hooks and shelves', 'Cut wood pieces to dimensions', 'Assemble and sand smooth', 'Mount on wall with brackets'],
  },
  
  // Denim (2 videos)
  {
    id: 'denim-1',
    title: 'Pocket purses made from Denim',
    material: 'Denim',
    description: 'Sew small purses using denim jean pockets.',
    image: 'local:video:denim-pocket-purses',
    steps: ['Cut pockets from old jeans', 'Sew zipper across top opening', 'Attach chain or fabric strap', 'Add decorative patches if desired'],
  },
  {
    id: 'denim-2',
    title: 'Pot holder made from Denim',
    material: 'Denim',
    description: 'Make heat-resistant pot holders from denim layers.',
    image: 'local:video:denim-pot-holder',
    steps: ['Cut multiple layers of denim squares', 'Layer with heat-resistant batting between', 'Sew around edges and quilt pattern', 'Test with hot pot before use'],
  },
  
  // Additional Metal Can Projects (YouTube integrated)
  {
    id: 'metal-can-3',
    title: 'Pen Holder made from Metal Can',
    material: 'Metal cans',
    description: 'Create stylish desk organizers from metal cans.',
    steps: ['Clean and remove labels', 'Paint or wrap with decorative paper', 'Add felt bottom', 'Organize pens and pencils'],
    youtubeQuery: 'Pen Holder made from Metal Can',
  },
  {
    id: 'metal-can-4',
    title: 'Planter made from Metal Can',
    material: 'Metal cans',
    description: 'Transform cans into rustic plant pots.',
    steps: ['Drill drainage holes', 'Paint exterior', 'Add soil and plants', 'Display indoors or outdoors'],
    youtubeQuery: 'Planter made from Metal Can',
  },
  {
    id: 'metal-can-5',
    title: 'Wind Chimes made from Metal Can',
    material: 'Metal cans',
    description: 'Create melodious wind chimes from metal cans.',
    steps: ['Cut cans into different sizes', 'Punch holes for hanging', 'String together', 'Add striker'],
    youtubeQuery: 'Wind Chimes made from Metal Can',
  },
  {
    id: 'metal-can-6',
    title: 'Lantern made from Metal Can',
    material: 'Metal cans',
    description: 'Make decorative lanterns with punched patterns.',
    steps: ['Fill can with water and freeze', 'Punch decorative holes', 'Add candle or LED light', 'Hang or display'],
    youtubeQuery: 'Lantern made from Metal Can',
  },
  {
    id: 'metal-can-7',
    title: 'Storage Container made from Metal Can',
    material: 'Metal cans',
    description: 'Organize kitchen or craft supplies in decorated cans.',
    steps: ['Clean thoroughly', 'Decorate with paint or fabric', 'Label contents', 'Stack or arrange on shelf'],
    youtubeQuery: 'Storage Container made from Metal Can',
  },
  {
    id: 'metal-can-8',
    title: 'Bird Bath made from Metal Can',
    material: 'Metal cans',
    description: 'Create a simple bird bath for your garden.',
    steps: ['Use large can or multiple cans', 'Create stable base', 'Add water dish', 'Place in garden'],
    youtubeQuery: 'Bird Bath made from Metal Can',
  },
  
  // Additional Cardboard Projects (YouTube integrated)
  {
    id: 'cardboard-3',
    title: 'Drawer Organizer made from Cardboard',
    material: 'Cardboard',
    description: 'Create custom drawer dividers from cardboard.',
    steps: ['Measure drawer dimensions', 'Cut cardboard pieces', 'Create compartments', 'Arrange in drawer'],
    youtubeQuery: 'Drawer Organizer made from Cardboard',
  },
  {
    id: 'cardboard-4',
    title: 'Playhouse made from Cardboard',
    material: 'Cardboard',
    description: 'Build a fun playhouse for kids using large cardboard boxes.',
    steps: ['Connect large boxes', 'Cut windows and doors', 'Paint and decorate', 'Add furniture'],
    youtubeQuery: 'Playhouse made from Cardboard',
  },
  {
    id: 'cardboard-5',
    title: 'Laptop Stand made from Cardboard',
    material: 'Cardboard',
    description: 'Create an ergonomic laptop stand.',
    steps: ['Cut cardboard to shape', 'Fold into stand design', 'Reinforce with glue', 'Test stability'],
    youtubeQuery: 'Laptop Stand made from Cardboard',
  },
  {
    id: 'cardboard-6',
    title: 'Photo Frame made from Cardboard',
    material: 'Cardboard',
    description: 'Make decorative photo frames from cardboard.',
    steps: ['Cut frame shape', 'Create backing and stand', 'Decorate with paint or paper', 'Insert photo'],
    youtubeQuery: 'Photo Frame made from Cardboard',
  },
  {
    id: 'cardboard-7',
    title: 'Shoe Rack made from Cardboard',
    material: 'Cardboard',
    description: 'Organize shoes with a cardboard shoe rack.',
    steps: ['Cut cardboard pieces', 'Create shelf layers', 'Assemble and glue', 'Arrange shoes'],
    youtubeQuery: 'Shoe Rack made from Cardboard',
  },
  {
    id: 'cardboard-8',
    title: 'Magazine Holder made from Cardboard',
    material: 'Cardboard',
    description: 'Create desktop magazine or file holders.',
    steps: ['Cut cardboard to size', 'Fold into holder shape', 'Decorate exterior', 'Store magazines'],
    youtubeQuery: 'Magazine Holder made from Cardboard',
  },
  {
    id: 'cardboard-9',
    title: 'Wall Art made from Cardboard',
    material: 'Cardboard',
    description: 'Create 3D wall art from layered cardboard.',
    steps: ['Cut cardboard shapes', 'Layer for 3D effect', 'Paint or color', 'Mount on wall'],
    youtubeQuery: 'Wall Art made from Cardboard',
  },
  {
    id: 'cardboard-10',
    title: 'Gift Box made from Cardboard',
    material: 'Cardboard',
    description: 'Make custom gift boxes for any occasion.',
    steps: ['Cut box template', 'Fold and glue edges', 'Decorate exterior', 'Add ribbon or bow'],
    youtubeQuery: 'Gift Box made from Cardboard',
  },
  
  // Additional Wood Projects (YouTube integrated)
  {
    id: 'wood-3',
    title: 'Coat Rack made from Wood',
    material: 'Woods',
    description: 'Build a rustic coat rack from reclaimed wood.',
    steps: ['Cut wood to length', 'Attach hooks or pegs', 'Sand and finish', 'Mount on wall'],
    youtubeQuery: 'Coat Rack made from Wood',
  },
  {
    id: 'wood-4',
    title: 'Picture Frame made from Wood',
    material: 'Woods',
    description: 'Craft custom wooden picture frames.',
    steps: ['Cut wood strips', 'Miter corners', 'Assemble frame', 'Add glass and backing'],
    youtubeQuery: 'Picture Frame made from Wood',
  },
  {
    id: 'wood-5',
    title: 'Serving Tray made from Wood',
    material: 'Woods',
    description: 'Create decorative serving trays from wood.',
    steps: ['Cut wood planks', 'Assemble base', 'Add handles', 'Sand and seal'],
    youtubeQuery: 'Serving Tray made from Wood',
  },
  {
    id: 'wood-6',
    title: 'Plant Stand made from Wood',
    material: 'Woods',
    description: 'Build tiered plant stands for your garden.',
    steps: ['Cut wood pieces', 'Create tier structure', 'Assemble stand', 'Weatherproof finish'],
    youtubeQuery: 'Plant Stand made from Wood',
  },
  {
    id: 'wood-7',
    title: 'Key Holder made from Wood',
    material: 'Woods',
    description: 'Make wall-mounted key organizers.',
    steps: ['Cut small wood board', 'Add hooks', 'Decorate or stain', 'Mount near door'],
    youtubeQuery: 'Key Holder made from Wood',
  },
  {
    id: 'wood-8',
    title: 'Cutting Board made from Wood',
    material: 'Woods',
    description: 'Create kitchen cutting boards from hardwood.',
    steps: ['Cut wood to size', 'Sand smooth', 'Apply food-safe oil', 'Season before use'],
    youtubeQuery: 'Cutting Board made from Wood',
  },
  {
    id: 'wood-9',
    title: 'Jewelry Box made from Wood',
    material: 'Woods',
    description: 'Build small jewelry storage boxes.',
    steps: ['Cut box pieces', 'Assemble with glue', 'Add compartments', 'Finish and line interior'],
    youtubeQuery: 'Jewelry Box made from Wood',
  },
  {
    id: 'wood-10',
    title: 'Pencil Holder made from Wood',
    material: 'Woods',
    description: 'Craft desk pencil holders from wood scraps.',
    steps: ['Cut wood block', 'Drill holes for pens', 'Sand edges', 'Stain or paint'],
    youtubeQuery: 'Pencil Holder made from Wood',
  },
  
  // Additional Hangers Projects (YouTube integrated)
  {
    id: 'hanger-3',
    title: 'Wreath made from Hangers',
    material: 'Hangers',
    description: 'Create decorative wreaths using wire hangers.',
    steps: ['Bend hangers into circle', 'Wrap with ribbon or fabric', 'Add decorations', 'Hang on door'],
    youtubeQuery: 'Wreath made from Hangers',
  },
  {
    id: 'hanger-4',
    title: 'Towel Rack made from Hangers',
    material: 'Hangers',
    description: 'Make bathroom towel racks from hangers.',
    steps: ['Straighten hanger wire', 'Create rack shape', 'Mount on wall', 'Hang towels'],
    youtubeQuery: 'Towel Rack made from Hangers',
  },
  {
    id: 'hanger-5',
    title: 'Magazine Rack made from Hangers',
    material: 'Hangers',
    description: 'Build magazine holders from wire hangers.',
    steps: ['Shape hangers into rack', 'Connect multiple hangers', 'Secure to wall', 'Store magazines'],
    youtubeQuery: 'Magazine Rack made from Hangers',
  },
  {
    id: 'hanger-6',
    title: 'Garden Trellis made from Hangers',
    material: 'Hangers',
    description: 'Create plant trellises for climbing plants.',
    steps: ['Straighten and connect hangers', 'Form grid pattern', 'Secure in soil', 'Guide plants'],
    youtubeQuery: 'Garden Trellis made from Hangers',
  },
  {
    id: 'hanger-7',
    title: 'Coat Hooks made from Hangers',
    material: 'Hangers',
    description: 'Transform hangers into wall coat hooks.',
    steps: ['Cut hanger hooks', 'Attach to wood board', 'Mount on wall', 'Hang coats'],
    youtubeQuery: 'Coat Hooks made from Hangers',
  },
  {
    id: 'hanger-8',
    title: 'Photo Display made from Hangers',
    material: 'Hangers',
    description: 'Create unique photo display holders.',
    steps: ['Shape hanger wire', 'Add clips for photos', 'Hang on wall', 'Display pictures'],
    youtubeQuery: 'Photo Display made from Hangers',
  },
  {
    id: 'hanger-9',
    title: 'Pendant Light made from Hangers',
    material: 'Hangers',
    description: 'Make decorative pendant lights from wire hangers.',
    steps: ['Shape hangers into sphere', 'Add light fixture', 'Wire safely', 'Hang from ceiling'],
    youtubeQuery: 'Pendant Light made from Hangers',
  },
  {
    id: 'hanger-10',
    title: 'Scarf Organizer made from Hangers',
    material: 'Hangers',
    description: 'Organize scarves with multi-loop hanger.',
    steps: ['Add loops to hanger', 'Hang in closet', 'Thread scarves through loops', 'Save space'],
    youtubeQuery: 'Scarf Organizer made from Hangers',
  },
  
  // Additional Utensils Projects (YouTube integrated)
  {
    id: 'utensils-3',
    title: 'Wind Chimes made from Utensils',
    material: 'Utensils',
    description: 'Create musical wind chimes from old utensils.',
    steps: ['Collect spoons and forks', 'String together', 'Add striker', 'Hang outdoors'],
    youtubeQuery: 'Wind Chimes made from Utensils',
  },
  {
    id: 'utensils-4',
    title: 'Garden Markers made from Utensils',
    material: 'Utensils',
    description: 'Make plant markers from old spoons.',
    steps: ['Clean spoons', 'Write plant names', 'Seal with clear coat', 'Place in garden'],
    youtubeQuery: 'Garden Markers made from Utensils',
  },
  {
    id: 'utensils-5',
    title: 'Hooks made from Utensils',
    material: 'Utensils',
    description: 'Transform forks and spoons into wall hooks.',
    steps: ['Bend utensils to hook shape', 'Mount on board', 'Hang on wall', 'Use for keys or towels'],
    youtubeQuery: 'Hooks made from Utensils',
  },
  {
    id: 'utensils-6',
    title: 'Candle Holders made from Utensils',
    material: 'Utensils',
    description: 'Create unique candle holders from utensils.',
    steps: ['Bend fork or spoon', 'Create stable base', 'Add candle', 'Display on table'],
    youtubeQuery: 'Candle Holders made from Utensils',
  },
  {
    id: 'utensils-7',
    title: 'Door Handle made from Utensils',
    material: 'Utensils',
    description: 'Make decorative cabinet or door handles.',
    steps: ['Bend utensils to handle shape', 'Drill mounting holes', 'Attach to doors', 'Enjoy unique handles'],
    youtubeQuery: 'Door Handle made from Utensils',
  },
  {
    id: 'utensils-8',
    title: 'Jewelry made from Utensils',
    material: 'Utensils',
    description: 'Craft bracelets and rings from spoons.',
    steps: ['Heat and bend spoons', 'Shape into ring or bracelet', 'Polish surface', 'Wear as jewelry'],
    youtubeQuery: 'Jewelry made from Utensils',
  },
  {
    id: 'utensils-9',
    title: 'Picture Frame made from Utensils',
    material: 'Utensils',
    description: 'Create unique picture frames bordered with utensils.',
    steps: ['Arrange utensils around frame', 'Glue in place', 'Add photo', 'Display on wall'],
    youtubeQuery: 'Picture Frame made from Utensils',
  },
  {
    id: 'utensils-10',
    title: 'Plant Markers made from Utensils',
    material: 'Utensils',
    description: 'Label plants with decorative utensil markers.',
    steps: ['Flatten spoon bowl', 'Engrave plant names', 'Insert in soil', 'Mark garden rows'],
    youtubeQuery: 'Plant Markers made from Utensils',
  },
  
  // Additional Cups Projects (YouTube integrated)
  {
    id: 'cups-3',
    title: 'Bird Feeder made from Cups',
    material: 'Cups',
    description: 'Transform cups into hanging bird feeders.',
    steps: ['Drill holes for perch', 'Add string for hanging', 'Fill with seeds', 'Hang in tree'],
    youtubeQuery: 'Bird Feeder made from Cups',
  },
  {
    id: 'cups-4',
    title: 'Planter made from Cups',
    material: 'Cups',
    description: 'Use cups as small planters for succulents.',
    steps: ['Drill drainage hole', 'Add soil', 'Plant succulent', 'Display on windowsill'],
    youtubeQuery: 'Planter made from Cups',
  },
  {
    id: 'cups-5',
    title: 'Candle Holder made from Cups',
    material: 'Cups',
    description: 'Create decorative candle holders from cups.',
    steps: ['Clean cups', 'Add sand or wax', 'Insert candle', 'Light and enjoy'],
    youtubeQuery: 'Candle Holder made from Cups',
  },
  {
    id: 'cups-6',
    title: 'Pencil Holder made from Cups',
    material: 'Cups',
    description: 'Organize desk supplies in decorated cups.',
    steps: ['Decorate cup exterior', 'Add weight to base', 'Arrange on desk', 'Store pens and pencils'],
    youtubeQuery: 'Pencil Holder made from Cups',
  },
  {
    id: 'cups-7',
    title: 'Party Lights made from Cups',
    material: 'Cups',
    description: 'Make string lights with colored cups.',
    steps: ['Cut hole in cup bottom', 'Insert LED light', 'String together', 'Hang for decoration'],
    youtubeQuery: 'Party Lights made from Cups',
  },
  {
    id: 'cups-8',
    title: 'Organizer made from Cups',
    material: 'Cups',
    description: 'Create bathroom or desk organizers.',
    steps: ['Mount cups on board', 'Arrange in pattern', 'Hang on wall', 'Store small items'],
    youtubeQuery: 'Organizer made from Cups',
  },
  {
    id: 'cups-9',
    title: 'Speaker Amplifier made from Cups',
    material: 'Cups',
    description: 'Amplify phone sound with cup speakers.',
    steps: ['Cut slot for phone', 'Position cups for sound', 'Place phone in slot', 'Enjoy amplified audio'],
    youtubeQuery: 'Speaker Amplifier made from Cups',
  },
  {
    id: 'cups-10',
    title: 'Wind Chimes made from Cups',
    material: 'Cups',
    description: 'Create decorative wind chimes from plastic cups.',
    steps: ['Cut cups into shapes', 'String together', 'Add beads or bells', 'Hang outdoors'],
    youtubeQuery: 'Wind Chimes made from Cups',
  },
  
  // Additional Bottle Caps Projects (YouTube integrated)
  {
    id: 'bottle-caps-3',
    title: 'Magnets made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Create decorative fridge magnets from bottle caps.',
    steps: ['Clean bottle caps', 'Add images or paint', 'Glue magnet to back', 'Display on fridge'],
    youtubeQuery: 'Magnets made from Bottle Caps',
  },
  {
    id: 'bottle-caps-4',
    title: 'Wall Art made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Create mosaic wall art from colorful bottle caps.',
    steps: ['Design pattern', 'Arrange caps by color', 'Glue to board', 'Hang on wall'],
    youtubeQuery: 'Wall Art made from Bottle Caps',
  },
  {
    id: 'bottle-caps-5',
    title: 'Keychain made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Make personalized keychains from bottle caps.',
    steps: ['Flatten cap', 'Add image or text', 'Seal with resin', 'Attach keyring'],
    youtubeQuery: 'Keychain made from Bottle Caps',
  },
  {
    id: 'bottle-caps-6',
    title: 'Checkers Game made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Create a checkers game set using bottle caps.',
    steps: ['Collect two cap colors', 'Paint if needed', 'Create game board', 'Play checkers'],
    youtubeQuery: 'Checkers Game made from Bottle Caps',
  },
  {
    id: 'bottle-caps-7',
    title: 'Christmas Ornaments made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Make festive ornaments from bottle caps.',
    steps: ['Decorate caps', 'Add ribbon for hanging', 'Create snowman or Santa', 'Hang on tree'],
    youtubeQuery: 'Christmas Ornaments made from Bottle Caps',
  },
  {
    id: 'bottle-caps-8',
    title: 'Clock made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Build a decorative wall clock with bottle caps.',
    steps: ['Arrange 12 caps in circle', 'Add clock mechanism', 'Mount on backing', 'Hang on wall'],
    youtubeQuery: 'Clock made from Bottle Caps',
  },
  {
    id: 'bottle-caps-9',
    title: 'Trivet made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Create heat-resistant trivets for hot dishes.',
    steps: ['Arrange caps in pattern', 'Glue together', 'Add cork backing', 'Use for hot pots'],
    youtubeQuery: 'Trivet made from Bottle Caps',
  },
  {
    id: 'bottle-caps-10',
    title: 'Curtain made from Bottle Caps',
    material: 'Bottle caps',
    description: 'Make unique door curtains from bottle caps.',
    steps: ['Collect many caps', 'String vertically', 'Create multiple strands', 'Hang in doorway'],
    youtubeQuery: 'Curtain made from Bottle Caps',
  },
  
  // Additional Plastic Bottle Projects (YouTube integrated)
  {
    id: 'plastic-bottle-3',
    title: 'Vertical Garden made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Create a space-saving vertical garden using plastic bottles.',
    steps: ['Cut bottles in half', 'Add drainage holes', 'Mount on wall', 'Fill with soil and plants'],
    youtubeQuery: 'Vertical Garden made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-4',
    title: 'Bird Feeder made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Transform bottles into eco-friendly bird feeders.',
    steps: ['Cut feeding holes', 'Add perches with wooden sticks', 'Fill with bird seeds', 'Hang outdoors'],
    youtubeQuery: 'Bird Feeder made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-5',
    title: 'Piggy Bank made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Craft a cute piggy bank for saving coins.',
    steps: ['Cut coin slot on top', 'Paint and decorate', 'Add googly eyes', 'Create ears from felt'],
    youtubeQuery: 'Piggy Bank made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-6',
    title: 'Spray Bottle made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Make a DIY spray bottle for gardening or cleaning.',
    steps: ['Clean bottle thoroughly', 'Add spray pump mechanism', 'Fill with water or solution'],
    youtubeQuery: 'Spray Bottle made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-7',
    title: 'Pencil Holder made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Create colorful desk organizers from plastic bottles.',
    steps: ['Cut bottle to desired height', 'Smooth edges with heat', 'Decorate with paint or fabric', 'Organize stationery'],
    youtubeQuery: 'Pencil Holder made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-8',
    title: 'Planters made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Make decorative plant pots from plastic bottles.',
    steps: ['Cut bottle horizontally', 'Add drainage holes', 'Paint or decorate', 'Fill with soil and plant'],
    youtubeQuery: 'Planters made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-9',
    title: 'Broom made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Craft a functional broom from plastic bottle strips.',
    steps: ['Cut bottle into thin strips', 'Leave top intact', 'Attach to wooden handle', 'Secure with wire or tape'],
    youtubeQuery: 'Broom made from Plastic Bottle',
  },
  {
    id: 'plastic-bottle-10',
    title: 'Butterfly Decorations made from Plastic Bottle',
    material: 'Plastic bottle',
    description: 'Create beautiful butterfly wall art from plastic bottles.',
    steps: ['Cut butterfly shape from bottle', 'Paint with bright colors', 'Add glitter and details', 'Attach wire for hanging'],
    youtubeQuery: 'Butterfly Decorations made from Plastic Bottle',
  },
];

export function getIdeasForMaterial(material: string): Idea[] {
  if (material === 'all') return allIdeas;
  
  const searchMaterial = material.toLowerCase();
  
  // Map category names to material types
  const categoryMapping: Record<string, string[]> = {
    'plastic': ['plastic bottle', 'bottle caps'],
    'metal': ['metal cans', 'metal bars', 'coppers'],
    'cardboard': ['cardboard'],
    'wood': ['woods'],
    'textile': ['cotton', 'denim', 'corduroy', 'chiffon'],
    'other': ['hangers', 'utensils', 'cups'],
    // Individual materials
    'hangers': ['hangers'],
    'utensils': ['utensils'],
    'cups': ['cups'],
    'bottle caps': ['bottle caps']
  };
  
  // Check if it's a category name
  const categoryMaterials = categoryMapping[searchMaterial];
  if (categoryMaterials) {
    return allIdeas.filter((idea) => {
      const ideaMaterials = idea.material.toLowerCase().split(',').map(m => m.trim());
      return ideaMaterials.some(im => 
        categoryMaterials.some(cm => im.includes(cm) || cm.includes(im))
      );
    });
  }
  
  // Otherwise do partial matching on material name
  return allIdeas.filter((idea) => {
    const ideaMaterials = idea.material.toLowerCase().split(',').map(m => m.trim());
    return ideaMaterials.some(im => 
      im.includes(searchMaterial) || searchMaterial.includes(im)
    );
  });
}

export function getIdeasForMaterials(materials: string[]): Idea[] {
  if (materials.length === 0) return allIdeas;
  
  // Find ideas that match any of the materials or combinations
  return allIdeas.filter((idea) => {
    const ideaMaterials = idea.material.toLowerCase().split(',').map(m => m.trim());
    
    // Check if idea uses any of the selected materials
    const hasMatchingMaterial = materials.some(material => 
      ideaMaterials.some(ideaMaterial => 
        ideaMaterial.includes(material.toLowerCase()) || 
        material.toLowerCase().includes(ideaMaterial)
      )
    );
    
    // Check if idea uses combination of selected materials
    const hasCombination = ideaMaterials.every(ideaMaterial =>
      materials.some(material => 
        ideaMaterial.includes(material.toLowerCase()) || 
        material.toLowerCase().includes(ideaMaterial)
      )
    );
    
    return hasMatchingMaterial || hasCombination;
  }).sort((a, b) => {
    // Prioritize combination projects when multiple materials are selected
    if (materials.length > 1) {
      const aMaterialCount = a.material.split(',').length;
      const bMaterialCount = b.material.split(',').length;
      return bMaterialCount - aMaterialCount;
    }
    return 0;
  });
}

/**
 * @deprecated This function is no longer used. Videos are now served from local files.
 * See videoMapping.ts for local video sources.
 */
export function searchYouTubeVideos(query: string): string {
  // Legacy function - no longer used
  const encodedQuery = encodeURIComponent(query + ' DIY tutorial');
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
}


