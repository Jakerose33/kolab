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
    image: '/images/city-guides/hidden-bars.jpg',
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
    image: '/images/city-guides/art-spaces.jpg',
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
    image: '/images/city-guides/late-night-eats.jpg',
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
    image: '/images/city-guides/warehouse-venues.jpg',
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
    image: '/images/city-guides/record-shops.jpg',
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
    image: '/images/city-guides/diy-venues.jpg',
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
    image: '/images/city-guides/street-art.jpg',
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
    image: '/images/city-guides/underground-markets.jpg',
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
    image: '/images/city-guides/secret-gardens.jpg',
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