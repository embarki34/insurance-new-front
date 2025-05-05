import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, CalendarDays, Landmark, AreaChart, DollarSign, Plus, Check } from "lucide-react"; // Added Check icon
import { Detail, ObjectOutput, SiteOutput } from '@/lib/output-Types'; // Assuming Detail type is { key: string; value: string; }
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Using Accordion for better semantics and animation
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getObjects } from "@/data/object.service";
import { addBatiment } from "@/data/sites.service";
import { toast   } from "sonner";
import CreateObjects from "@/templates/objects/creatObjects";

// --- Helper Functions (Keep your existing ones) ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'DZD', // Or fetch dynamically if needed
    maximumFractionDigits: 0
  }).format(value);
};

const formatSurface = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toLocaleString('fr-FR')} m²`;
}

// --- Structured Batiment Details Component ---
interface BatimentDetailsProps {
  batiment: ObjectOutput;
}

const BatimentDetails = ({ batiment }: BatimentDetailsProps) => {
  // Default values
  const details = batiment.details || [];
  const type = batiment.objectType || 'Inconnu';

  // Extract specific details - adapt keys as needed based on your actual data
  const findDetail = (keys: string[]) => details.find(d => keys.includes(d.key))?.value || 'N/A'; //to be handeld later 
  const filterDetails = (prefixes: string[], excludeKeys: string[] = []) => details.filter(d =>
      prefixes.some(p => d.key.startsWith(p)) && !excludeKeys.some(ex => d.key.endsWith(ex))
  );

  const nom = findDetail(['nom', 'titre', 'name']); // Common keys for name/title
  const generalDetails = details.filter(d =>
      !['nom', 'titre', 'name', 'objectType'].includes(d.key) &&
      !d.key.startsWith('coordonnees_') &&
      !d.key.startsWith('informations_') &&
      !d.key.startsWith('adresse_') // Example: exclude address parts if handled separately
  );
  const coordonnees = filterDetails(['coordonnees_']);
  const informations = filterDetails(['informations_']);

  const renderDetailList = (detailList: Detail[], title: string | null = null, prefixToRemove: string = '') => {
      if (detailList.length === 0) return null;
      return (
          <>
              {title && <dt className="col-span-full font-medium text-slate-600 mt-3 text-sm">{title}</dt>}
              {detailList.map((detail, idx) => (
                  <div key={`${detail.key}-${idx}`} className="contents">
                      <dt className="text-xs text-slate-500 capitalize truncate pr-2">
                          {detail.key.replace(prefixToRemove, '').replace(/_/g, ' ')}:
                      </dt>
                      <dd className="text-sm font-medium text-slate-800 break-words">
                          {detail.value || <span className="text-slate-400">N/A</span>}
                      </dd>
                  </div>
              ))}
          </>
      );
  };

  return (
      <div className="p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-base text-slate-900">{nom}</h4>
              <Badge variant="secondary" className="text-xs">{type}</Badge>
          </div>
          <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-sm">
              {renderDetailList(generalDetails)}
              {renderDetailList(coordonnees, 'Coordonnées', 'coordonnees_')}
              {renderDetailList(informations, 'Informations', 'informations_')}
          </dl>
          {details.length === 0 && <p className="text-sm text-slate-500 text-center py-2">Aucun détail disponible.</p>}
      </div>
  );
}


// --- Main SiteCard Component ---
interface SiteCardProps {
  site: SiteOutput;
  onEdit: () => void;
}

function SiteCard({ site, onEdit }: SiteCardProps) {
  const [isAddingObject, setIsAddingObject] = useState(false);
  const [objects, setObjects] = useState<ObjectOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);

  // Fetch available objects when dialog opens
  useEffect(() => {
    if (isAddingObject) {
      fetchObjects();
    } else {
      // Reset selections when dialog closes
      setSelectedObjects([]);
    }
  }, [isAddingObject]);

  const fetchObjects = async () => {
    try {
      const response = await getObjects();
      setObjects(response.objects || []);
    } catch (error) {
      console.error("Error fetching objects:", error);
      toast.error("Failed to load available objects");
    }
  };

  const toggleObjectSelection = (objectId: string) => {
    setSelectedObjects(prev => 
      prev.includes(objectId) 
        ? prev.filter(id => id !== objectId)
        : [...prev, objectId]
    );
  };

  const handleAddSelectedObjects = async () => {
    if (selectedObjects.length === 0) {
      toast.error("Please select at least one batiment");
      return;
    }

    setIsLoading(true);
    try {
      // Send all selected batiments in one request
      await addBatiment(site.id, selectedObjects);
      onEdit()
      toast.success(`${selectedObjects.length} batiment(s) added successfully`);
      setIsAddingObject(false);
      // You might want to trigger a refresh of the site data here
    } catch (error) {
      console.error("Error adding batiments:", error);
      toast.error("Failed to add batiments to site");
    }
    setIsLoading(false);
  };

  // Ensure batiments array exists and is valid
  const batiments = Array.isArray(site.batiments) ? site.batiments : [];

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg border-slate-200 flex flex-col h-full">
      {/* Header */}
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 mb-0.5">
              {site.name || 'Site Sans Nom'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {site.zone || 'Zone inconnue'}
            </CardDescription>
          </div>
           {/* Total Value Badge - More prominent */}
           <div className="text-right flex-shrink-0">
             <p className="text-xs font-medium text-green-600 mb-0.5">Valeur Totale</p>
             <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800 text-base font-bold px-3 py-1">
                 <DollarSign className="h-4 w-4 mr-1.5 opacity-80" />
                 {formatCurrency(site.totalValue)}
             </Badge>
           </div>
        </div>
      </CardHeader>

      {/* Content - Metrics and Buildings */}
      <CardContent className="pt-5 pb-5 flex-grow">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
           <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/70 transition-colors">
             <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
               <Building2 className="h-5 w-5" />
             </div>
             <div>
               <p className="text-xs font-medium text-slate-500 mb-0.5">Surface Bâtie</p>
               <p className="text-sm font-semibold text-slate-800">
                 {formatSurface(site.builtSurface)}
               </p>
             </div>
           </div>

           <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/70 transition-colors">
             <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
               <AreaChart className="h-5 w-5" /> {/* Changed icon */}
             </div>
             <div>
               <p className="text-xs font-medium text-slate-500 mb-0.5">Surface Non Bâtie</p>
               <p className="text-sm font-semibold text-slate-800">
                 {formatSurface(site.unbuiltSurface)}
               </p>
             </div>
           </div>
        </div>

        {/* Expandable Batiments Section using Accordion */}
        <Accordion type="single" collapsible className="w-full">
           <AccordionItem value="batiments" className="border-t pt-4"> {/* Added border top for separation */}
             <div className="flex items-center justify-between">
               <AccordionTrigger className="text-base font-medium text-slate-700 hover:no-underline py-2 px-1">
                 <div className="flex items-center gap-2">
                   <Landmark className="h-4 w-4 text-slate-500" /> {/* Changed Icon */}
                   Bâtiments ({batiments.length})
                 </div>
               </AccordionTrigger>
               <Dialog open={isAddingObject} onOpenChange={setIsAddingObject}>
                 <DialogTrigger asChild>
                   <Button
                     variant="outline"
                     size="sm"
                     className="mr-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                   >
                     <Plus className="h-4 w-4" />
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                   <DialogHeader>
                     <DialogTitle>Add Batiments to Site</DialogTitle>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                     {objects.filter(object => object.objectType === 'batiment').map((object) => (
                       <div
                         key={object.id}
                         className={cn(
                           "flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer",
                           selectedObjects.includes(object.id)
                             ? "border-blue-500 bg-blue-50/50"
                             : "hover:border-blue-300 hover:bg-blue-50/30"
                         )}
                         onClick={() => !isLoading && toggleObjectSelection(object.id)}
                       >
                         <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                             selectedObjects.includes(object.id)
                               ? "bg-blue-500 border-blue-500 text-white"
                               : "border-slate-300"
                           )}>
                             {selectedObjects.includes(object.id) && <Check className="h-3 w-3" />}
                           </div>
                           <div>
                             <h4 className="font-medium text-slate-900">
                               Détails de l'objet :
                             </h4>
                             {object.details.map((detail, index) => (
                               <p key={index} className="text-sm text-slate-500">
                                 {detail.key}: {detail.value}
                               </p>
                             ))}
                             <p className="text-sm text-slate-500">{object.objectType}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   <DialogFooter>
                     <div className="flex justify-between items-center w-full">
                       <span className="text-sm text-slate-500">
                         {selectedObjects.length} batiment(s) selected
                       </span>
                       <Button
                         onClick={handleAddSelectedObjects}
                         disabled={isLoading || selectedObjects.length === 0}
                       >
                         {isLoading ? "Adding..." : "Add Selected Batiments"}
                       </Button>
                   <CreateObjects/>

                     </div>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
             </div>
             <AccordionContent className="pt-3 pb-1"> {/* Added padding */}
               {batiments.length === 0 ? (
                 <div className="text-center py-4 text-slate-500 text-sm">
                   Aucun bâtiment associé à ce site.
                 </div>
               ) : (
                 <div className="space-y-3">
                   {batiments.map((batiment, index) => (
                     // Use the dedicated component for rendering details
                     <BatimentDetails key={`batiment-${batiment.id || index}`} batiment={batiment} />
                   ))}
                 </div>
               )}
             </AccordionContent>
           </AccordionItem>
         </Accordion>

      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3 px-5">
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarDays className="h-4 w-4" />
          <span className="text-xs font-medium">
            Dernière mise à jour : {formatDate(site.updatedAt)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SiteCard;