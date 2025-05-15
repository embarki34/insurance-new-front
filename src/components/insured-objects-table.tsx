import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Shield, FileText, Award, Filter, X, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { InsuredListbyContract } from "@/lib/output-Types"

interface InsuredObjectsTableProps {
  insuredList: InsuredListbyContract[]
}

export function InsuredObjectsTable({ insuredList }: InsuredObjectsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedGaranties, setSelectedGaranties] = React.useState<string[]>([])
  const [selectedObject, setSelectedObject] = React.useState<InsuredListbyContract | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Get unique garantie codes for filtering
  const uniqueGaranties = React.useMemo(() => {
    const garantieCodes = new Set<string>()
    insuredList.forEach((insured) => {
      insured.garanties.forEach((garantie) => {
        garantieCodes.add(garantie.code)
      })
    })
    return Array.from(garantieCodes)
  }, [insuredList])

  // Filter the data based on search term and selected garanties
  const filteredData = React.useMemo(() => {
    return insuredList.filter((insured) => {
      const matchesSearch =
        searchTerm === "" ||
        insured.object.objectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insured.object.details.some((detail) =>
          String(detail.value).toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        insured.garanties.some(
          (garantie) =>
            garantie.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            garantie.label.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesGaranties =
        selectedGaranties.length === 0 ||
        insured.garanties.some((garantie) => selectedGaranties.includes(garantie.code))

      return matchesSearch && matchesGaranties
    })
  }, [insuredList, searchTerm, selectedGaranties])

  const toggleGarantie = (code: string) => {
    setSelectedGaranties((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedGaranties([])
  }

  const showGarantieDetails = (insured: InsuredListbyContract) => {
    setSelectedObject(insured)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Input
            placeholder="Rechercher des objets assurés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          {(searchTerm || selectedGaranties.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer par garantie
              {selectedGaranties.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedGaranties.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {uniqueGaranties.map((code) => (
              <DropdownMenuCheckboxItem
                key={code}
                checked={selectedGaranties.includes(code)}
                onCheckedChange={() => toggleGarantie(code)}
              >
                {code}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Objet</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>Garanties</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((insured, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-cyan-600" />
                    <span>{insured.object.objectName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>{insured.object.details.map((detail) => String(detail.value)).join(", ")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-2">
                      {insured.garanties.map((garantie, gIndex) => (
                        <Badge
                          key={gIndex}
                          variant="outline"
                          className="flex items-center space-x-1 bg-cyan-50 text-cyan-700 border-cyan-200"
                        >
                          <Award className="h-3 w-3" />
                          <span>{garantie.code}</span>
                        </Badge>
                      ))}
                    </div>
                   
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="ml-2" onClick={() => showGarantieDetails(insured)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Détails de l'objet assuré
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur l'objet et ses garanties
            </DialogDescription>
          </DialogHeader>

          {selectedObject && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Basic Object Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Informations de l'objet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nom de l'objet</p>
                        <p className="text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedObject.object.objectName}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type d'objet</p>
                        <p className="text-sm mt-1">
                          <Badge variant="secondary">
                            {selectedObject.object.objectType}
                          </Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Object Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Détails de l'objet</CardTitle>
                    <CardDescription>
                      Caractéristiques spécifiques de l'objet assuré
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedObject.object.details.map((detail, index) => (
                        <div key={index}>
                          <p className="text-sm font-medium text-muted-foreground">{detail.key}</p>
                          <p className="text-sm mt-1">{detail.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Guarantees Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Garanties</CardTitle>
                    <CardDescription>
                      Liste des garanties associées à cet objet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {selectedObject.garanties.map((garantie, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-cyan-600" />
                              <span className="font-medium">{garantie.code}</span>
                              <Badge variant="outline" className="ml-2">
                                {garantie.label}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-muted-foreground">Franchise</p>
                                  <p className="text-sm mt-1">{garantie.deductible}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-muted-foreground">Taux</p>
                                  <p className="text-sm mt-1">{garantie.rate}%</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-muted-foreground">Durée</p>
                                  <p className="text-sm mt-1">{garantie.validity_duration_months} mois</p>
                                </div>
                              </div>
                              
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm mt-1">{garantie.description}</p>
                              </div>
                            </div>
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
    </div>
  )
} 