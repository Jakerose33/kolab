export interface JournalArticle {
  id: string
  title: string
  dek: string // subtitle/description
  date: string
  slug: string
  author: string
  readTime: number
  tags: string[]
  featured?: boolean
  excerpt?: string
  image?: string
  imageAlt?: string
  metaDescription?: string
  callToAction?: string
}

export const journalArticles: JournalArticle[] = [
  {
    id: '1',
    title: 'The Last Warehouse',
    dek: 'A photo essay on London\'s disappearing rave culture and the spaces that shaped a generation',
    date: '2024-08-14',
    slug: 'the-last-warehouse',
    author: 'Marcus Steel',
    readTime: 8,
    tags: ['Photography', 'Culture', 'Nightlife'],
    featured: true,
    excerpt: 'Through the lens of photographer Marcus Steel, we explore the remnants of London\'s warehouse scene and what we lose when these spaces disappear forever.',
    image: '/images/journal/last-warehouse-hero.jpg',
    imageAlt: 'Empty warehouse interior with light streaming through industrial windows, equipment remnants scattered on concrete floor',
    metaDescription: 'A photographic exploration of London\'s disappearing warehouse rave culture. Stories and images from the spaces that shaped underground music.',
    callToAction: 'Read Full Essay'
  },
  {
    id: '2',
    title: 'Voices from the Underground',
    dek: 'Conversations with the city\'s cultural architects who build community in the margins',
    date: '2024-08-12',
    slug: 'voices-from-underground',
    author: 'Sarah Chen',
    readTime: 12,
    tags: ['Interviews', 'Community', 'Culture'],
    featured: true,
    excerpt: 'In-depth interviews with the people shaping London\'s alternative cultural landscape, from venue owners to collective organizers.',
    image: '/images/journal/voices-underground-hero.jpg',
    imageAlt: 'Portrait collage of diverse cultural organizers and venue owners in London\'s underground scene',
    metaDescription: 'Interviews with London\'s underground cultural architects. Meet the people building community and shaping alternative culture.',
    callToAction: 'Read Interviews'
  },
  {
    id: '3',
    title: 'After Hours Architecture',
    dek: 'The spaces that come alive when the city sleeps',
    date: '2024-08-10',
    slug: 'after-hours-architecture',
    author: 'Emma Wilson',
    readTime: 6,
    tags: ['Architecture', 'Nightlife', 'Urban Planning'],
    excerpt: 'An exploration of London\'s nocturnal architecture and the communities it shelters.'
  },
  {
    id: '4',
    title: 'The Economics of Underground',
    dek: 'How alternative venues survive in a city that prices out creativity',
    date: '2024-08-08',
    slug: 'economics-of-underground',
    author: 'Tony Rodriguez',
    readTime: 10,
    tags: ['Economics', 'Venues', 'Policy'],
    excerpt: 'Breaking down the financial realities facing London\'s independent cultural spaces.'
  },
  {
    id: '5',
    title: 'Digital Tribes',
    dek: 'How online communities are reshaping IRL gatherings',
    date: '2024-08-05',
    slug: 'digital-tribes',
    author: 'Lisa Park',
    readTime: 7,
    tags: ['Technology', 'Community', 'Social Media'],
    excerpt: 'The intersection of digital connection and physical gathering in post-pandemic London.'
  },
  {
    id: '6',
    title: 'Sound and the City',
    dek: 'London\'s sonic landscape through the ears of its underground',
    date: '2024-08-03',
    slug: 'sound-and-city',
    author: 'David Kim',
    readTime: 9,
    tags: ['Music', 'Audio', 'Culture'],
    excerpt: 'From soundsystem culture to noise complaints: how London\'s underground music scene navigates urban tensions.'
  },
  {
    id: '7',
    title: 'The New Bohemia',
    dek: 'Where artists go when they can\'t afford the traditional creative quarters',
    date: '2024-07-30',
    slug: 'new-bohemia',
    author: 'Rachel Green',
    readTime: 11,
    tags: ['Arts', 'Gentrification', 'Community'],
    excerpt: 'Tracking the migration of London\'s creative communities to unexpected corners of the city.'
  },
  {
    id: '8',
    title: 'Flash Photography Ethics',
    dek: 'The unwritten rules of documenting underground culture',
    date: '2024-07-28',
    slug: 'flash-photography-ethics',
    author: 'Anna Lewis',
    readTime: 5,
    tags: ['Photography', 'Ethics', 'Nightlife'],
    excerpt: 'When capturing the moment means respecting the community: a photographer\'s perspective.'
  },
  {
    id: '9',
    title: 'Collective Memory',
    dek: 'How London\'s underground preserves its own history',
    date: '2024-07-25',
    slug: 'collective-memory',
    author: 'Chris Taylor',
    readTime: 8,
    tags: ['History', 'Archives', 'Culture'],
    excerpt: 'From zines to Instagram: how underground communities document and preserve their own stories.'
  },
  {
    id: '10',
    title: 'The Night Shift',
    dek: 'Stories from the people who keep London\'s nightlife running',
    date: '2024-07-22',
    slug: 'night-shift',
    author: 'Maya Patel',
    readTime: 13,
    tags: ['Work', 'Nightlife', 'Portraits'],
    excerpt: 'Security guards, bartenders, and sound engineers share their perspectives on London after dark.'
  }
]

export const getFeaturedArticles = () => {
  return journalArticles.filter(article => article.featured)
}

export const getArticlesByTag = (tag: string) => {
  return journalArticles.filter(article => 
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

export const getRecentArticles = (count: number = 6) => {
  return journalArticles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

export const formatArticleDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}