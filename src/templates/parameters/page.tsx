"use client"

import { Suspense, useEffect, useState } from "react"
import { Settings, Search, Paperclip, Filter, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { getParameters, deleteParameter } from "@/data/parameters.service"
import { parameter } from "@/lib/output-Types"
import AddParameter from "./add"
import Tabel from "./tabel"
import { toast } from "sonner"

function parameters() {
  const [noticeProcessTypes, setNoticeProcessTypes] = useState<parameter[]>([])
  const [filteredTypes, setFilteredTypes] = useState<parameter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    const fetchNoticeProcessTypes = async () => {
      setIsLoading(true)
      try {
        const types = await getParameters()
        setNoticeProcessTypes(types)
        setFilteredTypes(types)
      } catch (error) {
        toast.error("Une erreur est survenue lors de la récupération des données")
        console.error("Error fetching parameters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNoticeProcessTypes()
  }, [refresh])

  useEffect(() => {
    // Filter based on search query
    if (searchQuery) {
      const filtered = noticeProcessTypes.filter(
        (type) =>
          type.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          type.key?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredTypes(filtered)
    } else {
      setFilteredTypes(noticeProcessTypes)
    }
  }, [searchQuery, noticeProcessTypes])

  const deleteNoticeProcessTypeFromTable = async (id: string) => {
    try {
      await deleteParameter(id)
      setRefresh(!refresh)
      toast.success("Le paramètre a été supprimé avec succès")
    } catch (error) {
      console.error("Error deleting parameter:", error)
      toast.error("Une erreur est survenue lors de la suppression du paramètre")
    }
  }

  const confirmDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paramètre ?")) {
      deleteNoticeProcessTypeFromTable(id)
    }
  }
  const handleClose = () => {
    setRefresh(!refresh)
  }

  const handleAdd = (response: any) => {
    setNoticeProcessTypes([...noticeProcessTypes, response])
    setRefresh(!refresh)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Paramètres des transactions</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajouter, supprimer et gérer les paramètres des transactions et les valeurs autorisées.
              </p>
            </div>
            <AddParameter onAdd={handleAdd} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des transactions</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : noticeProcessTypes.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Mis à jour {new Date().toLocaleDateString("fr-FR")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des valeurs</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  noticeProcessTypes.reduce((acc, type) => acc + type.values.length, 0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Moyenne{" "}
                {isLoading
                  ? "-"
                  : Math.round(
                      noticeProcessTypes.reduce((acc, type) => acc + type.values.length, 0) /
                        (noticeProcessTypes.length || 1),
                    )}{" "}
                valeur par paramètre
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
                  Liste des paramètres
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {filteredTypes.length} sur {noticeProcessTypes.length} paramètres
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un paramètre..."
                    className="w-full pl-8 bg-background"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filtrer</span>
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
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun résultat</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "Aucun paramètre ne correspond à vos critères de recherche."
                      : "Aucun paramètre disponible actuellement. Vous pouvez ajouter un nouveau paramètre en utilisant le bouton d'ajout."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Réinitialiser la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <Tabel
                    parameters={filteredTypes as any}
                    onDelete={confirmDelete}
                    isLoading={isLoading}
                    
                    onClose={handleClose}
                  />
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredTypes.length} sur {noticeProcessTypes.length} paramètres
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dernière mise à jour : {new Date().toLocaleTimeString("fr-FR")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default parameters
