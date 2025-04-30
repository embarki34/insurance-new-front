"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pen, Trash2, AlertCircle, ArrowUpDown, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import Spinner from "@/components/ui/spinner"
import { formatDate } from "@/lib/format"
import { InsuranceCampaniseOutput } from "@/lib/output-Types"
import { deleteInsuranceCampanise } from "@/data/insuranceCampanise.service"
import { toast } from "sonner"

interface AssuranceCompagnieTableProps {
  companies: InsuranceCampaniseOutput[]
  onEdit: (company: InsuranceCampaniseOutput) => void
  onDelete: () => void
  isLoading?: boolean
}

const AssuranceCompagnieTable = ({ companies, onEdit, onDelete, isLoading = false }: AssuranceCompagnieTableProps) => {
  const [sortBy, setSortBy] = useState<string>('raison_sociale')
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCampaniseOutput | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const sortedData = [...companies].sort((a, b) => {
    const aValue = getNestedValue(a, sortBy)
    const bValue = getNestedValue(b, sortBy)
    
    if (!aValue || !bValue) return 0
    
    if (sortOrder === "asc") {
      return String(aValue).localeCompare(String(bValue))
    } else {
      return String(bValue).localeCompare(String(aValue))
    }
  })

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this company?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteInsuranceCampanise(id);
      toast.success("Compagnie d'assurance supprimée avec succès");
      onDelete();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Erreur lors de la suppression de la compagnie");
    } finally {
      setIsDeleting(false);
    }
  }

  const openDetails = (company: InsuranceCampaniseOutput) => {
    setSelectedCompany(company)
    setDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucune donnée</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Aucune compagnie d'assurance disponible actuellement. Vous pouvez ajouter une nouvelle compagnie en utilisant le bouton de création.
        </p>
      </div>
    )
  }

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
              <TableHead>Numéro Agrément</TableHead>
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
                  {company.informations_generales.raison_sociale}
                </TableCell>
                <TableCell>{company.informations_generales.forme_juridique}</TableCell>
                <TableCell>{company.informations_generales.numero_rc}</TableCell>
                <TableCell>{company.donnees_specifiques_assurance.numero_agrement}</TableCell>
                <TableCell>{company.coordonnees.site_web}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(company)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir les détails</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(company)}
                            className="h-8 w-8"
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Éditer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(company.id)}
                            disabled={isDeleting}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer</p>
                        </TooltipContent>
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
            <DialogTitle className="flex items-center gap-2 text-xl">
              Détails de la compagnie d'assurance
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la compagnie
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Informations Générales */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations Générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Raison Sociale</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_generales.raison_sociale}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Forme Juridique</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_generales.forme_juridique}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Numéro RC</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_generales.numero_rc}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Code Activité</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_generales.code_activite}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Capital Social</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_generales.capital_social}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date Création</p>
                        <p className="text-sm mt-1">{formatDate(selectedCompany.informations_generales.date_creation)}</p>
                      </div>
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
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Adresse Direction Générale</p>
                        <p className="text-sm mt-1">{selectedCompany.coordonnees.adresse_direction_generale}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Adresse Direction Régionale</p>
                        <p className="text-sm mt-1">{selectedCompany.coordonnees.adresse_direction_regionale}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Adresse Agence</p>
                        <p className="text-sm mt-1">{selectedCompany.coordonnees.adresse_agence}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Site Web</p>
                        <p className="text-sm mt-1">{selectedCompany.coordonnees.site_web}</p>
                      </div>
                    </div>

                    {/* Contacts */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-4">Contacts</h4>
                      <div className="grid grid-cols-2 gap-6">
                        {/* PDG */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">PDG</h5>
                          <div className="space-y-1">
                            <p className="text-sm">Tél: {selectedCompany.coordonnees.contacts.PDG.telephone}</p>
                            <p className="text-sm">Fax: {selectedCompany.coordonnees.contacts.PDG.fax}</p>
                            <p className="text-sm">Email: {selectedCompany.coordonnees.contacts.PDG.email}</p>
                          </div>
                        </div>

                        {/* DG */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">DG</h5>
                          <div className="space-y-1">
                            <p className="text-sm">Tél: {selectedCompany.coordonnees.contacts.DG.telephone}</p>
                            <p className="text-sm">Fax: {selectedCompany.coordonnees.contacts.DG.fax}</p>
                            <p className="text-sm">Email: {selectedCompany.coordonnees.contacts.DG.email}</p>
                          </div>
                        </div>

                        {/* DR */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">DR</h5>
                          <div className="space-y-1">
                            <p className="text-sm">Tél: {selectedCompany.coordonnees.contacts.DR.telephone}</p>
                            <p className="text-sm">Fax: {selectedCompany.coordonnees.contacts.DR.fax}</p>
                            <p className="text-sm">Email: {selectedCompany.coordonnees.contacts.DR.email}</p>
                          </div>
                        </div>

                        {/* DA */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">DA</h5>
                          <div className="space-y-1">
                            <p className="text-sm">Tél: {selectedCompany.coordonnees.contacts.DA.telephone}</p>
                            <p className="text-sm">Fax: {selectedCompany.coordonnees.contacts.DA.fax}</p>
                            <p className="text-sm">Email: {selectedCompany.coordonnees.contacts.DA.email}</p>
                          </div>
                        </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom de la Banque</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_bancaires.nom_banque}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">RIB/Numéro de Compte</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_bancaires.rib_ou_numero_compte}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Devise du Compte</p>
                        <p className="text-sm mt-1">{selectedCompany.informations_bancaires.devise_compte}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Données Spécifiques Assurance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Données Spécifiques Assurance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Produits d'Assurance</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCompany.donnees_specifiques_assurance.produits_assurance.map((produit, index) => (
                            <Badge key={index} variant="secondary">
                              {produit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Numéro Agrément</p>
                        <p className="text-sm mt-1">{selectedCompany.donnees_specifiques_assurance.numero_agrement}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Validité Agrément</p>
                        <p className="text-sm mt-1">{selectedCompany.donnees_specifiques_assurance.validite_agrement}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Métadonnées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Créé le</p>
                        <p className="text-sm mt-1">{formatDate(selectedCompany.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                        <p className="text-sm mt-1">{formatDate(selectedCompany.updatedAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AssuranceCompagnieTable
