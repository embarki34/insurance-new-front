    import { useState } from "react"
    import {
      Table,
      TableBody,
      TableCell,
      TableHead,
      TableHeader,
      TableRow,
    } from "@/components/ui/table"
    import { Button } from "@/components/ui/button"
    import { Badge } from "@/components/ui/badge"
    import { Pen, Trash, AlertCircle, Eye, ArrowUpDown } from 'lucide-react'
    import Spinner from "@/components/ui/spinner"
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
    import { ZoneOutput } from '@/lib/output-Types'

    function Tabel({ zones, isLoading, onDelete, onDetails }: { zones: ZoneOutput[], isLoading: boolean, onDelete: (id: string) => void, onDetails: (id: string) => void }) {
      const [sortBy, setSortBy] = useState<keyof ZoneOutput>("name")
      const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

      const handleSort = (column: keyof ZoneOutput) => {
        if (sortBy === column) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
          setSortBy(column)
          setSortOrder("asc")
        }
      }

      const sortedData = [...zones].sort((a, b) => {
        if (!a[sortBy] || !b[sortBy]) return 0
        
        if (sortOrder === "asc") {
          return String(a[sortBy]).localeCompare(String(b[sortBy]))
        } else {
          return String(b[sortBy]).localeCompare(String(a[sortBy]))
        }
      })

      if (isLoading) {
        return (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        )
      }

      if (zones.length === 0) {
        return (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune donnée</h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
              Aucune zone n'est disponible actuellement.
            </p>
          </div>
        )
      }

      return (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px] text-center">#</TableHead>
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
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center">
                    Adresse
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "address" ? "opacity-100" : "opacity-50"}`} />
                  </div>
                </TableHead>
                <TableHead className="text-right">Sites</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((zone: ZoneOutput, index: number) => (
                <TableRow
                  key={zone.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{zone.address}</TableCell>
                  <TableCell className="text-right">
                    {zone.sites.slice(0, 4).map((site) => (
                      <Badge variant="outline" className="ml-2" key={site}>
                        {site}
                      </Badge>
                    ))}
                    {zone.sites.length > 4 && (
                      <Badge variant="outline" className="ml-2">
                        +{zone.sites.length - 4} autres
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 p-0"
                              onClick={() => onDetails(zone.id)}
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
                              className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => onDelete(zone.id)}
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
      )
    }

    export default Tabel