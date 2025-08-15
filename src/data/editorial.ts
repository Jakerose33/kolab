export interface EditorialItem {
  id: string
  type: 'event' | 'city-guide' | 'story'
  title: string
  subtitle?: string
  neighbourhood?: string
  image: string
  date?: string
  time?: string
  going?: number
  interested?: number
  tag?: string
  description?: string
  slug: string
}

export const editorialData: EditorialItem[] = [
  // Events
  {
    id: '1',
    type: 'event',
    title: 'Midnight Jazz at The Underground',
    neighbourhood: 'Shoreditch',
    image: '/images/editorial/jazz-underground.jpg',
    date: 'Tonight',
    time: '11PM',
    going: 127,
    interested: 89,
    slug: 'midnight-jazz-underground'
  },
  {
    id: '2',
    type: 'event', 
    title: 'Warehouse Rave: Industrial Sounds',
    neighbourhood: 'Hackney Wick',
    image: '/images/editorial/warehouse-rave.jpg',
    date: 'Sat',
    time: '10PM',
    going: 456,
    interested: 234,
    slug: 'warehouse-rave-industrial'
  },
  {
    id: '3',
    type: 'event',
    title: 'Secret Supper Club',
    neighbourhood: 'Dalston',
    image: '/images/editorial/supper-club.jpg',
    date: 'Sun',
    time: '7PM',
    going: 24,
    interested: 67,
    slug: 'secret-supper-club'
  },

  // City Guides
  {
    id: '4',
    type: 'city-guide',
    title: 'Hidden Bars of East London',
    subtitle: 'Where locals drink after midnight',
    image: '/images/editorial/hidden-bars.jpg',
    tag: 'City Guide',
    slug: 'hidden-bars-east-london'
  },
  {
    id: '5',
    type: 'city-guide',
    title: 'Underground Art Spaces',
    subtitle: 'Gallery openings you missed',
    image: '/images/editorial/art-spaces.jpg',
    tag: 'City Guide',
    slug: 'underground-art-spaces'
  },

  // Stories
  {
    id: '6',
    type: 'story',
    title: 'The Last Warehouse',
    subtitle: 'A photo essay on London\'s disappearing rave culture',
    image: '/images/editorial/last-warehouse.jpg',
    tag: 'Journal',
    description: 'Through the lens of photographer Marcus Steel, we explore the remnants of London\'s warehouse scene.',
    slug: 'the-last-warehouse'
  },
  {
    id: '7',
    type: 'story',
    title: 'Voices from the Underground',
    subtitle: 'Conversations with the city\'s cultural architects',
    image: '/images/editorial/voices-underground.jpg',
    tag: 'Journal',
    description: 'In-depth interviews with the people shaping London\'s alternative cultural landscape.',
    slug: 'voices-from-underground'
  },
  {
    id: '8',
    type: 'story',
    title: 'After Hours Architecture',
    subtitle: 'The spaces that come alive when the city sleeps',
    image: '/images/editorial/after-hours.jpg',
    tag: 'Journal',
    description: 'An exploration of London\'s nocturnal architecture and the communities it shelters.',
    slug: 'after-hours-architecture'
  },

  // More events for variety
  {
    id: '9',
    type: 'event',
    title: 'Vinyl Only: 90s House',
    neighbourhood: 'Bermondsey',
    image: '/images/editorial/vinyl-only.jpg',
    date: 'Fri',
    time: '9PM',
    going: 89,
    interested: 156,
    slug: 'vinyl-only-90s-house'
  }
]

export const getTonightEvents = () => {
  return editorialData.filter(item => 
    item.type === 'event' && 
    (item.date === 'Tonight' || item.date === new Date().toLocaleDateString('en-US', { weekday: 'short' }))
  )
}

export const getThisWeekEvents = () => {
  return editorialData.filter(item => item.type === 'event')
}

export const getCityGuides = () => {
  return editorialData.filter(item => item.type === 'city-guide')
}

export const getStories = () => {
  return editorialData.filter(item => item.type === 'story')
}