export interface DiaryEntry {
  id: string
  image: string
  timestamp: string
  location: string
  photographer?: string
  caption?: string
  event?: string
}

export const diariesData: DiaryEntry[] = [
  {
    id: '1',
    image: '/diaries/sample/portrait-1.jpg',
    timestamp: '03:47 AM',
    location: 'Fabric, EC1',
    photographer: 'Marcus Steel',
    caption: 'Lost in the strobes',
    event: 'Warehouse Rave'
  },
  {
    id: '2',
    image: '/diaries/sample/portrait-2.jpg',
    timestamp: '11:23 PM',
    location: 'Hackney Wick',
    photographer: 'Sarah Chen',
    caption: 'Before the doors open',
    event: 'Underground Art Opening'
  },
  {
    id: '3',
    image: '/diaries/sample/portrait-3.jpg',
    timestamp: '02:15 AM',
    location: 'Oval Space',
    photographer: 'Tony Rodriguez',
    caption: 'The night is young',
    event: 'Midnight Jazz'
  },
  {
    id: '4',
    image: '/diaries/sample/portrait-4.jpg',
    timestamp: '01:33 AM',
    location: 'Shoreditch',
    photographer: 'Emma Wilson',
    caption: 'Street conversations',
  },
  {
    id: '5',
    image: '/diaries/sample/portrait-5.jpg',
    timestamp: '04:12 AM',
    location: 'Bermondsey',
    photographer: 'Jake Morrison',
    caption: 'Last dance',
    event: 'Vinyl Only'
  },
  {
    id: '6',
    image: '/diaries/sample/portrait-6.jpg',
    timestamp: '10:45 PM',
    location: 'Dalston',
    photographer: 'Lisa Park',
    caption: 'First impressions',
    event: 'Secret Supper'
  },
  {
    id: '7',
    image: '/diaries/sample/portrait-7.jpg',
    timestamp: '03:58 AM',
    location: 'London Bridge',
    photographer: 'David Kim',
    caption: 'City lights reflect',
  },
  {
    id: '8',
    image: '/diaries/sample/portrait-8.jpg',
    timestamp: '12:22 AM',
    location: 'Camden',
    photographer: 'Rachel Green',
    caption: 'Underground energy',
    event: 'Art Space Opening'
  },
  {
    id: '9',
    image: '/diaries/sample/portrait-9.jpg',
    timestamp: '02:47 AM',
    location: 'Peckham',
    photographer: 'Marcus Steel',
    caption: 'Raw moments',
  },
  {
    id: '10',
    image: '/diaries/sample/portrait-10.jpg',
    timestamp: '11:56 PM',
    location: 'King\'s Cross',
    photographer: 'Anna Lewis',
    caption: 'Before the rush',
    event: 'Warehouse Event'
  },
  {
    id: '11',
    image: '/diaries/sample/portrait-11.jpg',
    timestamp: '04:33 AM',
    location: 'Deptford',
    photographer: 'Chris Taylor',
    caption: 'Dawn approaches',
  },
  {
    id: '12',
    image: '/diaries/sample/portrait-12.jpg',
    timestamp: '01:15 AM',
    location: 'New Cross',
    photographer: 'Maya Patel',
    caption: 'Community vibes',
    event: 'DIY Show'
  }
]

export const getRecentDiaries = (count: number = 12) => {
  return diariesData.slice(0, count)
}

export const getDiariesByEvent = (event: string) => {
  return diariesData.filter(diary => diary.event === event)
}

export const getDiariesByPhotographer = (photographer: string) => {
  return diariesData.filter(diary => diary.photographer === photographer)
}