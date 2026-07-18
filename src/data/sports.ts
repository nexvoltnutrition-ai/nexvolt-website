export type AthleticsSubTab = {
  id: string;
  name: string;
  mappedProducts: number[];
};

export type SportData = {
  id: string;
  name: string;
  image: string;
  description: string;
  stackName: string;
  stackDescription: string;
  scienceTitle: string;
  scienceText: string;
  relatedCategories: string[];
  mappedProducts?: number[];
  subTabs?: AthleticsSubTab[];
};

export const SPORTS: SportData[] = [
  {
    id: "cricket",
    name: "Cricket",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800",
    description: "Build explosive power and maintain peak hydration through long innings.",
    stackName: "The Cricketer's Arsenal",
    stackDescription: "Explosive power, enduring stamina, and rapid recovery from the demands of the pitch.",
    scienceTitle: "Prolonged Focus & Explosive Energy",
    scienceText: "Cricket requires short bursts of intense energy spread over long durations. Our supplements provide sustained hydration while replacing essential electrolytes lost during hours on the field, plus fast-digesting proteins to accelerate tissue repair between innings.",
    relatedCategories: ["Hydration", "Pre-Workout", "Creatine", "Performance Energy"],
    mappedProducts: [6, 2, 1, 7], // Hydration, Whey, Creatine, Gums
  },
  {
    id: "football",
    name: "Football",
    image: "https://images.unsplash.com/photo-1518605368461-1e1e38ce8058?auto=format&fit=crop&q=80&w=800",
    description: "Dominate the pitch with elite endurance and lightning-fast recovery.",
    stackName: "The 90-Minute Engine",
    stackDescription: "Sustain high-intensity sprints from kick-off to the final whistle.",
    scienceTitle: "Aerobic Capacity & Rapid Repair",
    scienceText: "Footballers run up to 10km per match with numerous high-intensity sprints. Optimization means maintaining glycogen stores and ensuring immediate supply of BCAAs to prevent muscle breakdown during the second half.",
    relatedCategories: ["Hydration", "Protein", "Pre-Workout"],
    mappedProducts: [6, 4, 7], // Hydration (Electrolytes), Casein (Recovery Blend), Gums (Endurance)
  },
  {
    id: "basketball",
    name: "Basketball",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=800",
    description: "Vertical power, lateral quickness, and fourth-quarter stamina.",
    stackName: "The Hardwood Stack",
    stackDescription: "Explosive jumping and tireless baseline-to-baseline running.",
    scienceTitle: "Joint Protection & Energy Sustain",
    scienceText: "Basketball demands rapid directional changes and high impact on joints. Glucosamine and complete proteins protect joints and rebuild muscle, while hydration matrices sustain energy.",
    relatedCategories: ["Hydration", "Performance Energy", "Protein"],
    mappedProducts: [1, 2, 5, 6],
  },
  {
    id: "volleyball",
    name: "Volleyball",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
    description: "Explosive vertical jumps and reactive agility.",
    stackName: "The Spiker's Stack",
    stackDescription: "Power production and lower-body resilience.",
    scienceTitle: "Fast-Twitch Activation & Joint Care",
    scienceText: "Repeated jumping relies heavily on fast-twitch fibers fueled by ATP. Creatine improves repetitive jump height, while targeted aminos reduce joint and tendon fatigue.",
    relatedCategories: ["Creatine", "Hydration"],
    mappedProducts: [1, 3, 6],
  },
  {
    id: "tennis",
    name: "Tennis",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=800",
    description: "Agility, cardiovascular endurance, and powerful swings.",
    stackName: "The Grand Slam Stack",
    stackDescription: "Sustain high-intensity rallies through five full sets.",
    scienceTitle: "Electrolyte Balance & Muscle Endurance",
    scienceText: "Tennis matches can last hours, leading to severe fluid and sodium loss. Precise hydration and complex carbohydrates ensure peak cognitive and physical performance continues.",
    relatedCategories: ["Hydration", "Performance Energy"],
    mappedProducts: [6, 5, 7],
  },
  {
    id: "badminton",
    name: "Badminton",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800",
    description: "Agility, reflexes, and sudden changes of direction.",
    stackName: "The Baseline Agility Stack",
    stackDescription: "Lightweight energy and sharp cognitive focus.",
    scienceTitle: "Cognitive Processing & Reflex Speed",
    scienceText: "Badminton requires immense fast-twitch agility and eye-hand coordination. Nootropic-infused pre-workouts support split-second decision making, while balanced hydration keeps calves and hamstrings cramp-free during endless lunges.",
    relatedCategories: ["Performance Energy", "Hydration", "Pre-Workout"],
    mappedProducts: [5, 6, 7],
  },
  {
    id: "swimming",
    name: "Swimming",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800",
    description: "Total-body resistance, lung capacity, and reduced drag.",
    stackName: "The Aquatic Protocol",
    stackDescription: "Maintain high output with lower perceived exertion.",
    scienceTitle: "Lactate Management & VO2 Max",
    scienceText: "Swimming limits oxygen intake. Supplements that increase nitric oxide can improve blood flow and oxygen delivery, while fast carbs replace energy spent fighting water resistance.",
    relatedCategories: ["Pre-Workout", "Hydration"],
    mappedProducts: [5, 6, 3],
  },
  {
    id: "cycling",
    name: "Cycling",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800",
    description: "Lower-body endurance, climbing power, and aerobic efficiency.",
    stackName: "The Peloton Stack",
    stackDescription: "Push high watts over grueling multi-hour climbs.",
    scienceTitle: "Carbohydrate Oxidation & Glycogen Delivery",
    scienceText: "Cyclists rely heavily on carbohydrate oxidation. Specialized carb/electrolyte blends delay fatigue and help maintain power output on the longest rides.",
    relatedCategories: ["Performance Energy", "Hydration", "Recovery"],
    mappedProducts: [6, 7, 4],
  },
  {
    id: "powerlifting",
    name: "Powerlifting",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    description: "Pure strength, structural integrity, and maximum recovery.",
    stackName: "The Heavyweight Matrix",
    stackDescription: "Central nervous system priming and heavy tissue repair.",
    scienceTitle: "Hypertrophic Repair & Joint Support",
    scienceText: "Moving maximal loads causes extreme microtraumas. Complete amino acid profiles are necessary for myofibrillar repair alongside advanced compounds for joint lubrication and CNS recovery.",
    relatedCategories: ["Protein", "Creatine", "Pre-Workout"],
    mappedProducts: [1, 3, 5],
  },
  {
    id: "bodybuilding",
    name: "Bodybuilding",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800",
    description: "Maximal muscle hypertrophy and aesthetic perfection.",
    stackName: "The Hypertrophy Blueprint",
    stackDescription: "Ultimate tissue anabolism and metabolic manipulation.",
    scienceTitle: "Protein Synthesis & Cellular Volumization",
    scienceText: "Muscle growth is maximized by consistent protein intake and cellular swelling. Quality whey concentrates matched with creatine drive nutrient partitioning toward muscle.",
    relatedCategories: ["Protein", "Creatine", "Pre-Workout", "Recovery"],
    mappedProducts: [2, 3, 1, 5],
  },
  {
    id: "combat-sports",
    name: "Combat Sports / MMA",
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800",
    description: "Grappling, striking, and total metabolic taxation.",
    stackName: "The Octagon Protocol",
    stackDescription: "Fuel for maximum strength, endurance, and combat focus.",
    scienceTitle: "Metabolic Flexibility & Rapid Repair",
    scienceText: "MMA requires maximum exertion across diverse disciplines. Whey protein handles muscle repair, while advanced hydration ensures weight-cut recovery without cramping.",
    relatedCategories: ["Protein", "Hydration", "Creatine"],
    mappedProducts: [2, 6, 1, 4],
  },
  {
    id: "kabaddi",
    name: "Kabaddi",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=800",
    description: "Raw mat strength, grappling power, and anaerobic bursts.",
    stackName: "The Raider's Advantage",
    stackDescription: "Sustained high tension and brutal physical impacts.",
    scienceTitle: "Anaerobic Resilience & Rapid Tissue Recovery",
    scienceText: "Constant tackling and holding breath require monumental anaerobic capacity and immediate repair of impact-damaged soft tissue. Fast-absorbing proteins are essential for quick turnarounds.",
    relatedCategories: ["Creatine", "Protein", "Hydration"],
    mappedProducts: [1, 2, 6],
  },
  {
    id: "hockey",
    name: "Hockey",
    image: "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=800",
    description: "Sprint endurance, stick handling, and brutal stops.",
    stackName: "The Rink Stack",
    stackDescription: "Lactate buffering and shift-to-shift recovery.",
    scienceTitle: "Intermittent Sprint Capacity",
    scienceText: "Hockey players perform repeated maximum-intensity sprints. Beta-alanine and creatine ensure your muscles reload ATP rapidly on the bench so you're ready for the next shift.",
    relatedCategories: ["Pre-Workout", "Creatine", "Protein"],
    mappedProducts: [5, 1, 2, 6],
  },
  {
    id: "marathon-running",
    name: "Marathon Running",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800",
    description: "Endurance engineering for the deepest stamina reserves.",
    stackName: "The Endurance Stack",
    stackDescription: "Push through the wall and optimize your VO2 max output.",
    scienceTitle: "Glycogen Sparing & Isotonic Rehydration",
    scienceText: "Long-distance running places immense stress on energy reserves. Proper intra-workout carbohydrates and tailored electrolyte balances prevent cramping and help sustain pace.",
    relatedCategories: ["Hydration", "Performance Energy"],
    mappedProducts: [6, 7],
  },
  {
    id: "hyrox",
    name: "HYROX",
    image: "https://images.unsplash.com/photo-1599058945522-28d584b6f4ff?auto=format&fit=crop&q=80&w=800",
    description: "Hybrid athletic conditioning for power and metabolic endurance.",
    stackName: "The Hybrid Machine Strategy",
    stackDescription: "Maximal power output meets relentless aerobic capacity.",
    scienceTitle: "Lactic Acid Buffering & Neuromuscular Drive",
    scienceText: "HYROX blends functional strength with endurance. Beta-alanine and citrulline malate buffer acid build-up during sled pushes while whey isolates jumpstart recovery before the next event.",
    relatedCategories: ["Pre-Workout", "Creatine", "Protein"],
    mappedProducts: [5, 4, 1, 6],
  },
  {
    id: "ironman-triathlon",
    name: "Ironman / Triathlon",
    image: "https://images.unsplash.com/photo-1515444744559-7be63e160afe?auto=format&fit=crop&q=80&w=800",
    description: "The ultimate test of multisport stamina and transitions.",
    stackName: "The Iron Protocol",
    stackDescription: "Peak metabolic efficiency over immense distances.",
    scienceTitle: "Complete System Preservation",
    scienceText: "Triathletes must manage nutrition over three completely different disciplines. Specialized carb-to-protein ratios preserve lean tissue and provide non-stop energy.",
    relatedCategories: ["Hydration", "Performance Energy", "Recovery"],
    mappedProducts: [6, 7, 4],
  },
  {
    id: "athletics",
    name: "Athletics",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800",
    description: "Track and field excellence across all modalities.",
    stackName: "The Track & Field Matrix",
    stackDescription: "Tailored regimens for explosive power, speed, and launch.",
    scienceTitle: "Neuromuscular Firing & Specialized Output",
    scienceText: "Athletics encompasses drastically different energetic demands. We've customized our supplements to target the specific energy systems used by sprinters, jumpers, and throwers.",
    relatedCategories: ["Creatine", "Pre-Workout", "Protein"],
    mappedProducts: [], // Used differently
    subTabs: [
      {
        id: "sprinter",
        name: "Sprinter",
        mappedProducts: [1, 5, 2] // Creatine, Pre-Workout, Whey
      },
      {
        id: "jumper",
        name: "Jumper",
        mappedProducts: [1, 2] // Creatine, Whey
      },
      {
        id: "thrower",
        name: "Thrower",
        mappedProducts: [1, 3] // Creatine, Isolate
      }
    ]
  }
];
