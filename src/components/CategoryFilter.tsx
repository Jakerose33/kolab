import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Music, 
  Palette, 
  Camera, 
  Code, 
  Heart, 
  Gamepad2,
  BookOpen,
  Utensils,
  Dumbbell,
  Briefcase,
  ChevronDown,
  Filter
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  music: <Music className="h-4 w-4" />,
  art: <Palette className="h-4 w-4" />,
  photography: <Camera className="h-4 w-4" />,
  technology: <Code className="h-4 w-4" />,
  wellness: <Heart className="h-4 w-4" />,
  gaming: <Gamepad2 className="h-4 w-4" />,
  education: <BookOpen className="h-4 w-4" />,
  food: <Utensils className="h-4 w-4" />,
  fitness: <Dumbbell className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
};

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: CategoryFilterProps) {
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40 hover:bg-accent/50 transition-all duration-200"
        >
          <Filter className="h-4 w-4 mr-2" />
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              {categoryIcons[selectedCategory] || <span>📁</span>}
              <span className="capitalize">{selectedCategoryData?.name}</span>
              <Badge variant="secondary" className="ml-1">
                {selectedCategoryData?.count}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>🌟</span>
              <span>All Events</span>
              <Badge variant="secondary" className="ml-1">
                {totalCount}
              </Badge>
            </div>
          )}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-border/40 shadow-xl"
        align="start"
        sideOffset={4}
      >
        {/* All Events Option */}
        <DropdownMenuItem
          onClick={() => onCategorySelect(null)}
          className={cn(
            "flex items-center justify-between p-3 cursor-pointer transition-colors",
            !selectedCategory && "bg-primary text-primary-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <span className="text-sm">🌟</span>
            </div>
            <span className="font-medium">All Events</span>
          </div>
          <Badge variant={!selectedCategory ? "secondary" : "outline"} className="ml-2">
            {totalCount}
          </Badge>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Individual Categories */}
        {categories.map((category) => (
          <DropdownMenuItem
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={cn(
              "flex items-center justify-between p-3 cursor-pointer transition-colors",
              selectedCategory === category.id && "bg-primary text-primary-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                {categoryIcons[category.id] || <span className="text-sm">📁</span>}
              </div>
              <span className="capitalize font-medium">{category.name}</span>
            </div>
            <Badge 
              variant={selectedCategory === category.id ? "secondary" : "outline"} 
              className="ml-2"
            >
              {category.count}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}