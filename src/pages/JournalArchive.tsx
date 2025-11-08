import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { journalArticles, formatArticleDate, type JournalArticle } from "@/data/journal"

const ARTICLES_PER_PAGE = 8

interface SubscribeModuleProps {
  className?: string
}

const SubscribeModule = ({ className }: SubscribeModuleProps) => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      toast({
        title: "Subscribed!",
        description: "Welcome to the Kolab Journal community"
      })
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className={cn("text-center space-y-4", className)}>
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">✓</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">You're in!</h3>
          <p className="text-muted-foreground text-sm">
            Check your email for a welcome message and our latest stories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold">Stay in the loop</h3>
        <p className="text-muted-foreground leading-relaxed">
          Get our latest stories, exclusive interviews, and behind-the-scenes access to London's underground culture delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? "..." : "Subscribe"}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground leading-relaxed">
          By subscribing, you agree to receive email updates from Kolab Journal. 
          We respect your privacy and you can unsubscribe at any time. 
          Read our privacy policy for more details.
        </p>
      </form>
    </div>
  )
}

interface ArticleCardProps {
  article: JournalArticle
  featured?: boolean
}

const ArticleCard = ({ article, featured = false }: ArticleCardProps) => (
  <Card className={cn(
    "group cursor-pointer overflow-hidden border-0 bg-card hover:bg-card-hover transition-all duration-300",
    featured ? "hover:scale-[1.02]" : "hover:scale-[1.01]"
  )}>
    <CardContent className="p-6 space-y-4">
      {/* Date and read time */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium">{formatArticleDate(article.date)}</span>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{article.readTime} min read</span>
        </div>
      </div>

      {/* Title and dek */}
      <div className="space-y-2">
        <h3 className={cn(
          "font-bold leading-tight group-hover:text-primary transition-colors",
          featured ? "text-xl sm:text-2xl" : "text-lg"
        )}>
          {article.title}
        </h3>
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          featured ? "text-base" : "text-sm"
        )}>
          {article.dek}
        </p>
      </div>

      {/* Author and tags */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{article.author}</span>
        <div className="flex gap-1">
          {article.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Excerpt for featured articles */}
      {featured && article.excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {article.excerpt}
        </p>
      )}
    </CardContent>
  </Card>
)

export default function JournalArchive() {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const totalPages = Math.ceil(journalArticles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const currentArticles = journalArticles.slice(startIndex, endIndex)
  const featuredArticle = journalArticles.find(a => a.featured)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleArticleClick = (article: JournalArticle) => {
    toast({
      title: "Coming soon",
      description: `"${article.title}" will be available soon`
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Kolab
            </Button>
            
            <h1 className="text-lg font-bold">Journal</h1>
            <div className="w-20" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Intro */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Kolab Journal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stories from London's underground culture — the spaces, people, and movements 
              shaping the city's alternative creative landscape
            </p>
          </div>

          {/* Featured article */}
          {featuredArticle && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Featured</h2>
                <Badge variant="outline">Editor's Pick</Badge>
              </div>
              <div onClick={() => handleArticleClick(featuredArticle)}>
                <ArticleCard article={featuredArticle} featured />
              </div>
            </div>
          )}

          <Separator />

          {/* Article list */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">All Stories</h2>
            
            <div className="grid gap-6">
              {currentArticles.map((article) => (
                <div key={article.id} onClick={() => handleArticleClick(article)}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Subscribe module */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8">
              <SubscribeModule />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}