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
import { Pen, Trash, AlertCircle, ArrowUpDown, Eye, X } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { contractOutput } from "@/lib/output-Types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function TableComponent({
  contracts,
  onEdit,
  onDelete,
  isLoading = false,
}: {
  contracts: contractOutput[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}) {
  const [sortBy, setSortBy] = useState<keyof contractOutput>("id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedCase, setSelectedCase] = useState<contractOutput | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [filters, setFilters] = useState({
    insuranceCompany: '',
    societe: '',
    type: ''
  })
  const router = useNavigate()

  // Get unique values for filters
  const uniqueInsuranceCompanies = Array.from(new Set(contracts.map(c => c.insuranceCompany.informations_generales.raison_sociale)))
  const uniqueSocietes = Array.from(new Set(contracts.map(c => c.societe.informations_generales.raison_sociale)))
  const uniqueTypes = Array.from(new Set(contracts.map(c => c.type_id)))

  // Filter data
  const filteredData = contracts.filter(contract => {
    return (
      (!filters.insuranceCompany || contract.insuranceCompany.informations_generales.raison_sociale === filters.insuranceCompany) &&
      (!filters.societe || contract.societe.informations_generales.raison_sociale === filters.societe) &&
      (!filters.type || contract.type_id === filters.type)
    )
  })

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!a[sortBy] || !b[sortBy]) return 0
    
    if (sortOrder === "asc") {
      return String(a[sortBy]).localeCompare(String(b[sortBy]))
    } else {
      return String(b[sortBy]).localeCompare(String(a[sortBy]))
    }
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column as keyof contractOutput)
      setSortOrder("asc")
    }
  }

  const resetFilters = () => {
    setFilters({
      insuranceCompany: '',
      societe: '',
      type: ''
    })
  }

  const openDetails = (caseItem: contractOutput) => {
    router(`/contracts/${caseItem.id}`, { state: caseItem })
    setSelectedCase(caseItem)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (contracts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">لا توجد بيانات</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Aucun cas n'est actuellement disponible. Vous pouvez ajouter un nouveau cas en utilisant le bouton "Ajouter un nouveau cas"..
        </p>
      </div>
    )
  }

  const handelTimeLeft = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <Select
          value={filters.insuranceCompany}
          onValueChange={(value) => setFilters(prev => ({ ...prev, insuranceCompany: value }))}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Insurance Company" />
          </SelectTrigger>
          <SelectContent>
            {uniqueInsuranceCompanies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.societe}
          onValueChange={(value) => setFilters(prev => ({ ...prev, societe: value }))}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Société Assurée" />
          </SelectTrigger>
          <SelectContent>
            {uniqueSocietes.map((societe) => (
              <SelectItem key={societe} value={societe}>
                {societe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filters.insuranceCompany || filters.societe || filters.type) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFilters}
            className="w-8 h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Rest of the table code remains the same, just use sortedData instead of contracts */}
        <Table>
          {/* ... existing TableHeader ... */}
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px] text-center">#</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Policy Number
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "id" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("type_id")}
              >
                <div className="flex items-center">
                  Type
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "type_id" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead>Company D'Assurance</TableHead>
              <TableHead>Société Assurée</TableHead>
              <TableHead>Insured Amount (DZD)</TableHead>
              <TableHead>Prime Amount (DZD)</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Time Left</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((contractItem: contractOutput, index: number) => (
              <TableRow
                key={contractItem.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">
                  <Badge variant="outline" className="font-mono">
                    {contractItem.policyNumber}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Badge variant="outline" className="font-mono">
                    {contractItem.type_id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{contractItem.insuranceCompany.informations_generales.raison_sociale}</TableCell>
                <TableCell className="font-medium">{contractItem.societe.informations_generales.raison_sociale}</TableCell>
                <TableCell className="font-medium">{contractItem.insuredAmount} DZD</TableCell>
                <TableCell className="font-medium">{contractItem.primeAmount} DZD</TableCell>
                <TableCell className="font-medium">{new Date(contractItem.startDate).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="font-medium">{new Date(contractItem.endDate).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="font-medium">
                  <Badge variant="secondary" className="font-mono">
                    {handelTimeLeft(contractItem.startDate, contractItem.endDate)} days
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 space-x-reverse justify-end">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDetails(contractItem)}
                            className="w-8 h-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>عرض التفاصيل</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit?.(contractItem.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Pen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>تعديل</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete?.(contractItem.id)}
                            className="w-8 h-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>حذف</p>
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

      {/* Keep the existing Dialog component */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {/* ... existing Dialog content ... */}
      </Dialog>
    </div>
  )
}

export default TableComponent