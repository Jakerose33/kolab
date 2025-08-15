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
    name: 'Fabric',
    logo: '/logos/fabric.svg',
    description: 'Legendary underground club',
    website: 'https://fabriclondon.com',
    category: 'venue'
  },
  {
    id: '2',
    name: 'The Nest',
    logo: '/logos/the-nest.svg',
    description: 'Alternative venue space',
    category: 'venue'
  },
  {
    id: '3',
    name: 'Mixmag',
    logo: '/logos/mixmag.svg',
    description: 'Electronic music publication',
    category: 'publication'
  },
  {
    id: '4',
    name: 'NTS Radio',
    logo: '/logos/nts.svg',
    description: 'Independent radio station',
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
    name: 'XL Recordings',
    logo: '/logos/xl-recordings.svg',
    description: 'Independent record label',
    category: 'brand'
  },
  {
    id: '7',
    name: 'Peckham Audio',
    logo: '/logos/peckham-audio.svg',
    description: 'Sound system collective',
    category: 'collective'
  },
  {
    id: '8',
    name: 'Oval Space',
    logo: '/logos/oval-space.svg',
    description: 'Multi-disciplinary venue',
    category: 'venue'
  },
  {
    id: '9',
    name: 'FACT Magazine',
    logo: '/logos/fact.svg',
    description: 'Music and culture publication',
    category: 'publication'
  },
  {
    id: '10',
    name: 'Warehouse Project',
    logo: '/logos/warehouse-project.svg',
    description: 'Event series',
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
    name: 'Resident Advisor',
    logo: '/logos/ra.svg',
    description: 'Electronic music platform',
    category: 'publication'
  },
  {
    id: '13',
    name: 'Corsica Studios',
    logo: '/logos/corsica.svg',
    description: 'Underground venue',
    category: 'venue'
  },
  {
    id: '14',
    name: 'Ninja Tune',
    logo: '/logos/ninja-tune.svg',
    description: 'Independent record label',
    category: 'brand'
  },
  {
    id: '15',
    name: 'Hackney Colliery Band',
    logo: '/logos/hackney-colliery.svg',
    description: 'Brass band collective',
    category: 'artist'
  }
]

export const getCollaboratorsByCategory = (category: Collaborator['category']) => {
  return collaborators.filter(collab => collab.category === category)
}

export const getFeaturedCollaborators = () => {
  return collaborators.slice(0, 10)
}