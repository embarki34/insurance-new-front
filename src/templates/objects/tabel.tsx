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

// Object type definition
interface DynamicObject {
  id: string;
  name: string;
  type: string;
  properties: Record<string, string>;
}

interface TableComponentProps {
  objects: DynamicObject[];
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
  const [sortBy, setSortBy] = useState<keyof DynamicObject | "">('id')
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedObject, setSelectedObject] = useState<DynamicObject | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleSort = (column: keyof DynamicObject) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedData = [...objects].sort((a, b) => {
    if (!sortBy || !a[sortBy] || !b[sortBy]) return 0
    
    if (sortBy === 'properties') {
      // For properties object, we'll just compare the string representation
      return sortOrder === "asc" 
        ? JSON.stringify(a.properties).localeCompare(JSON.stringify(b.properties))
        : JSON.stringify(b.properties).localeCompare(JSON.stringify(a.properties))
    }
    
    if (sortOrder === "asc") {
      return String(a[sortBy]).localeCompare(String(b[sortBy]))
    } else {
      return String(b[sortBy]).localeCompare(String(a[sortBy]))
    }
  })

  const openDetails = (obj: DynamicObject) => {
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
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nom
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "name" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center">
                  Type
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "type" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead>Propriétés</TableHead>
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
                <TableCell className="font-medium">{object.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {object.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {Object.entries(object.properties).slice(0, 2).map(([key, value], i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                    
                    {Object.keys(object.properties).length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(object.properties).length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(object)}
                            className="h-8 w-8"
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
                              className="h-8 w-8"
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
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(object.id)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
                        <p className="text-sm font-medium text-muted-foreground">ID</p>
                        <p className="font-mono text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedObject.id}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom</p>
                        <p className="text-sm mt-1">{selectedObject.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-sm mt-1">
                          <Badge variant="secondary">
                            {selectedObject.type}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Properties */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Propriétés</CardTitle>
                    <CardDescription>
                      Toutes les propriétés définies pour cet objet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-0">
                      <AccordionItem value="item-0">
                        <AccordionTrigger>Voir toutes les propriétés</AccordionTrigger>
                        <AccordionContent>
                          <div className="border rounded-md overflow-hidden mt-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-center"> Clé</TableHead>
                                  <TableHead className="text-center">Valeur</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(selectedObject.properties).map(([key, value], index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell>{value}</TableCell>
                                  </TableRow>
                                ))}
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
