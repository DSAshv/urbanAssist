import React from 'react';
import { Loader as Road, Droplet, Zap, Trash2, Lamp, AlertCircle, PipetteIcon as PipeIcon } from 'lucide-react';
import { ComplaintCategory } from '../../types';

interface CategoryIconProps {
  category: ComplaintCategory;
  className?: string;
  size?: number;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  className = '',
  size = 24
}) => {
  const iconProps = {
    size,
    className
  };

  switch (category) {
    case 'road':
      return <Road {...iconProps} />;
    case 'water':
      return <Droplet {...iconProps} />;
    case 'electricity':
      return <Zap {...iconProps} />;
    case 'garbage':
      return <Trash2 {...iconProps} />;
    case 'streetlight':
      return <Lamp {...iconProps} />;
    case 'sewage':
      return <PipeIcon {...iconProps} />;
    case 'other':
    default:
      return <AlertCircle {...iconProps} />;
  }
};

export default CategoryIcon;