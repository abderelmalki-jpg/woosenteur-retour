/**
 * Composants Dashboard optimisés avec React.memo
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  footer?: React.ReactNode;
}

export const StatCard = memo(({ title, value, icon: Icon, iconBgColor, iconColor, footer }: StatCardProps) => {
  return (
    <Card className="p-4 sm:p-6 border-2 hover:shadow-lg transition-shadow bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
        <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
          <p className="text-xs sm:text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
      {footer && <div className="mt-3 sm:mt-4">{footer}</div>}
    </Card>
  );
});

StatCard.displayName = 'StatCard';

interface ProductCardProps {
  product: {
    id: string;
    productName: string;
    brand: string;
    category?: string;
    confidenceScore?: number;
    generationDate: string;
    imageUrl?: string;
    tags?: string[];
  };
  onClick: () => void;
}

export const ProductCard = memo(({ product, onClick }: ProductCardProps) => {
  return (
    <Card 
      className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer bg-white group"
      onClick={onClick}
    >
      {/* Image placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 text-violet-300">📦</div>
        )}
      </div>

      {/* Infos produit */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors">
            {product.productName}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-1">{product.brand}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {product.category && (
            <span className="text-xs px-2 py-1 bg-slate-100 rounded border">
              {product.category}
            </span>
          )}
          {product.confidenceScore && (
            <span 
              className={`text-xs px-2 py-1 rounded border ${
                product.confidenceScore >= 85 
                  ? 'bg-green-100 text-green-700 border-green-300' 
                  : product.confidenceScore >= 60
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-red-100 text-red-700 border-red-300'
              }`}
            >
              {product.confidenceScore}% fiabilité
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t">
          <span>🕒</span>
          <span>
            {new Date(product.generationDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
