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
import { Pen, Trash, AlertCircle,  ArrowUpDown } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { contract  } from "@/lib/output-Types"



  
function TableComponent({
  contracts,
  onEdit,
  onDelete,
  isLoading = false,
}: {
  contracts: contract[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}) {
  const [sortBy, setSortBy] = useState<keyof contract>("id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedCase, setSelectedCase] = useState<contract | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const router = useNavigate()
  const handleSort = (column: keyof contract) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedData = [...contracts].sort((a, b) => {
    if (!a[sortBy] || !b[sortBy]) return 0
    
    if (sortOrder === "asc") {
      return String(a[sortBy]).localeCompare(String(b[sortBy]))
    } else {
      return String(b[sortBy]).localeCompare(String(a[sortBy]))
    }
  })

  const openDetails = (caseItem: contract) => {
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
          لا توجد قضايا متاحة حالياً. يمكنك إضافة قضية جديدة باستخدام زر "إضافة قضية جديدة".
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
                  المعرف
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "id" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  العنوان
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "name" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead>التفاصيل</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((contractItem: contract, index: number) => (
              <TableRow
                key={contractItem.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">
                  <Badge variant="outline" className="font-mono">
                    {contractItem.id}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{contractItem.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {Array.isArray(contractItem.description) ? (
                      contractItem.description.map((description: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {description}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {contractItem.description}
                      </Badge>
                    )}
                    {Array.isArray(contractItem.description) && contractItem.description.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contractItem.description.length - 3}
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
                            onClick={() => openDetails(contractItem)}
                            className="w-24 h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90 text-sm hover:text-primary-foreground/90 text-center"
                          >
                             التفاصيل
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} >
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              تفاصيل القضية
            </DialogTitle>
            <DialogDescription>
              عرض كافة المعلومات والتفاصيل المتاحة للقضية
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6" dir="rtl">
                {/* Basic Information */}
                <Card >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">معلومات أساسية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">المعرف</p>
                        <p className="font-mono text-sm mt-1">
                          <Badge variant="outline" className="font-mono">
                            {selectedCase.id}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">العنوان</p>
                        <p className="font-medium mt-1">{selectedCase.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">التفاصيل المتاحة</CardTitle>
                    <CardDescription>
                      {selectedCase.description.length} تفاصيل متاحة لهذه القضية
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {Array.isArray(selectedCase.description) && selectedCase.description.map((detail, index) => (
                        <AccordionItem key={index} value={`detail-${index}`}>
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-left">
                              <span className="font-medium">{detail}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground py-2">
                              تفاصيل إضافية حول {detail}.
                            </p>
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
