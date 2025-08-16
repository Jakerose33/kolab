export interface Collaborator {
  id: string
  name: string
  logo: string
  description?: string
  website?: string
  category: 'venue' | 'brand' | 'artist' | 'publication' | 'collective'
}

export const collaborators: Collaborator[] = [
  {
    id: '1',
    name: 'Corner Hotel',
    logo: '/logos/corner-hotel.svg',
    description: 'Iconic Melbourne live music venue',
    website: 'https://cornerhotel.com',
    category: 'venue'
  },
  {
    id: '2',
    name: 'Revolver Upstairs',
    logo: '/logos/revolver.svg',
    description: 'Underground club and venue',
    category: 'venue'
  },
  {
    id: '3',
    name: 'Beat Magazine',
    logo: '/logos/beat-mag.svg',
    description: 'Melbourne music publication',
    category: 'publication'
  },
  {
    id: '4',
    name: 'PBS 106.7FM',
    logo: '/logos/pbs.svg',
    description: 'Community radio station',
    category: 'publication'
  },
  {
    id: '5',
    name: 'Boiler Room',
    logo: '/logos/boiler-room.svg',
    description: 'Global music streaming platform',
    category: 'brand'
  },
  {
    id: '6',
    name: 'Flightless Records',
    logo: '/logos/flightless.svg',
    description: 'Independent Melbourne record label',
    category: 'brand'
  },
  {
    id: '7',
    name: 'Northside Records',
    logo: '/logos/northside.svg',
    description: 'Fitzroy record store collective',
    category: 'collective'
  },
  {
    id: '8',
    name: 'Forum Melbourne',
    logo: '/logos/forum.svg',
    description: 'Historic live music theatre',
    category: 'venue'
  },
  {
    id: '9',
    name: 'The Music',
    logo: '/logos/themusic.svg',
    description: 'Australian music publication',
    category: 'publication'
  },
  {
    id: '10',
    name: 'Let Them Eat Cake',
    logo: '/logos/ltec.svg',
    description: 'Melbourne festival collective',
    category: 'collective'
  },
  {
    id: '11',
    name: 'Adidas',
    logo: '/logos/adidas.svg',
    description: 'Sportswear brand',
    category: 'brand'
  },
  {
    id: '12',
    name: 'Rave Magazine',
    logo: '/logos/rave.svg',
    description: 'Electronic music platform',
    category: 'publication'
  },
  {
    id: '13',
    name: 'Brown Alley',
    logo: '/logos/brown-alley.svg',
    description: 'Underground warehouse venue',
    category: 'venue'
  },
  {
    id: '14',
    name: 'I OH YOU',
    logo: '/logos/iohyou.svg',
    description: 'Independent record label',
    category: 'brand'
  },
  {
    id: '15',
    name: 'Thornbury Theatre',
    logo: '/logos/thornbury.svg',
    description: 'Intimate live music venue',
    category: 'venue'
  }
]

export const getCollaboratorsByCategory = (category: Collaborator['category']) => {
  return collaborators.filter(collab => collab.category === category)
}

export const getFeaturedCollaborators = () => {
  return collaborators.slice(0, 10)
}