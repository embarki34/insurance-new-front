import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Map, Calendar } from "lucide-react";
import { SiteOutput } from '@/lib/output-Types';

function SiteCard({ site }: { site: SiteOutput }) {



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/50 bg-white border-slate-200">
      <CardHeader className="bg-gradient-to-br from-white via-slate-50 to-blue-50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent group-hover:to-blue-600 transition-all">
            {site.name}
          </CardTitle>
          <Badge variant="outline" 
            className="bg-blue-50/80 text-blue-700 font-medium px-3 py-1 rounded-full 
            border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-all">
            {site.zone}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 
            border border-transparent hover:border-slate-200 transition-all duration-300">
            <div className="p-2 rounded-lg bg-blue-100/50 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Built Surface</p>
              <p className="text-base font-bold text-slate-800">
                {site.builtSurface.toLocaleString()} m²
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 
            border border-transparent hover:border-slate-200 transition-all duration-300">
            <div className="p-2 rounded-lg bg-blue-100/50 text-blue-700">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unbuilt Surface</p>
              <p className="text-base font-bold text-slate-800">
                {site.unbuiltSurface.toLocaleString()} m²
              </p>
            </div>
          </div>
        <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/50
          border border-green-100 group-hover:border-green-200 transition-all">
          
          <div>
            <p className="text-sm font-medium text-green-600">Total Value</p>
            <p className="text-2xl font-bold text-green-700 tracking-tight">
              {formatCurrency(site.totalValue)}
            </p>
          </div>
        </div>
        </div>
        
      </CardContent>
      
      <CardFooter className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-blue-50/30 py-3">
        <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
          <div className="p-1 rounded bg-slate-100/80">
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">Last updated: {formatDate(site.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SiteCard;