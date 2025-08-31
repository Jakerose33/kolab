import { useEffect } from 'react'

interface SEOHeadProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'event'
  author?: string
  publishedTime?: string
  keywords?: string[]
}

export const SEOHead = ({
  title,
  description,
  image = '/images/og-kolab.jpg',
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  keywords = []
}: SEOHeadProps) => {
  useEffect(() => {
    // Update title
    document.title = title

    // Helper function to update meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${property}"]`)
      
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, property)
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // Basic meta tags
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords.join(', '))
    
    // Open Graph tags
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:url', url, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:site_name', 'Kolab', true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)

    // Article specific tags
    if (type === 'article' && author) {
      updateMetaTag('article:author', author, true)
    }
    
    if (type === 'article' && publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true)
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)

  }, [title, description, image, url, type, author, publishedTime, keywords])

  return null
}