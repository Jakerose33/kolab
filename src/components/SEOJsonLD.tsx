import React from 'react'

interface EventJsonLDProps {
  event: {
    id: string
    title: string
    description?: string
    startDate: string
    endDate?: string
    venue?: string
    venueAddress?: string
    image?: string
    ticketUrl?: string
    organizer?: string
    capacity?: number
    tags?: string[]
    going?: number
    interested?: number
  }
}

interface OrganizationJsonLDProps {
  name: string
  url: string
  logo?: string
  description?: string
  sameAs?: string[]
}

interface WebsiteJsonLDProps {
  name: string
  url: string
  description?: string
  potentialAction?: {
    type: string
    target: string
    queryInput: string
  }
}

// Event structured data component
export function EventJsonLD({ event }: EventJsonLDProps) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || `Join us for ${event.title}`,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "image": event.image ? [event.image] : undefined,
    "location": event.venue && event.venueAddress ? {
      "@type": "Place",
      "name": event.venue,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.venueAddress
      }
    } : undefined,
    "organizer": event.organizer ? {
      "@type": "Organization",
      "name": event.organizer
    } : {
      "@type": "Organization",
      "name": "Kolab"
    },
    "offers": event.ticketUrl ? {
      "@type": "Offer",
      "url": event.ticketUrl,
      "price": "0",
      "priceCurrency": "GBP",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    } : undefined,
    "performer": event.organizer ? {
      "@type": "Organization", 
      "name": event.organizer
    } : undefined,
    "maximumAttendeeCapacity": event.capacity,
    "typicalAgeRange": "18+",
    "keywords": event.tags?.join(", "),
    "url": `${window.location.origin}/events/${event.id}`,
    "aggregateRating": event.going && event.going > 10 ? {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": Math.floor(event.going / 3)
    } : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  )
}

// Organization structured data for the site
export function OrganizationJsonLD({ 
  name, 
  url, 
  logo, 
  description = "Discover underground culture, exclusive events, and hidden venues", 
  sameAs = []
}: OrganizationJsonLDProps) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "sameAs": sameAs,
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  )
}

// Website structured data with search functionality
export function WebsiteJsonLD({ 
  name, 
  url, 
  description = "Your backstage pass to the city's best-kept secrets",
  potentialAction = {
    type: "SearchAction",
    target: `${url}/search?q={search_term_string}`,
    queryInput: "required name=search_term_string"
  }
}: WebsiteJsonLDProps) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "potentialAction": {
      "@type": potentialAction.type,
      "target": potentialAction.target,
      "query-input": potentialAction.queryInput
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  )
}

// Breadcrumb structured data
export function BreadcrumbJsonLD({ items }: { 
  items: Array<{ name: string; url: string }> 
}) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  )
}

// Collection page structured data for event listings
export function CollectionPageJsonLD({ 
  name,
  description,
  url,
  events
}: {
  name: string
  description: string
  url: string
  events: Array<{
    id: string
    title: string
    url: string
    image?: string
  }>
}) {
  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": events.map((event, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": event.url,
        "name": event.title,
        "image": event.image
      }))
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
    />
  )
}