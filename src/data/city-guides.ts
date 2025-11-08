export interface CityGuide {
  id: string
  title: string
  subtitle: string
  neighbourhood: string
  image: string
  imageAlt?: string
  category: string
  featured: boolean
  slug: string
  description?: string
  metaDescription?: string
  callToAction?: string
  highlights?: string[]
}

export const neighbourhoods = [
  'All',
  'Fitzroy', 
  'Collingwood',
  'Richmond',
  'St Kilda',
  'Prahran',
  'Northcote',
  'Brunswick',
  'South Yarra',
  'Windsor'
]

export const cityGuidesData: CityGuide[] = [
  {
    id: '1',
    title: 'Hidden Bars of Inner Melbourne',
    subtitle: 'Where locals drink after midnight',
    neighbourhood: 'Fitzroy',
    image: 'https://images.unsplash.com/photo-1574391884720-bbc3b8331107?w=400',
    imageAlt: 'Dimly lit speakeasy entrance with neon sign and intimate bar interior visible through doorway',
    category: 'Nightlife',
    featured: true,
    slug: 'hidden-bars-inner-melbourne',
    description: 'A curated guide to Melbourne\'s most secretive drinking establishments. From hidden speakeasies to locals-only pubs.',
    metaDescription: 'Discover hidden bars and speakeasies in Melbourne. Secret entrances, intimate venues, and where locals drink after hours.',
    callToAction: 'Explore Hidden Bars',
    highlights: ['Password-protected speakeasies', 'Locals-only pub backrooms', 'After-hours cocktail dens', 'Hidden rooftop terraces']
  },
  {
    id: '2',
    title: 'Underground Art Spaces',
    subtitle: 'Gallery openings you missed',
    neighbourhood: 'Collingwood',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    category: 'Art',
    featured: true,
    slug: 'underground-art-spaces',
    description: 'Discover the alternative art scene thriving in Melbourne\'s industrial spaces.'
  },
  {
    id: '3',
    title: 'Late Night Eats',
    subtitle: 'Food after the pubs close',
    neighbourhood: 'Richmond',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    category: 'Food',
    featured: false,
    slug: 'late-night-eats-richmond',
    description: 'The best places to satisfy your midnight cravings in inner Melbourne.'
  },
  {
    id: '4',
    title: 'Warehouse Venues',
    subtitle: 'Industrial spaces for events',
    neighbourhood: 'St Kilda',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    category: 'Venues',
    featured: true,
    slug: 'warehouse-venues-st-kilda',
    description: 'Raw, unpolished spaces perfect for unconventional gatherings.'
  },
  {
    id: '5',
    title: 'Record Shops & Sound',
    subtitle: 'Vinyl culture still alive',
    neighbourhood: 'Prahran',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    category: 'Music',
    featured: false,
    slug: 'record-shops-prahran',
    description: 'Independent record stores keeping physical music culture alive.'
  },
  {
    id: '6',
    title: 'DIY Venues',
    subtitle: 'Community-run spaces',
    neighbourhood: 'Northcote',
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400',
    category: 'Community',
    featured: false,
    slug: 'diy-venues-northcote',
    description: 'Grassroots venues run by and for the local creative community.'
  },
  {
    id: '7',
    title: 'Street Art Tours',
    subtitle: 'Walls that tell stories',
    neighbourhood: 'Brunswick',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    category: 'Art',
    featured: false,
    slug: 'street-art-brunswick',
    description: 'Self-guided tours through Melbourne\'s most vibrant street art corridors.'
  },
  {
    id: '8',
    title: 'Underground Markets',
    subtitle: 'Shopping off the beaten path',
    neighbourhood: 'South Yarra',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    category: 'Shopping',
    featured: true,
    slug: 'underground-markets-south-yarra',
    description: 'Hidden markets selling everything from vintage clothes to rare books.'
  },
  {
    id: '9',
    title: 'Secret Gardens',
    subtitle: 'Green spaces in the concrete',
    neighbourhood: 'Windsor',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    category: 'Nature',
    featured: false,
    slug: 'secret-gardens-windsor',
    description: 'Unexpected pockets of nature hidden throughout urban Melbourne.'
  }
]

export const getFeaturedGuides = () => {
  return cityGuidesData.filter(guide => guide.featured)
}

export const getGuidesByNeighbourhood = (neighbourhood: string) => {
  const guides = neighbourhood === 'All' 
    ? cityGuidesData 
    : cityGuidesData.filter(guide => guide.neighbourhood === neighbourhood)
  
  // Limit to 8 cards max
  return guides.slice(0, 8)
}

export const getGuidesByCategory = (category: string) => {
  return cityGuidesData.filter(guide => guide.category === category)
}