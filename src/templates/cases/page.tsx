"use client"

import { Suspense, useEffect, useState } from "react"
import { Search, Filter, AlertCircle, Paperclip,File } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { getCases, deleteCase, createCase } from "@/data/cases.service"
import { Case } from "@/lib/types"
import AddCase from "./add"
import Table from "./tabel"
import { toast } from "sonner"
import Pagination from "./pagination"
import { Pagination as PaginationType } from "@/lib/types"


function Cases() {
  const [caseList, setCaseList] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [refresh, setRefresh] = useState(false)
  const [pagination, setPagination] = useState<PaginationType>()

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true)
      try {
        const cases = await getCases()
        setCaseList(cases.cases)
        setFilteredCases(cases.cases)
        setPagination({
          currentPage: cases.pagination.currentPage,
          totalPages: cases.pagination.totalPages,
          totalItems: cases.pagination.totalItems,
          itemsPerPage: cases.pagination.itemsPerPage,
        })
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات")
        console.error("Error fetching cases:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [refresh])

  useEffect(() => {
    // Filter based on search query
    if (searchQuery) {
      const filtered = caseList.filter(
        (caseItem) =>
          caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          caseItem.id?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCases(filtered)
    } else {
      setFilteredCases(caseList)
    }
  }, [searchQuery, caseList])

  const deleteCaseFromTable = async (id: string) => {
    try {
      await deleteCase(id)
      setRefresh(!refresh)
      toast.success("تم حذف القضية بنجاح")
    } catch (error) {
      console.error("Error deleting case:", error)
      toast.error("حدث خطأ أثناء حذف القضية")
    }
  }

  const confirmDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه القضية؟")) {
      deleteCaseFromTable(id)
    }
  }

  const handleAdd = async () => {
    try {
      toast.success("تم إضافة القضية بنجاح")
      setRefresh(!refresh)
    } catch (error) {
      setRefresh(!refresh)
      toast.error("حدث خطأ أثناء إضافة القضية")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <File className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight"> القضايا</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                إضافة، إزالة، وإدارة القضايا.
              </p>
            </div>
            <AddCase onAdd={handleAdd} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>إجمالي القضايا</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : caseList.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">تم التحديث {new Date().toLocaleDateString("fr-FR")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>إجمالي الحالات</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  caseList.length
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                متوسط{" "}
                {isLoading
                  ? "-"
                  : Math.round(
                    caseList.length / (caseList.length || 1),
                  )}{" "}
                حالة لكل قضية
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="overflow-hidden border-border/40 shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  قائمة القضايا
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {filteredCases.length} من {caseList.length} قضية
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="بحث عن قضية..."
                    className="w-full pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">تصفية</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Spinner size="lg" />
                </div>
              }
            >
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4,5,6,7,8,9,10].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">لا توجد نتائج</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "لم يتم العثور على أي قضايا تطابق معايير البحث الخاصة بك."
                      : "لا توجد قضايا متاحة حالياً. يمكنك إضافة قضية جديدة باستخدام زر الإضافة."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      إعادة ضبط البحث
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <Table
                    cases={filteredCases as any}
                    onDelete={confirmDelete}
                    isLoading={isLoading}
                  />
                  {pagination && <Pagination pagination={pagination} />}
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              عرض {filteredCases.length} من {caseList.length} قضية
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                آخر تحديث: {new Date().toLocaleTimeString("fr-FR")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Cases
