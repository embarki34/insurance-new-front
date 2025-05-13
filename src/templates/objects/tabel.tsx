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
import { Pen, Trash, AlertCircle, ArrowUpDown, Eye } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ObjectOutput, Detail } from "@/lib/output-Types"

interface TableComponentProps {
  objects: ObjectOutput[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const TableComponent = ({
  objects,
  onEdit,
  onDelete,
  isLoading = false,
}: TableComponentProps) => {
  const [sortBy, setSortBy] = useState<keyof ObjectOutput | "">('id')
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedObject, setSelectedObject] = useState<ObjectOutput | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  console.log("this is the objects", objects)

  const handleSort = (column: keyof ObjectOutput) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedData = [...objects].sort((a, b) => {
    if (!sortBy || !a[sortBy] || !b[sortBy]) return 0

    if (sortBy === 'details') {
      const aDetails = a.details || []
      const bDetails = b.details || []
      return sortOrder === "asc"
        ? JSON.stringify(aDetails).localeCompare(JSON.stringify(bDetails))
        : JSON.stringify(bDetails).localeCompare(JSON.stringify(aDetails))
    }

    return sortOrder === "asc"
      ? String(a[sortBy]).localeCompare(String(b[sortBy]))
      : String(b[sortBy]).localeCompare(String(a[sortBy]))
  })

  const openDetails = (obj: ObjectOutput) => {
    setSelectedObject(obj)
    setDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (objects.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucune donnée</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Aucun objet disponible actuellement. Vous pouvez ajouter un nouvel objet en utilisant le bouton de création.
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
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  ID
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "id" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("objectName")}
              >
                <div className="flex items-center">
                  Nom
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "objectName" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("objectType")}
              >
                <div className="flex items-center">
                  type
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "objectType" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead>
                  Type de batiment
              </TableHead>
              <TableHead>Détails</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((object, index) => (
              <TableRow
                key={object.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">
                  <Badge variant="outline" className="font-mono">
                    {object.id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{object.objectName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {object.objectType}
                  </Badge>

                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="ml-2">
                    {object.details?.filter(d => d.key === 'type').map(d => d.value)}
                  </Badge>
                </TableCell>


                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(object.details || []).slice(0, 2).map((detail, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {detail.key}: {String(detail.value)}
                      </Badge>
                    ))}

                    {(object.details?.length || 0) > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{(object.details?.length || 0) - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 justify-end gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(object)}
                            className="h-4 w-4"
                          >
                            <Eye className="h-8 w-8" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voir les détails</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {onEdit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(object.id)}
                              className="h-4 w-4"
                            >
                              <Pen className="h-8 w-8" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Éditer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {onDelete && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(object.id)}
                              className="h-4 w-4 text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Supprimer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
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
              Détails de l'objet
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur l'objet et ses propriétés
            </DialogDescription>
          </DialogHeader>

          {selectedObject && (
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
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-sm mt-1">
                          <Badge variant="secondary">
                            {selectedObject.objectType}
                          </Badge>
                          <Badge variant="secondary" className="ml-2">
                            {selectedObject.details?.filter(d => d.key === 'type').map(d => d.value)}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ID</p>
                        <p className="font-mono text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedObject.id}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom</p>
                        <p className="text-sm mt-1">{selectedObject.objectName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                        <p className="text-sm mt-1">{new Date(selectedObject.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                        <p className="text-sm mt-1">{new Date(selectedObject.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Détails</CardTitle>
                    <CardDescription>
                      Propriétés et caractéristiques détaillées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                      <AccordionItem value="item-0">
                        <AccordionTrigger className="hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-2">
                            <span>Voir tous les détails</span>
                            <Badge variant="outline" className="ml-2">
                              {selectedObject.details?.filter(d => d.key !== 'type').length || 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <div className="border rounded-lg overflow-hidden bg-slate-50/50">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="text-left font-semibold text-slate-700">Propriété</TableHead>
                                  <TableHead className="text-right font-semibold text-slate-700">Valeur</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(selectedObject.details || [])
                                  .filter(detail => detail.key !== 'type')
                                  .map((detail, index) => (
                                    <TableRow key={index} className="hover:bg-slate-100 transition-colors">
                                      <TableCell className="font-medium text-slate-900">
                                        {detail.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Badge variant="secondary" className="font-mono">
                                          {String(detail.value)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                {(!selectedObject.details || selectedObject.details.filter(d => d.key !== 'type').length === 0) && (
                                  <TableRow>
                                    <TableCell colSpan={2} className="text-center py-8">
                                      <div className="flex flex-col items-center gap-2 text-slate-500">
                                        <AlertCircle className="h-5 w-5" />
                                        <p>Aucun détail disponible</p>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
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

export default TableComponent
