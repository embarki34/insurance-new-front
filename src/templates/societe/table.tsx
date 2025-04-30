"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Removed Badge as it was only used for insurance products
import { Pen, Trash2, AlertCircle, ArrowUpDown, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import { formatDate } from "@/lib/format"; // Assuming this utility exists
import { CompagnieOutput } from "@/lib/output-Types"; // Import the generic CompagnieOutput type
// Assume this service function exists
// import { deleteCompagnie } from "@/data/compagnie.service";
import { toast } from "sonner";

// --- Mock delete function if real one isn't ready ---
const deleteCompagnie = async (id: string) => {
  console.log("Mock deleteCompagnie:", id);
  await new Promise(res => setTimeout(res, 500));
  // Simulate potential errors:
  // if (id === 'error-id') throw new Error("Simulated delete error");
};
// --- End Mock ---

interface CompagnieTableProps { // Renamed props interface
  companies: CompagnieOutput[]; // Use CompagnieOutput type
  onEdit: (company: CompagnieOutput) => void; // Use CompagnieOutput type
  onDelete: () => void;
  isLoading?: boolean;
}

const SocietesTable = ({ companies, onEdit, onDelete, isLoading = false }: CompagnieTableProps) => { // Renamed component
  const [sortBy, setSortBy] = useState<string>('informations_generales.raison_sociale');
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedCompany, setSelectedCompany] = useState<CompagnieOutput | null>(null); // Use CompagnieOutput type
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Helper to safely access nested properties for sorting/display
  const getNestedValue = (obj: any, path: string, defaultValue: any = '') => {
    try {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return value !== undefined && value !== null ? value : defaultValue;
    } catch (e) {
        return defaultValue;
    }
  };


  const sortedData = [...companies].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy);
    const bValue = getNestedValue(b, sortBy);

    // Basic string comparison, adjust if numeric/date sorting is needed for specific columns
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const handleDelete = async (id: string) => {
    // Use window.confirm for simplicity, consider a custom confirmation dialog
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette compagnie ?");
    if (!confirmed) return;

    setIsDeleting(true); // Set loading state for the specific delete action
    try {
      await deleteCompagnie(id); // Call the generic delete function
      toast.success("Compagnie supprimée avec succès");
      onDelete(); // Callback to refresh the list in the parent component
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Erreur lors de la suppression de la compagnie");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetails = (company: CompagnieOutput) => {
    setSelectedCompany(company);
    setDetailsOpen(true);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  // Empty State
  if (!isLoading && companies.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucune compagnie trouvée</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Aucune compagnie n'est disponible actuellement. Vous pouvez en ajouter une nouvelle.
        </p>
      </div>
    );
  }

  // Table Display
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("informations_generales.raison_sociale")}
              >
                <div className="flex items-center">
                  Raison Sociale
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "informations_generales.raison_sociale" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead>Forme Juridique</TableHead>
              <TableHead>Numéro RC</TableHead>
              {/* Removed Numéro Agrément column */}
              <TableHead>Site Web</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((company) => (
              <TableRow
                key={company.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">
                  {getNestedValue(company, 'informations_generales.raison_sociale')}
                </TableCell>
                <TableCell>{getNestedValue(company, 'informations_generales.forme_juridique')}</TableCell>
                <TableCell>{getNestedValue(company, 'informations_generales.numero_rc')}</TableCell>
                {/* Removed Numéro Agrément cell */}
                <TableCell>
                    {getNestedValue(company, 'coordonnees.site_web') ? (
                        <a
                            href={getNestedValue(company, 'coordonnees.site_web')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()} // Prevent row click if needed
                        >
                            {getNestedValue(company, 'coordonnees.site_web')}
                        </a>
                    ) : (
                        <span className="text-muted-foreground">N/A</span>
                    )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1"> {/* Reduced gap slightly */}
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => openDetails(company)} className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Voir détails</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(company)} className="h-8 w-8">
                            <Pen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Éditer</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(company.id)}
                            disabled={isDeleting} // Disable button while deleting
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                           {isDeleting ? <Spinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Supprimer</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Détails de la compagnie {/* Updated title */}
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur {selectedCompany?.informations_generales?.raison_sociale || 'la compagnie'}
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <ScrollArea className="max-h-[70vh] pr-4 -mr-4"> {/* Added negative margin to offset scrollbar */}
              <div className="space-y-6 py-2">
                {/* Informations Générales */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations Générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><p className="text-sm font-medium text-muted-foreground">Raison Sociale</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_generales.raison_sociale', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Forme Juridique</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_generales.forme_juridique', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Numéro RC</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_generales.numero_rc', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Code Activité</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_generales.code_activite', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Capital Social</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_generales.capital_social', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Date Création</p><p className="text-sm mt-1">{formatDate(getNestedValue(selectedCompany, 'informations_generales.date_creation', null))}</p></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Coordonnées */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Coordonnées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div><p className="text-sm font-medium text-muted-foreground">Adresse Direction Générale</p><p className="text-sm mt-1 whitespace-pre-wrap">{getNestedValue(selectedCompany, 'coordonnees.adresse_direction_generale', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Adresse Direction Régionale</p><p className="text-sm mt-1 whitespace-pre-wrap">{getNestedValue(selectedCompany, 'coordonnees.adresse_direction_regionale', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Adresse Agence</p><p className="text-sm mt-1 whitespace-pre-wrap">{getNestedValue(selectedCompany, 'coordonnees.adresse_agence', 'N/A')}</p></div>
                       <div>
                          <p className="text-sm font-medium text-muted-foreground">Site Web</p>
                          {getNestedValue(selectedCompany, 'coordonnees.site_web') ? (
                              <a href={getNestedValue(selectedCompany, 'coordonnees.site_web')} target="_blank" rel="noopener noreferrer" className="text-sm mt-1 text-blue-600 hover:underline">
                                  {getNestedValue(selectedCompany, 'coordonnees.site_web')}
                              </a>
                          ) : <p className="text-sm mt-1">N/A</p>}
                       </div>
                    </div>
                    {/* Contacts */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-base font-medium mb-4">Contacts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {(['PDG', 'DG', 'DR', 'DA'] as const).map(role => (
                          <div key={role} className="space-y-1 border-l-2 pl-3 border-muted">
                            <h5 className="text-sm font-semibold">{role}</h5>
                            <p className="text-xs text-muted-foreground">Tél: {getNestedValue(selectedCompany, `coordonnees.contacts.${role}.telephone`, 'N/A')}</p>
                            <p className="text-xs text-muted-foreground">Fax: {getNestedValue(selectedCompany, `coordonnees.contacts.${role}.fax`, 'N/A')}</p>
                            <p className="text-xs text-muted-foreground">Email: {getNestedValue(selectedCompany, `coordonnees.contacts.${role}.email`, 'N/A')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informations Bancaires */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations Bancaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><p className="text-sm font-medium text-muted-foreground">Nom de la Banque</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_bancaires.nom_banque', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">RIB/Numéro de Compte</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_bancaires.rib_ou_numero_compte', 'N/A')}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Devise du Compte</p><p className="text-sm mt-1">{getNestedValue(selectedCompany, 'informations_bancaires.devise_compte', 'N/A')}</p></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Removed Données Spécifiques Assurance Card */}

                {/* Metadata */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Métadonnées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><p className="text-sm font-medium text-muted-foreground">Créé le</p><p className="text-sm mt-1">{formatDate(getNestedValue(selectedCompany, 'createdAt', null))}</p></div>
                      <div><p className="text-sm font-medium text-muted-foreground">Dernière modification</p><p className="text-sm mt-1">{formatDate(getNestedValue(selectedCompany, 'updatedAt', null))}</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocietesTable; // Renamed export