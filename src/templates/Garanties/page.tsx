"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, Filter, AlertCircle, } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { toast } from "sonner"
import { garantiesOutput } from "@/lib/output-Types"
import { getGaranties } from "@/data/garanties.service"
import GarantiesTable from "./tabel"
import CreateGarantie from "./createGarantie"

export default function GarantiesPage() {
  const [garanties, setGaranties] = useState<garantiesOutput[]>([])
  const [selectedGarantie, setSelectedGarantie] = useState<garantiesOutput | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredGaranties, setFilteredGaranties] = useState<garantiesOutput[]>([])

  const fetchGaranties = async () => {
    try {
      setIsLoading(true)
      const data = await getGaranties()
      setGaranties(data)
      setFilteredGaranties(data)
    } catch (error) {
      console.error("Error fetching garanties:", error)
      toast.error("Échec de la récupération des garanties")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGaranties()
  }, [])

  useEffect(() => {
    // Filter garanties based on search query
    if (searchQuery) {
      const filtered = garanties.filter(garantie => 
        garantie.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garantie.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garantie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garantie.guarantee_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        garantie.insurance_company.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredGaranties(filtered)
    } else {
      setFilteredGaranties(garanties)
    }
  }, [searchQuery, garanties])

  const handleEdit = (garantie: garantiesOutput) => {
    setSelectedGarantie(garantie)
  }

  const handleSuccess = () => {
    setSelectedGarantie(undefined)
    fetchGaranties()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Gestion des Garanties</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Créer et gérer les garanties d'assurance.
              </p>
            </div>
            
            <CreateGarantie onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des garanties</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : garanties.length}
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
              <CardDescription>Types de garanties</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  new Set(garanties.map(g => g.guarantee_type)).size
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    Garanties par type: {(
                      garanties.length / (new Set(garanties.map(g => g.guarantee_type)).size || 1)
                    ).toFixed(1)}
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
                  <Shield className="h-4 w-4 text-primary" />
                  Liste des garanties
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {filteredGaranties.length} sur {garanties.length} garanties
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher une garantie..."
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
              ) : filteredGaranties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun résultat</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "Aucune garantie ne correspond à vos critères de recherche."
                      : "Aucune garantie disponible actuellement. Vous pouvez ajouter une nouvelle garantie en utilisant le bouton de création."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Réinitialiser la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <GarantiesTable
                    garanties={filteredGaranties}
                    onEdit={handleEdit}
                    onDelete={fetchGaranties}
                  />
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredGaranties.length} sur {garanties.length} garanties
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>

      {selectedGarantie && (
        <CreateGarantie
          garantie={selectedGarantie}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
