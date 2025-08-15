export interface CityGuide {
  id: string
  title: string
  subtitle: string
  neighbourhood: string
  image: string
  category: string
  featured: boolean
  slug: string
  description?: string
}

export const neighbourhoods = [
  'All',
  'Shoreditch', 
  'Hackney Wick',
  'Dalston',
  'Bermondsey',
  'Peckham',
  'New Cross',
  'Deptford',
  'King\'s Cross',
  'Camden'
]

export const cityGuidesData: CityGuide[] = [
  {
    id: '1',
    title: 'Hidden Bars of East London',
    subtitle: 'Where locals drink after midnight',
    neighbourhood: 'Shoreditch',
    image: '/images/city-guides/hidden-bars.jpg',
    category: 'Nightlife',
    featured: true,
    slug: 'hidden-bars-east-london',
    description: 'A curated list of the most secretive drinking establishments in East London.'
  },
  {
    id: '2',
    title: 'Underground Art Spaces',
    subtitle: 'Gallery openings you missed',
    neighbourhood: 'Hackney Wick',
    image: '/images/city-guides/art-spaces.jpg',
    category: 'Art',
    featured: true,
    slug: 'underground-art-spaces',
    description: 'Discover the alternative art scene thriving in London\'s industrial spaces.'
  },
  {
    id: '3',
    title: 'Late Night Eats',
    subtitle: 'Food after the pubs close',
    neighbourhood: 'Dalston',
    image: '/images/city-guides/late-night-eats.jpg',
    category: 'Food',
    featured: false,
    slug: 'late-night-eats-dalston',
    description: 'The best places to satisfy your midnight cravings in North London.'
  },
  {
    id: '4',
    title: 'Warehouse Venues',
    subtitle: 'Industrial spaces for events',
    neighbourhood: 'Bermondsey',
    image: '/images/city-guides/warehouse-venues.jpg',
    category: 'Venues',
    featured: true,
    slug: 'warehouse-venues-bermondsey',
    description: 'Raw, unpolished spaces perfect for unconventional gatherings.'
  },
  {
    id: '5',
    title: 'Record Shops & Sound',
    subtitle: 'Vinyl culture still alive',
    neighbourhood: 'Peckham',
    image: '/images/city-guides/record-shops.jpg',
    category: 'Music',
    featured: false,
    slug: 'record-shops-peckham',
    description: 'Independent record stores keeping physical music culture alive.'
  },
  {
    id: '6',
    title: 'DIY Venues',
    subtitle: 'Community-run spaces',
    neighbourhood: 'New Cross',
    image: '/images/city-guides/diy-venues.jpg',
    category: 'Community',
    featured: false,
    slug: 'diy-venues-new-cross',
    description: 'Grassroots venues run by and for the local creative community.'
  },
  {
    id: '7',
    title: 'Street Art Tours',
    subtitle: 'Walls that tell stories',
    neighbourhood: 'Deptford',
    image: '/images/city-guides/street-art.jpg',
    category: 'Art',
    featured: false,
    slug: 'street-art-deptford',
    description: 'Self-guided tours through London\'s most vibrant street art corridors.'
  },
  {
    id: '8',
    title: 'Underground Markets',
    subtitle: 'Shopping off the beaten path',
    neighbourhood: 'King\'s Cross',
    image: '/images/city-guides/underground-markets.jpg',
    category: 'Shopping',
    featured: true,
    slug: 'underground-markets-kings-cross',
    description: 'Hidden markets selling everything from vintage clothes to rare books.'
  },
  {
    id: '9',
    title: 'Secret Gardens',
    subtitle: 'Green spaces in the concrete',
    neighbourhood: 'Camden',
    image: '/images/city-guides/secret-gardens.jpg',
    category: 'Nature',
    featured: false,
    slug: 'secret-gardens-camden',
    description: 'Unexpected pockets of nature hidden throughout urban London.'
  }
]

export const getFeaturedGuides = () => {
  return cityGuidesData.filter(guide => guide.featured)
}

export const getGuidesByNeighbourhood = (neighbourhood: string) => {
  if (neighbourhood === 'All') return cityGuidesData
  return cityGuidesData.filter(guide => guide.neighbourhood === neighbourhood)
}

export const getGuidesByCategory = (category: string) => {
  return cityGuidesData.filter(guide => guide.category === category)
}