import { useEffect } from 'react';

export function AdvancedRobotsTxtManager() {
  useEffect(() => {
    const generateRobotsTxt = () => {
      const baseUrl = window.location.origin;
      
      const robotsContent = `# Kolab - Underground Culture & Events Platform
# Advanced robots.txt for maximum SEO efficiency

# High-priority crawlers - Full access with optimized crawl rates
User-agent: Googlebot
Allow: /
Crawl-delay: 1
Request-rate: 1/1

User-agent: Bingbot
Allow: /
Crawl-delay: 2
Request-rate: 1/2

# Social media crawlers for rich previews
User-agent: Twitterbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /
Crawl-delay: 1

User-agent: LinkedInBot
Allow: /
Crawl-delay: 1

User-agent: WhatsApp
Allow: /

User-agent: Slackbot
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: DiscordBot
Allow: /

# SEO and analysis tools
User-agent: AhrefsBot
Allow: /
Crawl-delay: 10

User-agent: SemrushBot
Allow: /
Crawl-delay: 10

User-agent: MJ12bot
Allow: /
Crawl-delay: 10

# Image search crawlers
User-agent: Googlebot-Image
Allow: /
Crawl-delay: 1

User-agent: Bingbot-Image
Allow: /
Crawl-delay: 2

# All other crawlers - Controlled access
User-agent: *
Allow: /
Crawl-delay: 5
Request-rate: 1/10

# Block sensitive areas and admin sections
Disallow: /admin/
Disallow: /api/
Disallow: /analytics/
Disallow: /settings/
Disallow: /profile/edit/
Disallow: /.env
Disallow: /config/
Disallow: /logs/
Disallow: /tmp/
Disallow: /cache/

# Block low-value pages that waste crawl budget
Disallow: /404
Disallow: /error
Disallow: /maintenance
Disallow: /*?print=*
Disallow: /*?pdf=*
Disallow: /*?share=*
Disallow: /*?utm_*
Disallow: /*?fb_*
Disallow: /*?gclid=*

# Allow important parameter pages
Allow: /events?category=*
Allow: /venues?type=*
Allow: /search?q=*
Allow: /careers?location=*

# Block duplicate content with parameters
Disallow: /*?sort=*
Disallow: /*?filter=*
Disallow: /*?page=*
Disallow: /*?limit=*

# Sitemaps for discovery
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-images.xml
Sitemap: ${baseUrl}/sitemap-events.xml
Sitemap: ${baseUrl}/sitemap-venues.xml

# Additional directives for enhanced SEO
# Clean URLs directive
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term
Clean-param: fbclid&gclid&msclkid&twclid

# Host directive (canonical domain)
Host: ${new URL(baseUrl).hostname}

# Visit-time directive for important pages
Visit-time: 0100-2300

# Request-rate for premium content
Request-rate: 1/1 0100-0600
Request-rate: 1/2 0600-1800
Request-rate: 1/1 1800-2300`;

      // Store robots.txt content for backend use
      localStorage.setItem('robotsTxtContent', robotsContent);
      localStorage.setItem('robotsTxtLastGenerated', new Date().toISOString());
      
      console.log('Advanced robots.txt content generated');
    };

    generateRobotsTxt();
  }, []);

  // Monitor crawl activity
  useEffect(() => {
    const monitorCrawlers = () => {
      // Track crawler visits in analytics
      const crawlerPatterns = [
        /googlebot/i,
        /bingbot/i,
        /slurp/i,
        /duckduckbot/i,
        /baiduspider/i,
        /yandexbot/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i,
        /whatsapp/i,
        /applebot/i
      ];

      const userAgent = navigator.userAgent.toLowerCase();
      const isCrawler = crawlerPatterns.some(pattern => pattern.test(userAgent));
      
      if (isCrawler) {
        console.log('Search engine crawler detected:', userAgent);
        
        // Track crawler visits (in production, send to analytics)
        const crawlerData = {
          userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer
        };
        
        // Store crawler visit data
        const existingData = JSON.parse(localStorage.getItem('crawlerVisits') || '[]');
        existingData.push(crawlerData);
        
        // Keep only last 100 visits
        if (existingData.length > 100) {
          existingData.splice(0, existingData.length - 100);
        }
        
        localStorage.setItem('crawlerVisits', JSON.stringify(existingData));
      }
    };

    monitorCrawlers();
  }, []);

  return null;
}
