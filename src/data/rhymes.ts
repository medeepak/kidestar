// Central rhyme catalog — single source of truth used by Home, RhymeCatalog, and RhymeDetail

export interface RhymeMeta {
    id: string;
    slug: string;
    title: string;
    description: string;
    duration: string;
    gems: number;
    thumb: string;
    emoji: string;
}

export const RHYME_CATALOG: Record<string, RhymeMeta> = {
    '1': {
        id: '1',
        slug: 'wheels-on-the-bus',
        title: 'Wheels on the Bus',
        description: 'The classic sing-along about a cheerful bus ride — starring YOUR child as the driver!',
        duration: '30s',
        gems: 30,
        thumb: '/rhymes/wheels.png',
        emoji: '🚌',
    },
    '2': {
        id: '2',
        slug: 'johnny-johnny-yes-papa',
        title: 'Johnny Johnny Yes Papa',
        description: 'Will papa catch them eating sugar? Put YOUR child in the spotlight of this cheeky classic!',
        duration: '30s',
        gems: 30,
        thumb: '/rhymes/johnny.png',
        emoji: '🍬',
    },
    '3': {
        id: '3',
        slug: 'baa-baa-black-sheep',
        title: 'Baa Baa Black Sheep',
        description: 'A woolly adventure with YOUR child as the little one who gets a bag of wool!',
        duration: '30s',
        gems: 30,
        thumb: '/rhymes/baa.png',
        emoji: '🐑',
    },
    '4': {
        id: '4',
        slug: 'twinkle-twinkle',
        title: 'Twinkle Twinkle Little Star',
        description: 'YOUR child shines bright in this magical starlit adventure under the sparkling night sky!',
        duration: '30s',
        gems: 30,
        thumb: '/rhymes/twinkle.png',
        emoji: '⭐',
    },
    '5': {
        id: '5',
        slug: 'space-odyssey',
        title: 'Space Odyssey',
        description: 'Blast off! YOUR child suits up as a tiny astronaut exploring colorful planets and playful aliens!',
        duration: '30s',
        gems: 35,
        thumb: '/rhymes/space.png',
        emoji: '🚀',
    },
    '6': {
        id: '6',
        slug: 'walk-with-dinos',
        title: 'Walk with Dinos',
        description: 'Rawr! YOUR child stomps through the jungle alongside the friendliest dinosaurs in prehistory!',
        duration: '30s',
        gems: 35,
        thumb: '/rhymes/dinos.png',
        emoji: '🦕',
    },
    '7': {
        id: '7',
        slug: 'monster-madness',
        title: 'Monster Madness',
        description: 'The funniest party ever! YOUR child dances with the goofiest, friendliest monsters around!',
        duration: '30s',
        gems: 35,
        thumb: '/rhymes/monster.png',
        emoji: '👾',
    },
};

export const RHYMES_LIST: RhymeMeta[] = Object.values(RHYME_CATALOG);
