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
import { Pen, Trash, AlertCircle, Eye, ArrowUpDown, ChevronRight } from 'lucide-react'
import Spinner from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Parameter } from "@/lib/types"

function TableComponent({
  parameters = [],
  isLoading = false,
  onEdit = (_id:string) => {},
  onDelete = (_id:string) => {},
}) {
  const [sortBy, setSortBy] = useState<keyof Parameter>("key")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedType, setSelectedType] = useState<Parameter | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleSort = (column: keyof Parameter) => {
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

  const openDetails = (type: Parameter) => {
    setSelectedType(type)
    setDetailsOpen(true)
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
        <h3 className="text-lg font-medium">لا توجد بيانات</h3>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          لا توجد أنواع إجراءات ملاحظة متاحة حالياً. يمكنك إضافة نوع جديد باستخدام زر "إضافة معامل جديد".
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
                  المعرف
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "key" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("label")}
              >
                <div className="flex items-center">
                  الوصف
                  <ArrowUpDown className={`ml-2 h-4 w-4 ${sortBy === "label" ? "opacity-100" : "opacity-50"}`} />
                </div>
              </TableHead>
              <TableHead className="text-right">القيم</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((type: Parameter, index: number) => (
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
                            onClick={() => onEdit(type.id)} 
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
                            onClick={() => onDelete(type.id)}
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
             
              تفاصيل المعامل
            </DialogTitle>
            <DialogDescription>
              عرض كافة المعلومات والقيم المتاحة للمعامل
            </DialogDescription>
          </DialogHeader>

          {selectedType && (
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
                            {selectedType.key}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">الوصف</p>
                        <p className="font-medium mt-1">{selectedType.label}</p>
                      </div>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-muted-foreground">تم التحديث بواسطة</p>
                      <p className="mt-1">{selectedType.updatedBy}</p>
                    </div> */}
                  </CardContent>
                </Card>

                {/* Values */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">القيم المتاحة</CardTitle>
                    <CardDescription>
                      {selectedType.values.length} قيمة متاحة لهذا المعامل
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
                                  {values.linked_params.length} ارتباط
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {values.linked_params && values.linked_params.length > 0 ? (
                              <div className="space-y-3 pt-2">
                                <h4 className="text-sm font-medium">المعاملات المرتبطة:</h4>
                                <div className="space-y-3">
                                  {values.linked_params.map((param, i) => (
                                    <div key={i} className="bg-muted p-3 rounded-md">
                                      <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{param.param_key}</span>
                                      </div>
                                      <div className="mt-2">
                                        <p className="text-sm text-muted-foreground mb-1">القيم المسموح بها:</p>
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
                                لا توجد معاملات مرتبطة بهذه القيمة.
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
