export interface EditorialItem {
  id: string
  type: 'event' | 'city-guide' | 'story'
  title: string
  subtitle?: string
  neighbourhood?: string
  image: string
  imageAlt?: string
  date?: string
  time?: string
  going?: number
  interested?: number
  tag?: string
  description?: string
  slug: string
  metaDescription?: string
  callToAction?: string
}

export const editorialData: EditorialItem[] = [
  // Events
  {
    id: '1',
    type: 'event',
    title: 'Midnight Jazz at The Underground',
    subtitle: 'Intimate late-night sessions with London\'s finest musicians',
    neighbourhood: 'Shoreditch',
    image: '/images/editorial/jazz-underground.jpg',
    imageAlt: 'Dimly lit underground jazz venue with silhouettes of musicians and intimate audience',
    date: 'Tonight',
    time: '11PM',
    going: 127,
    interested: 89,
    description: 'Step into London\'s most atmospheric jazz venue for an evening of improvisation and late-night sophistication. Where music legends are born and intimate connections flourish.',
    slug: 'midnight-jazz-underground',
    metaDescription: 'Experience intimate late-night jazz sessions at The Underground in Shoreditch. London\'s premier jazz venue for authentic, atmospheric performances.',
    callToAction: 'Reserve Your Spot'
  },
  {
    id: '2',
    type: 'event', 
    title: 'Warehouse Rave: Industrial Sounds',
    subtitle: 'Raw techno in an authentic industrial setting',
    neighbourhood: 'Hackney Wick',
    image: '/images/editorial/warehouse-rave.jpg',
    imageAlt: 'Large industrial warehouse space with dramatic lighting and crowd dancing to techno music',
    date: 'Sat',
    time: '10PM',
    going: 456,
    interested: 234,
    description: 'Lose yourself in pounding basslines and hypnotic rhythms in this converted warehouse space. Where underground techno culture thrives in its most authentic form.',
    slug: 'warehouse-rave-industrial',
    metaDescription: 'Join London\'s premier warehouse rave in Hackney Wick. Industrial techno in an authentic setting with world-class sound systems.',
    callToAction: 'Get Tickets Now'
  },
  {
    id: '3',
    type: 'event',
    title: 'Secret Supper Club',
    subtitle: 'Experimental cuisine in hidden locations',
    neighbourhood: 'Dalston',
    image: '/images/editorial/supper-club.jpg',
    imageAlt: 'Intimate dining space with candlelit tables and guests enjoying experimental cuisine',
    date: 'Sun',
    time: '7PM',
    going: 24,
    interested: 67,
    description: 'An exclusive culinary journey through London\'s underground food scene. Limited seats, unlimited creativity from the city\'s most innovative chefs.',
    slug: 'secret-supper-club',
    metaDescription: 'Experience London\'s exclusive underground dining scene. Secret locations, innovative chefs, unforgettable culinary adventures.',
    callToAction: 'Request Invitation'
  },

  // City Guides
  {
    id: '4',
    type: 'city-guide',
    title: 'Hidden Bars of East London',
    subtitle: 'Where locals drink after midnight',
    image: '/images/editorial/hidden-bars.jpg',
    imageAlt: 'Atmospheric speakeasy bar with exposed brick walls and intimate lighting',
    tag: 'City Guide',
    description: 'Discover East London\'s best-kept drinking secrets. From hidden speakeasies to locals-only pubs, unlock the doors others can\'t find.',
    slug: 'hidden-bars-east-london',
    metaDescription: 'Discover hidden bars and speakeasies in East London. Local drinking spots, secret entrances, and after-hours venues.',
    callToAction: 'Explore the Guide'
  },
  {
    id: '5',
    type: 'city-guide',
    title: 'Underground Art Spaces',
    subtitle: 'Gallery openings you missed',
    image: '/images/editorial/art-spaces.jpg',
    imageAlt: 'Contemporary art installation in converted industrial space with visitors viewing work',
    tag: 'City Guide',
    description: 'Navigate London\'s alternative art scene. From warehouse galleries to artist-run spaces, discover where creativity thrives beyond the mainstream.',
    slug: 'underground-art-spaces',
    metaDescription: 'Explore London\'s underground art scene. Alternative galleries, artist-run spaces, and creative venues off the beaten path.',
    callToAction: 'View Art Spaces'
  },

  // Stories
  {
    id: '6',
    type: 'story',
    title: 'The Last Warehouse',
    subtitle: 'A photo essay on London\'s disappearing rave culture',
    image: '/images/editorial/last-warehouse.jpg',
    imageAlt: 'Black and white photograph of empty warehouse space with remnants of sound equipment',
    tag: 'Journal',
    description: 'Through the lens of photographer Marcus Steel, we explore the remnants of London\'s warehouse scene and what we lose when these spaces disappear forever.',
    slug: 'the-last-warehouse',
    metaDescription: 'A photographic exploration of London\'s disappearing warehouse rave culture. Stories and images from the spaces that shaped a generation.',
    callToAction: 'Read the Story'
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
    subtitle: 'Classic house on authentic wax',
    neighbourhood: 'Bermondsey',
    image: '/images/editorial/vinyl-only.jpg',
    imageAlt: 'DJ playing vinyl records with crates of classic house music visible in atmospheric club lighting',
    date: 'Fri',
    time: '9PM',
    going: 89,
    interested: 156,
    description: 'Step back to the golden era of house music. Pure vinyl sets, authentic sound, and the community that keeps the spirit of \'90s house alive.',
    slug: 'vinyl-only-90s-house',
    metaDescription: 'Experience authentic 90s house music on vinyl in Bermondsey. Classic tracks, original pressings, pure analog sound.',
    callToAction: 'Join the Session'
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