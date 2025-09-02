import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useViewTransition } from "@/hooks/useViewTransition";
import { useJobs, useJobMutations, type JobFilters } from "@/hooks/useJobs";
import { useSavedJobs, useSavedJobMutations } from "@/hooks/useSavedJobs";
import { useMentors, useMentorMutations } from "@/hooks/useMentors";
import { useAuth } from "@/features/auth/AuthProvider";
import { LoadingState } from "@/components/LoadingState";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Bookmark, 
  BookmarkCheck,
  Star,
  ChevronDown,
  Filter,
  Briefcase,
  GraduationCap,
  FileText,
  ExternalLink,
  AlertCircle
} from "lucide-react";

// Default job filters
const defaultFilters: JobFilters = {
  jobType: 'all',
  salaryRange: [30000, 200000],
  isRemote: false,
  search: ''
};

export function CareerHub() {
  const [filters, setFilters] = useState<JobFilters>(defaultFilters);
  const [mentorSearchQuery, setMentorSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { toast } = useToast();
  const { updateWithAnimation } = useViewTransition();
  const { user } = useAuth();
  
  // Data hooks
  const { jobs, isLoading: jobsLoading } = useJobs(filters);
  const { mentors, isLoading: mentorsLoading } = useMentors(mentorSearchQuery);
  const { savedJobs } = useSavedJobs();
  
  // Mutation hooks
  const { incrementViewCount, applyToJob } = useJobMutations();
  const { saveJob, unsaveJob, isJobSaved } = useSavedJobMutations();
  const { requestMentorship } = useMentorMutations();

  // Sort jobs
  const sortedJobs = useMemo(() => {
    if (!jobs) return [];
    
    const sorted = [...jobs];
    switch (sortBy) {
      case "salary":
        return sorted.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      case "applications":
        return sorted.sort((a, b) => a.application_count - b.application_count);
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [jobs, sortBy]);

  // Update filters
  const updateFilters = (newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle job application
  const handleApplyJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply for jobs.",
        variant: "destructive",
      });
      return;
    }

    await updateWithAnimation(async () => {
      await applyToJob.mutateAsync({ jobId });
    });
  };

  // Handle mentor contact
  const handleContactMentor = async (mentorId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to request mentorship.",
        variant: "destructive",
      });
      return;
    }

    await updateWithAnimation(async () => {
      await requestMentorship.mutateAsync({ 
        mentorId, 
        message: "Hi! I'm interested in your mentorship. Could we discuss potential opportunities?" 
      });
    });
  };

  // Handle save/unsave job
  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save jobs.",
        variant: "destructive",
      });
      return;
    }

    await updateWithAnimation(async () => {
      if (isJobSaved(jobId)) {
        await unsaveJob.mutateAsync(jobId);
      } else {
        await saveJob.mutateAsync(jobId);
      }
    });
  };

  // Handle job view tracking
  const handleJobView = (jobId: string) => {
    incrementViewCount.mutate(jobId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 px-4 sm:px-0">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
          Career Hub
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          Advance your career through opportunities, mentorship, and professional development
        </p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Opportunities
          </TabsTrigger>
          <TabsTrigger value="mentors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Find Mentors
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <Select value={filters.jobType || 'all'} onValueChange={(value) => updateFilters({ jobType: value === 'all' ? undefined : value })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                  <SelectItem value="applications">Least Applied</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="hover-scale"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Advanced Filters */}
            <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <CollapsibleContent className="space-y-4">
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Salary Range (USD)</Label>
                      <Slider
                        value={filters.salaryRange || [30000, 200000]}
                        onValueChange={(value) => updateFilters({ salaryRange: value as [number, number] })}
                        max={300000}
                        min={20000}
                        step={5000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${(filters.salaryRange?.[0] || 30000).toLocaleString()}</span>
                        <span>${(filters.salaryRange?.[1] || 200000).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="remote-only"
                        checked={filters.isRemote || false}
                        onCheckedChange={(checked) => updateFilters({ isRemote: checked })}
                      />
                      <Label htmlFor="remote-only">Remote only</Label>
                    </div>
                  </div>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Jobs List */}
          {jobsLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-4">
              {sortedJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="group hover:shadow-md transition-all duration-200 hover-scale"
                  onClick={() => handleJobView(job.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <Badge variant="secondary" className="animate-fade-in">
                            {job.job_type}
                          </Badge>
                          {job.is_remote && (
                            <Badge variant="outline" className="text-primary border-primary">
                              Remote
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground font-medium mb-2">{job.company}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.currency || 'USD'} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{job.application_count} applications</span>
                          </div>
                        </div>
                      </div>
                      
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          className="hover-scale"
                        >
                          {isJobSaved(job.id) ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
                    
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.requirements.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="hover-scale">
                            {skill}
                          </Badge>
                        ))}
                        {job.requirements.length > 4 && (
                          <Badge variant="outline" className="text-muted-foreground">
                            +{job.requirements.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyJob(job.id);
                        }} 
                        className="hover-scale"
                        disabled={!user || applyToJob.isPending}
                      >
                        {!user ? "Login to Apply" : applyToJob.isPending ? "Applying..." : "Apply Now"}
                      </Button>
                      <Button variant="outline" className="hover-scale">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!user && (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Login to see more features</h3>
                    <p className="text-muted-foreground">Login to apply for jobs, save opportunities, and access your full career hub.</p>
                  </CardContent>
                </Card>
              )}
              
              {user && sortedJobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search mentors or expertise..."
                value={mentorSearchQuery}
                onChange={(e) => setMentorSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {mentorsLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="group hover:shadow-md transition-all duration-200 hover-scale">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={mentor.avatar_url || ''} alt={mentor.full_name || 'Mentor'} />
                        <AvatarFallback>{(mentor.full_name || 'M').charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {mentor.full_name || 'Anonymous Mentor'}
                            </h3>
                            <p className="text-muted-foreground">{mentor.experience_level} Level Professional</p>
                          </div>
                          {mentor.hourly_rate && (
                            <Badge variant="outline">${mentor.hourly_rate}/hour</Badge>
                          )}
                        </div>
                        
                        {mentor.mentor_expertise && mentor.mentor_expertise.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {mentor.mentor_expertise.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="hover-scale">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {mentor.mentor_bio && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">{mentor.mentor_bio}</p>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleContactMentor(mentor.user_id)} 
                            className="hover-scale"
                            disabled={!user || requestMentorship.isPending}
                          >
                            {!user ? "Login to Request" : requestMentorship.isPending ? "Sending..." : "Request Mentorship"}
                          </Button>
                          <Button variant="outline" className="hover-scale">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {!user && (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Login to connect with mentors</h3>
                    <p className="text-muted-foreground">Login to request mentorship and build professional relationships.</p>
                  </CardContent>
                </Card>
              )}
              
              {user && mentors.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria or check back later.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Create Your Professional Portfolio</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Showcase your skills, experience, and projects to potential employers and collaborators.
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <Button className="w-full" disabled={!user}>
                {user ? "Create Portfolio" : "Login to Create Portfolio"}
              </Button>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Please login to access portfolio features
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}