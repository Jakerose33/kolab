import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="w-full max-w-xs">
      <Select 
        value={selectedCategory || "all"} 
        onValueChange={(value) => onCategorySelect(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <SelectValue>
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
            </SelectValue>
          </div>
        </SelectTrigger>
        
        <SelectContent className="w-64 bg-background border-border shadow-xl z-50">
          {/* All Events Option */}
          <SelectItem value="all" className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 w-full">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <span className="text-sm">🌟</span>
              </div>
              <span className="font-medium">All Events</span>
              <Badge variant="outline" className="ml-auto">
                {totalCount}
              </Badge>
            </div>
          </SelectItem>

          {/* Individual Categories */}
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3 w-full">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                  {categoryIcons[category.id] || <span className="text-sm">📁</span>}
                </div>
                <span className="capitalize font-medium">{category.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {category.count}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}