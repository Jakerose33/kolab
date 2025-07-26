import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Briefcase
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Categories</h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategorySelect(null)}
            className="text-primary hover:text-primary-hover"
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {/* All Categories */}
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          className={cn(
            "w-full justify-start h-auto p-3",
            selectedCategory === null && "bg-gradient-primary text-white"
          )}
          onClick={() => onCategorySelect(null)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-background-secondary flex items-center justify-center">
                <span className="text-sm">🌟</span>
              </div>
              <span>All Events</span>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </Badge>
          </div>
        </Button>

        {/* Individual Categories */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-3",
              selectedCategory === category.id && "bg-gradient-primary text-white"
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-md bg-background-secondary flex items-center justify-center">
                  {categoryIcons[category.id] || <span className="text-sm">📁</span>}
                </div>
                <span className="capitalize">{category.name}</span>
              </div>
              <Badge variant="secondary" className="ml-auto">
                {category.count}
              </Badge>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}