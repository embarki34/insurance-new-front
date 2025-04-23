"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Box, Search, Filter, AlertCircle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { toast } from "sonner"
import CreateObjects from "./creatObjects"
import TableComponent from "./tabel"
// import Pagination from "./pagination"
import { deleteObject, getObjects } from "@/data/object.service"
import { ObjectOutput } from "@/lib/output-Types"
// This is a placeholder for your API service
// You should replace this with actual API calls


// Object type definition
interface DynamicObject {
  id: string;
  name: string;
  type: string;
  properties: Record<string, string>;
}

// Pagination type
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Objects() {
  const [objects, setObjects] = useState<ObjectOutput[]>([])
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [filteredObjects, setFilteredObjects] = useState<ObjectOutput[]>([])

  useEffect(() => {
    const fetchObjects = async () => {
      setIsLoading(true)
      try {
        const { objects, pagination } = await getObjects()
        console.log(objects)
        setObjects(objects || [])
        setPagination(pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10
        })
      } catch (error) {
        console.error("Error fetching objects:", error)
        toast.error("Échec de la récupération des objets")
        setObjects([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchObjects()
  }, [refresh])

  useEffect(() => {
    // Filter objects based on search query
    if (searchQuery) {
      const filtered = objects.filter(obj => 
        obj.objectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(obj.details).some(value => 
          value.value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredObjects(filtered)
    } else {
      setFilteredObjects(objects)
    }
  }, [searchQuery, objects])

  const handleDeleting = async (id: string) => {
    const isConfirmed = confirm("Voulez-vous vraiment supprimer cet objet ?")
    if (!isConfirmed) return
    try {
      await deleteObject(id)
      setRefresh(!refresh)
      toast.success("Objet supprimé avec succès")
    } catch (error) {
      console.error("Error deleting object:", error)
      toast.error("Échec de la suppression de l'objet")
    }
  }

  const handleObjectsCreated = () => {
    setRefresh(!refresh)
    toast.success("Les objets ont été ajoutés avec succès")
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const mapToTableFormat = (objects: ObjectOutput[]): DynamicObject[] => {
    return objects.map(obj => ({
      id: obj.id || String(Math.random()),
      name: obj.details.find(d => d.key === 'name')?.value || obj.objectType,
      type: obj.objectType,
      properties: obj.details.reduce((acc, detail) => {
        acc[detail.key] = detail.value.toString();
        return acc;
      }, {} as Record<string, string>)
    }));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Gestion des Objets</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Créer, gérer et organiser vos objets dynamiques.
              </p>
            </div>
            
            <CreateObjects onObjectsCreated={handleObjectsCreated} />
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des objets</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : objects.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour {new Date().toLocaleDateString("fr-FR")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Types d'objets</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  Array.isArray(objects) && objects.length > 0 
                    ? new Set(objects.map(obj => obj.objectType)).size
                    : 0
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    Objets uniques par type: {(
                      Array.isArray(objects) && objects.length > 0 
                        ? (objects.length / (new Set(objects.map(obj => obj.objectType)).size || 1)).toFixed(1)
                        : "0.0"
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <Card className="overflow-hidden border-border/40 shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" />
                  Liste des objets
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {filteredObjects.length} sur {objects.length} objets
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un objet..."
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
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredObjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun résultat</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "Aucun objet ne correspond à vos critères de recherche."
                      : "Aucun objet disponible actuellement. Vous pouvez ajouter un nouvel objet en utilisant le bouton de création."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Réinitialiser la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <TableComponent
                    objects={mapToTableFormat(filteredObjects)}
                    onDelete={handleDeleting}
                    isLoading={isLoading}
                  />
                  {/* {pagination && <Pagination pagination={pagination} />} */}
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredObjects.length} sur {objects.length} objets
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
