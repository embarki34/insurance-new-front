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
import { Pen, Trash, AlertCircle, Eye, ArrowUpDown, ChevronRight, Plus, Loader2 } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parameter } from "@/lib/output-Types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateParameter } from "@/data/parameters.service"

function TableComponent({
  parameters = [],
  isLoading = false,
  onEdit = (_id:string) => {},
  onDelete = (_id:string) => {},
  onClose = () => {}, // Added onClose callback

}) {
  const [sortBy, setSortBy] = useState<keyof parameter>("key")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedType, setSelectedType] = useState<parameter | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newValue, setNewValue] = useState({ key: "", label: "" })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSort = (column: keyof parameter) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedData = [...parameters].sort((a, b) => {
    if (!a[sortBy] || !b[sortBy]) return 0
    
    if (sortOrder === "asc") {
      return String(a[sortBy]).localeCompare(String(b[sortBy]))
    } else {
      return String(b[sortBy]).localeCompare(String(a[sortBy]))
    }
  })

  const openDetails = (type: parameter) => {
    setSelectedType(type)
    setDetailsOpen(true)
    setIsEditMode(false)
    setNewValue({ key: "", label: "" })
  }

  const handleValueDelete = async (valueIndex: number) => {
    if (!selectedType || !isEditMode) return

    try {
      setIsUpdating(true)
      const updatedValues = selectedType.values.filter((_, index) => index !== valueIndex)
      const updatedParameter = {
        ...selectedType,
        values: updatedValues
      }

      await updateParameter(selectedType.id, {
        key: selectedType.key,
        label: selectedType.label,
        values: updatedValues
      })

      setSelectedType(updatedParameter)
      onEdit(selectedType.id)
      toast.success("La valeur a été supprimée avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression de la valeur :", error)
      toast.error("Une erreur s'est produite lors de la suppression de la valeur")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddValue = async () => {
    if (!selectedType || !newValue.key || !newValue.label) return

    try {
      setIsUpdating(true)
      const updatedValues = [...selectedType.values, { ...newValue, linked_params: [] }]
      const updatedParameter = {
        ...selectedType,
        values: updatedValues
      }

      await updateParameter(selectedType.id, {
        key: selectedType.key,
        label: selectedType.label,
        values: updatedValues
      })

      setSelectedType(updatedParameter)
      onEdit(selectedType.id)
      setNewValue({ key: "", label: "" })
      toast.success("La valeur a été ajoutée avec succès")
    } catch (error) {
      console.error("Erreur lors de l'ajout de la valeur :", error)
      toast.error("Une erreur s'est produite lors de l'ajout de la valeur")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (parameters.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucune donnée disponible</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Aucun type d'action n'est actuellement disponible. Vous pouvez ajouter un nouveau type en utilisant le bouton "Ajouter un nouveau paramètre".
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
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("key")}
              >
                <div className="flex items-center">
                  Identifiant
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "key" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("label")}
              >
                <div className="flex items-center">
                  Description
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "label" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead className="text-right">Valeurs</TableHead>
              <TableHead className="text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((type: parameter, index: number) => (
              <TableRow
                key={type.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">
                  <Badge variant="outline" className="font-mono">
                    {type.key}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{type.label}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {type.values.slice(0, 3).map((values, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {values.label}
                      </Badge>
                    ))}
                    {type.values.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{type.values.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(type)}
                            className="w-8 h-8 p-0"
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
                            onClick={() => onEdit(type.id)} 
                            className="w-8 h-8 p-0"
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(type.id)}
                            className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
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

      {/* Détails du dialogue */}
      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) {
          onClose(); // Appeler onClose lorsque le dialogue est fermé
        }
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Détails du paramètre
              <Button
                variant="ghost"
                size="icon"
                className={`ml-auto h-8 w-8 ${isEditMode ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setIsEditMode(!isEditMode)}
                disabled={isUpdating}
              >
                <Pen className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Afficher toutes les informations et valeurs disponibles pour le paramètre
            </DialogDescription>
          </DialogHeader>

          {selectedType && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6" dir="rtl">
                {/* Carte d'informations de base */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations de base</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Identifiant</p>
                        <p className="font-mono text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedType.key}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="font-medium mt-1">{selectedType.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Carte des valeurs */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Valeurs disponibles</CardTitle>
                    <CardDescription>
                      {selectedType.values.length} valeur(s) disponible(s) pour ce paramètre
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditMode && (
                      <div className="mb-6 space-y-4 border rounded-lg p-4">
                        <h4 className="font-medium">Ajouter une nouvelle valeur</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-key">Identifiant</Label>
                            <Input
                              id="new-key"
                              value={newValue.key}
                              onChange={(e) => setNewValue(prev => ({ ...prev, key: e.target.value }))}
                              className="mt-1.5"
                              dir="ltr"
                              disabled={isUpdating}
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-label">Description</Label>
                            <Input
                              id="new-label"
                              value={newValue.label}
                              onChange={(e) => setNewValue(prev => ({ ...prev, label: e.target.value }))}
                              className="mt-1.5"
                              disabled={isUpdating}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={handleAddValue}
                            disabled={!newValue.key || !newValue.label || isUpdating}
                            className="gap-1"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    )}

                    <Accordion type="multiple" className="w-full">
                      {selectedType.values.map((values, index) => (
                        <AccordionItem key={index} value={`values-${index}`}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-left">
                              <span className="font-medium">{values.label}</span>
                              <Badge variant="outline" className="font-mono text-xs">
                                {values.key}
                              </Badge>
                              {values.linked_params && values.linked_params.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {values.linked_params.length} lien(s)
                                </Badge>
                              )}
                              {isEditMode && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-auto text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleValueDelete(index)
                                  }}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {values.linked_params && values.linked_params.length > 0 ? (
                              <div className="space-y-3 pt-2">
                                <h4 className="text-sm font-medium">Paramètres liés :</h4>
                                <div className="space-y-3">
                                  {values.linked_params.map((param, i) => (
                                    <div key={i} className="bg-muted p-3 rounded-md">
                                      <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{param.param_key}</span>
                                      </div>
                                      <div className="mt-2">
                                        <p className="text-sm text-muted-foreground mb-1">Valeurs autorisées :</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {param.allowed_values.map((val: string, j: number) => (
                                            <Badge key={j} variant="outline" className="text-xs">
                                              {val}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">
                                Aucun paramètre lié à cette valeur.
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
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

export default TableComponent
