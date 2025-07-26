import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, Clock, Star, Users, Award, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock job data
const mockJobs = [
  {
    id: "1",
    title: "Event Coordinator",
    company: "Creative Events Co.",
    location: "New York, NY",
    type: "Full-time",
    salary: "$45,000 - $60,000",
    description: "Join our dynamic team to coordinate innovative collaborative events and workshops.",
    requirements: ["2+ years event planning", "Strong communication", "Project management"],
    postedDate: "2 days ago",
    applicants: 24,
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop",
  },
  {
    id: "2",
    title: "Community Manager",
    company: "Tech Startup Hub",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$55,000 - $70,000",
    description: "Build and manage vibrant tech communities through events and digital engagement.",
    requirements: ["Community building experience", "Social media expertise", "Event management"],
    postedDate: "1 week ago",
    applicants: 31,
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=64&h=64&fit=crop",
  },
  {
    id: "3",
    title: "Freelance Photographer",
    company: "Various Clients",
    location: "Remote",
    type: "Contract",
    salary: "$500 - $1,500 per event",
    description: "Capture stunning moments at collaborative events and creative workshops.",
    requirements: ["Professional portfolio", "Event photography experience", "Own equipment"],
    postedDate: "3 days ago",
    applicants: 18,
    logo: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=64&h=64&fit=crop",
  },
];

// Mock mentor data
const mockMentors = [
  {
    id: "1",
    name: "Dr. Emily Watson",
    title: "Senior Event Strategist",
    company: "Global Events Inc.",
    expertise: ["Event Planning", "Strategic Planning", "Team Leadership"],
    experience: "15+ years",
    rating: 4.9,
    sessions: 156,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b762?w=64&h=64&fit=crop&crop=face",
    bio: "Passionate about helping emerging event professionals reach their full potential.",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    title: "Creative Director",
    company: "Innovation Studios",
    expertise: ["Creative Direction", "Brand Strategy", "Digital Marketing"],
    experience: "12+ years",
    rating: 4.8,
    sessions: 203,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    bio: "Helping creatives turn their passion into successful careers.",
  },
  {
    id: "3",
    name: "Sarah Kim",
    title: "Startup Founder",
    company: "TechCollab",
    expertise: ["Entrepreneurship", "Product Development", "Fundraising"],
    experience: "8+ years",
    rating: 4.9,
    sessions: 89,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    bio: "Guiding aspiring entrepreneurs through the startup journey.",
  },
];

export function CareerHub() {
  const [jobs, setJobs] = useState(mockJobs);
  const [mentors, setMentors] = useState(mockMentors);
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [mentorSearchQuery, setMentorSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !jobSearchQuery || 
      job.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(jobSearchQuery.toLowerCase());
    const matchesType = jobType === "all" || job.type.toLowerCase() === jobType;
    
    return matchesSearch && matchesType;
  });

  const filteredMentors = mentors.filter(mentor => {
    return !mentorSearchQuery || 
      mentor.name.toLowerCase().includes(mentorSearchQuery.toLowerCase()) ||
      mentor.expertise.some(skill => skill.toLowerCase().includes(mentorSearchQuery.toLowerCase()));
  });

  const handleApplyJob = (jobId: string, jobTitle: string) => {
    toast({
      title: "Application Submitted",
      description: `Your application for ${jobTitle} has been submitted successfully.`,
    });
  };

  const handleContactMentor = (mentorId: string, mentorName: string) => {
    toast({
      title: "Mentorship Request Sent",
      description: `Your mentorship request to ${mentorName} has been sent.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Career Hub</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Advance your career through opportunities, mentorship, and professional development
        </p>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Job Opportunities</TabsTrigger>
          <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-6">
          {/* Job Search Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="w-full lg:w-96 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={jobSearchQuery}
                onChange={(e) => setJobSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-40">
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
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="kolab-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={job.logo} />
                        <AvatarFallback>{job.company[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <CardDescription className="text-base">{job.company}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.postedDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {job.applicants} applicants
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="kolab-button-primary"
                      onClick={() => handleApplyJob(job.id, job.title)}
                    >
                      Apply Now
                    </Button>
                    <Button variant="outline">
                      Save Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentors" className="space-y-6">
          {/* Mentor Search */}
          <div className="w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors or expertise..."
              value={mentorSearchQuery}
              onChange={(e) => setMentorSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="kolab-card">
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={mentor.avatar} />
                    <AvatarFallback>{mentor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <CardDescription>{mentor.title}</CardDescription>
                    <CardDescription className="text-xs">{mentor.company}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{mentor.bio}</p>
                  </div>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{mentor.rating}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{mentor.sessions}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{mentor.experience}</div>
                      <div className="text-xs text-muted-foreground">Experience</div>
                    </div>
                  </div>

                  <Button 
                    className="w-full kolab-button-primary"
                    onClick={() => handleContactMentor(mentor.id, mentor.name)}
                  >
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <Card className="kolab-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Professional Portfolio
              </CardTitle>
              <CardDescription>
                Showcase your skills, experience, and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Build Your Portfolio</h3>
                <p className="text-muted-foreground mb-4">
                  Create a professional portfolio to showcase your work and attract opportunities.
                </p>
                <Button className="kolab-button-primary">
                  Create Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}