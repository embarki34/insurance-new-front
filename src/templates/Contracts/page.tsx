// import AddContract from "./add"
import TableComponent from "./tabel"
import { useState, useEffect, Suspense } from "react"
import { deleteContract, getContracts } from "@/data/contracts.service"
import { contract } from "@/lib/output-Types"
import { toast } from "sonner"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Pagination from "../parameters/pagination"
import { File, Search, Filter, AlertCircle, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Spinner from "@/components/ui/spinner"
import { pagination as paginationType } from "@/lib/output-Types"
import AddCase from "./newAdd"
import AddContract from "./newAdd"
// import CreateObjects from "../objects/creatObjects"













export default function Contracts() {
  const [contracts, setContracts] = useState<contract[]>([])
  const [refresh, setRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<paginationType | null>(null)

  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true)
      const { contracts, pagination } = await getContracts()
      setContracts(contracts)
      setPagination(pagination)
      setIsLoading(false)
    }
    fetchContracts()
  }, [refresh])

  const handleDeleting = async (id: string) => {
    try {
      await deleteContract(id)
      toast.success("Contrat supprimé avec succès")
    } catch (error) {
      toast.error("Échec de la suppression du contrat")
    }
  }

  const handleEditing = (id: string) => {
    console.log(id)
  }
  const handleAdding = () => {
    setRefresh(!refresh)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-background " >
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* Section d'en-tête */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <File className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Contrats d'assurance</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Ajouter, supprimer et gérer les contrats d'assurance.
              </p>
            </div>
            {/* <AddContract onAdd={handleAdding} /> */}

            {/* <CreateObjects
              onObjectsCreated={(objects) => {
                // Do something with the created objects
                console.log("Created objects:", objects);
                handleAdding()
              }}
            /> */}
            <AddContract onAdd={handleAdding} />
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des contrats d'assurance</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : contracts.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Dernière mise à jour {new Date().toLocaleDateString("fr-FR")}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total des contrats d'assurance</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  contracts.length
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Moyenne{" "}
                {isLoading
                  ? "-"
                  : Math.round(
                    contracts.length / (contracts.length || 1),
                  )}{" "}
                contrat par contrat
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Card className="overflow-hidden border-border/40 shadow-sm">
          <CardHeader className="bg-muted/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-primary" />
                  Liste des contrats d'assurance
                </CardTitle>
                <CardDescription>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 mt-1" />
                  ) : (
                    <span>
                      {contracts.length} sur {contracts.length} contrat
                    </span>
                  )}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un contrat..."
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Aucun résultat</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    {searchQuery
                      ? "Aucun contrat ne correspond à vos critères de recherche."
                      : "Aucun contrat disponible actuellement. Vous pouvez ajouter un nouveau contrat en utilisant le bouton d'ajout."}
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
                    contracts={contracts}
                    onDelete={handleDeleting}
                    isLoading={isLoading}
                  />
                  {pagination && <Pagination pagination={pagination} />}
                </div>
              )}
            </Suspense>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Affichage de {contracts.length} sur {contracts.length} contrat
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