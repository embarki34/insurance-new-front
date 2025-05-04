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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { garantiesOutput } from "@/lib/output-Types"
import { deleteGarantie } from "@/data/garanties.service"
import { toast } from "sonner"
import {  Trash2, AlertCircle, ArrowUpDown, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import Spinner from "@/components/ui/spinner"
import { formatDate } from "@/lib/format"

interface GarantiesTableProps {
  garanties: garantiesOutput[]
  onEdit: (garantie: garantiesOutput) => void
  onDelete: () => void
  isLoading?: boolean
}

const GarantiesTable = ({ garanties,  onDelete, isLoading = false }: GarantiesTableProps) => {
  const [sortBy, setSortBy] = useState<keyof garantiesOutput | "">('id')
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedGaranties, setSelectedGaranties] = useState<string[]>([])
  const [selectedGarantie, setSelectedGarantie] = useState<garantiesOutput | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSort = (column: keyof garantiesOutput) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedData = [...garanties].sort((a, b) => {
    if (!sortBy || !a[sortBy] || !b[sortBy]) return 0
    
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortOrder === "asc") {
      return String(aValue).localeCompare(String(bValue))
    } else {
      return String(bValue).localeCompare(String(aValue))
    }
  })



  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      await deleteGarantie(id)
      toast.success("Garantie supprimée avec succès")
      onDelete()
    } catch (error) {
      console.error("Error deleting garantie:", error)
      toast.error("Erreur lors de la suppression de la garantie")
    } finally {
      setIsDeleting(false)
    }
  }

  const openDetails = (garantie: garantiesOutput) => {
    setSelectedGarantie(garantie)
    setDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (garanties.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucune donnée</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Aucune garantie disponible actuellement. Vous pouvez ajouter une nouvelle garantie en utilisant le bouton de création.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedGaranties.length > 0 && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  selectedGaranties.forEach(id => handleDelete(id))
                  setSelectedGaranties([])
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedGaranties.length})
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("code")}
                >
                  <div className="flex items-center">
                    Code
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "code" ? "opacity-100" : "opacity-50"}`} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("label")}
                >
                  <div className="flex items-center">
                    Label
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "label" ? "opacity-100" : "opacity-50"}`} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("guarantee_type")}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "guarantee_type" ? "opacity-100" : "opacity-50"}`} />
                  </div>
                </TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Franchise</TableHead>
                <TableHead>Compagnie</TableHead>
                <TableHead>Validité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((garantie) => (
                <TableRow
                  key={garantie.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                
                  <TableCell className="font-mono text-sm">
                    <Badge variant="outline" className="font-mono">
                      {garantie.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{garantie.label}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {garantie.guarantee_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{garantie.rate}%</TableCell>
                  <TableCell>{garantie.deductible}</TableCell>
                  <TableCell>{garantie.insurance_company}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{formatDate(garantie.validity_date.toString())}</span>
                      <span className="text-xs text-muted-foreground">
                        {garantie.validity_duration_months} mois
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetails(garantie)}
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

                      {/* <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(garantie)}
                              className="h-8 w-8"
                            >
                              <Pen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Éditer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider> */}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(garantie.id)}
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
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Détails de la garantie
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la garantie
            </DialogDescription>
          </DialogHeader>

          {selectedGarantie && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations de base</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Code</p>
                        <p className="font-mono text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedGarantie.code}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Label</p>
                        <p className="text-sm mt-1">{selectedGarantie.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-sm mt-1">
                          <Badge variant="secondary">
                            {selectedGarantie.guarantee_type}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taux</p>
                        <p className="text-sm mt-1">{selectedGarantie.rate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Franchise</p>
                        <p className="text-sm mt-1">{selectedGarantie.deductible}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Compagnie</p>
                        <p className="text-sm mt-1">{selectedGarantie.insurance_company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Détails supplémentaires</CardTitle>
                    <CardDescription>
                      Informations sur la validité et les exclusions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-0">
                      <AccordionItem value="item-0">
                        <AccordionTrigger>Validité et exclusions</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Date de validité</p>
                              <p className="text-sm mt-1">{formatDate(selectedGarantie.validity_date.toString())}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Durée de validité</p>
                              <p className="text-sm mt-1">{selectedGarantie.validity_duration_months} mois</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Exclusions</p>
                              <div className="mt-2 space-y-2">
                                {selectedGarantie.exclusions.map((exclusion, index) => (
                                  <Badge key={index} variant="outline" className="mr-2">
                                    {exclusion}
                                  </Badge>
                                ))}
                                {selectedGarantie.exclusions.length === 0 && (
                                  <p className="text-sm text-muted-foreground">Aucune exclusion</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
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

export default GarantiesTable 