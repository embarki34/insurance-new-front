"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, Filter, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { toast } from "sonner"
import { CompagnieOutput, InsuranceCampaniseOutput } from "@/lib/output-Types"
import { getCompagnies } from "@/data/societes.service"
import SocietesTable from "./table"
import CreateAssuranceCompagnie from "./creat-societes"
import CreateSocietes from "./creat-societes"

export default function SocietePage() {
  const [companies, setCompanies] = useState<CompagnieOutput[]>([])
  const [selectedCompany, setSelectedCompany] = useState<CompagnieOutput | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCompanies, setFilteredCompanies] = useState<CompagnieOutput[]>([])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const data = await getCompagnies()
      setCompanies(data)
      setFilteredCompanies(data)
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast.error("Échec de la récupération des compagnies")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    // Filter companies based on search query
    if (searchQuery) {
      const filtered = companies.filter(company => 
        company.informations_generales.raison_sociale.toLowerCase().includes(searchQuery.toLowerCase()) 
            // ||
            // company.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            // company.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
            // company.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCompanies(filtered)
    } else {
      setFilteredCompanies(companies)
    }
  }, [searchQuery, companies])

  const handleEdit = (company: CompagnieOutput) => {
    setSelectedCompany(company)
  }

  const handleSuccess = () => {
    setSelectedCompany(undefined)
    fetchCompanies()
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
                <Building2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Compagnies d'Assurance</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Gérer les compagnies d'assurance et leurs informations
              </p>
            </div>
            
            <CreateAssuranceCompagnie onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des compagnies</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : companies.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Dernière mise à jour {new Date().toLocaleDateString("fr-FR")}
              </div>
            </CardContent>
          </Card>

          <Card>
            {/* <CardHeader className="pb-2">
              <CardDescription>Compagnies actives</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  companies.filter(c => c.status === 'active').length
                )}
              </CardTitle>
            </CardHeader> */}
            {/* <CardContent>
              <div className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    {((companies.filter(c => c.status === 'active').length / companies.length) * 100).toFixed(1)}% des compagnies sont actives
                  </>
                )}
              </div>
            </CardContent> */}
          </Card>
        </div>

        {/* Main content */}
        <Card className="overflow-hidden border-border/40 shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Liste des compagnies
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {filteredCompanies.length} sur {companies.length} compagnies
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher une compagnie..."
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
              ) : filteredCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun résultat</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "Aucune compagnie ne correspond à vos critères de recherche."
                      : "Aucune compagnie disponible actuellement. Vous pouvez ajouter une nouvelle compagnie en utilisant le bouton de création."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                      Réinitialiser la recherche
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  <SocietesTable
                    companies={filteredCompanies}
                    onEdit={handleEdit}
                    onDelete={fetchCompanies}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Affichage de {filteredCompanies.length} sur {companies.length} compagnies
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Dernière mise à jour: {new Date().toLocaleTimeString("fr-FR")}
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>

      {selectedCompany && (
        <CreateSocietes
          company={selectedCompany}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
