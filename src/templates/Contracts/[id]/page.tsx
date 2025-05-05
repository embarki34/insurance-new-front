"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getContractById } from "@/data/contracts.service"
import type { contractOutputById } from "@/lib/output-Types"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Calendar,
  FileText,
  Building,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  CalendarRange,
  Globe,
  Phone,
  MapPin,
  Briefcase,
  FileCheck,
  Award,
  BanknoteIcon as Bank,
  Banknote,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useParams } from "react-router-dom"

export default function ContractDetails() {
  const { id } = useParams()
  const [contract, setContract] = useState<contractOutputById | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true)
        if (id) {
          const contractData = await getContractById(id)
          setContract(contractData as unknown as contractOutputById)
        }
      } catch (err) {
        setError("Échec du chargement des détails du contrat")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [id])

  if (loading) {
    return <ContractDetailsSkeleton />
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="border-red-400 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-700 font-bold">Erreur</AlertTitle>
          <AlertDescription className="text-red-600">{error || "Contrat non trouvé"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      active: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200",
        label: "Active",
        icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
      },
      inactive: {
        color: "bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200",
        label: "Inactive",
        icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
      },
      pending: {
        color: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200",
        label: "Pending",
        icon: <Clock className="h-3.5 w-3.5 mr-1" />,
      },
    }

    const statusInfo = statusMap[status.toLowerCase()] || {
      color: "bg-gray-100 text-gray-700 border-gray-300",
      label: status,
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
    }

    return (
      <Badge className={`${statusInfo.color} font-medium px-3 py-1 flex items-center`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (e) {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-AE", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-10 ">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Détails du contrat
            </h1>
            <p className="text-muted-foreground flex items-center">
              <FileCheck className="h-4 w-4 mr-2 text-slate-500" />
              Numéro de police : <span className="font-medium ml-1">{contract.policyNumber}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">{getStatusBadge(contract.status)}</div>
        </div>

        <Card className="border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className=" pb-4">
            <CardTitle className="flex items-center text-slate-800">
              <FileText className="mr-2 h-5 w-5 text-slate-600" />
              Résumé du contrat
            </CardTitle>
            <CardDescription>Aperçu du contrat d'assurance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Société d'assurance</h3>
                    <p className="text-lg font-semibold text-slate-800">
                      {contract.insuranceCompany.informations_generales.raison_sociale}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Société assurée</h3>
                    <p className="text-lg font-semibold text-slate-800">
                      {contract.societe.informations_generales.raison_sociale}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileCheck className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Numéro de police</h3>
                    <p className="text-lg font-semibold text-slate-800">{contract.policyNumber}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Banknote className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Montant assuré</h3>
                    <p className="text-lg font-semibold text-emerald-600">{formatCurrency(contract.insuredAmount)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Montant de la prime</h3>
                    <p className="text-lg font-semibold text-amber-600">{formatCurrency(contract.primeAmount)}</p>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Date de début</h3>
                      <p className="text-lg font-semibold text-slate-800">{formatDate(contract.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CalendarRange className="h-5 w-5 mr-3 text-slate-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Date de fin</h3>
                      <p className="text-lg font-semibold text-slate-800">{formatDate(contract.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Détails
            </TabsTrigger>
            <TabsTrigger
              value="insured"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Objets assurés
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg"
            >
              <Building className="h-4 w-4 mr-2" />
              Société d'assurance
            </TabsTrigger>
            <TabsTrigger
              value="societe"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Société assurée
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="">
                <CardTitle className="flex items-center text-slate-800">
                  <Calendar className="mr-2 h-5 w-5 text-slate-600" />
                  Chronologie du contrat
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-slate-600" />
                        <h3 className="text-sm font-medium text-slate-600">Créé le</h3>
                      </div>
                      <p className="text-lg font-semibold text-slate-800">{formatDate(contract.createdAt)}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-2 text-slate-600" />
                        <h3 className="text-sm font-medium text-slate-600">Mis à jour le</h3>
                      </div>
                      <p className="text-lg font-semibold text-slate-800">{formatDate(contract.updatedAt)}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center mb-2">
                        {contract.status.toLowerCase() === "active" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
                        ) : contract.status.toLowerCase() === "inactive" ? (
                          <XCircle className="h-4 w-4 mr-2 text-rose-600" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2 text-amber-600" />
                        )}
                        <h3 className="text-sm font-medium text-slate-600">Statut</h3>
                      </div>
                      <p className="text-lg font-semibold text-slate-800">{contract.status}</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center mb-2">
                      <CalendarRange className="h-4 w-4 mr-2 text-slate-600" />
                      <h3 className="text-sm font-medium text-slate-600">Durée du contrat</h3>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{formatDate(contract.startDate)}</span>
                        <span className="text-sm font-medium text-slate-700">{formatDate(contract.endDate)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        {/* This is a simplified progress bar - in a real app you'd calculate the percentage */}
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insured" className="space-y-4 mt-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="">
                <CardTitle className="flex items-center text-slate-800">
                  <Shield className="mr-2 h-5 w-5 text-slate-600" />
                  Objets assurés & Garanties
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {contract.insuredList.length > 0 ? (
                  <div className="space-y-6">
                    {contract.insuredList.map((insured, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-slate-50 shadow-sm">
                        <h3 className="text-lg font-semibold mb-2 flex items-center text-slate-800">
                          <Shield className="h-5 w-5 mr-2 text-cyan-600" />
                          Objet assuré #{index + 1}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-slate-500" />
                          ID de l'objet : <span className="font-medium ml-1">{insured.object.objectType}</span>
                        </p>
                        <p className="text-sm text-slate-600 mb-4 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-slate-500" />
                          Détails : {insured.object.details.map((detail) => detail.value).join(", ")}
                        </p>

                        <h4 className="text-md font-medium mb-3 flex items-center text-slate-800">
                          <Award className="h-5 w-5 mr-2 text-amber-600" />
                          Garanties
                        </h4>
                        {insured.garanties.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insured.garanties.map((garantie, gIndex) => (
                              <div
                                key={gIndex}
                                className="border rounded-lg p-4 bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
                              >
                                <div className="flex items-center mb-2">
                                  <Shield className="h-5 w-5 mr-2 text-cyan-600" />
                                  <h4 className="font-semibold text-lg text-cyan-700">
                                    Code: <span className="font-normal text-slate-800">{garantie.code}</span>
                                  </h4>
                                </div>
                                <h5 className="font-semibold text-md text-slate-700 mb-2">
                                  Libellé: <span className="font-normal text-slate-800">{garantie.label}</span>
                                </h5>
                                <p className="font-medium text-slate-700 mb-1">
                                  Description:{" "}
                                  <span className="font-normal text-slate-600">{garantie.description}</span>
                                </p>
                                <p className="font-medium text-slate-700 mb-1">
                                  Franchise: <span className="font-normal text-slate-600">{garantie.deductible}</span>
                                </p>
                                <p className="font-medium text-slate-700 mb-1">
                                  Taux: <span className="font-normal text-slate-600">{garantie.rate}</span>
                                </p>
                                <p className="font-medium text-slate-700">
                                  Durée de validité:{" "}
                                  <span className="font-normal text-slate-600">
                                    {garantie.validity_duration_months} mois
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Aucune garantie trouvée</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Aucun objet assuré trouvé
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          lets add the num<TabsContent value="insurance" className="space-y-4 mt-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="">
                <CardTitle className="flex items-center text-slate-800">
                  <Building className="mr-2 h-5 w-5 text-slate-600" />
                  Détails de la société d'assurance
          
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Building className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-slate-500" />
                          Nom de la société
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_generales.raison_sociale}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                          Forme juridique
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_generales.forme_juridique}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <FileCheck className="h-4 w-4 mr-2 text-slate-500" />
                          Numéro d'enregistrement
                        </p>
                        <p className="text-slate-800">{contract.insuranceCompany.informations_generales.numero_rc}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                          Code d'activité
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_generales.code_activite}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Banknote className="h-4 w-4 mr-2 text-slate-500" />
                          Capital social
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_generales.capital_social}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                          Date de création
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_generales.date_creation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Phone className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations de contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse du siège
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.coordonnees.adresse_direction_generale}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse du bureau régional
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.coordonnees.adresse_direction_regionale}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse de l'agence
                        </p>
                        <p className="text-slate-800">{contract.insuranceCompany.coordonnees.adresse_agence}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-slate-500" />
                          Site web
                        </p>
                        <p className="text-slate-800">{contract.insuranceCompany.coordonnees.site_web}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Bank className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations bancaires
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Bank className="h-4 w-4 mr-2 text-slate-500" />
                          Nom de la banque
                        </p>
                        <p className="text-slate-800">{contract.insuranceCompany.informations_bancaires.nom_banque}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-slate-500" />
                          Numéro de compte
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_bancaires.rib_ou_numero_compte}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Banknote className="h-4 w-4 mr-2 text-slate-500" />
                          Devise
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.informations_bancaires.devise_compte}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Shield className="h-5 w-5 mr-2 text-cyan-600" />
                      Données spécifiques à l'assurance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-slate-500" />
                          Produits d'assurance
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {contract.insuranceCompany.donnees_specifiques_assurance.produits_assurance.map(
                            (product, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                              >
                                {product}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <FileCheck className="h-4 w-4 mr-2 text-slate-500" />
                          Numéro d'agrément
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.donnees_specifiques_assurance.numero_agrement}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                          Validité de l'agrément
                        </p>
                        <p className="text-slate-800">
                          {contract.insuranceCompany.donnees_specifiques_assurance.validite_agrement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="societe" className="space-y-4 mt-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="">
                <CardTitle className="flex items-center text-slate-800">
                  <Users className="mr-2 h-5 w-5 text-slate-600" />
                  Détails de la société assurée
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Building className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Building className="h-4 w-4 mr-2 text-slate-500" />
                          Nom de la société
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.raison_sociale}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                          Forme juridique
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.forme_juridique}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <FileCheck className="h-4 w-4 mr-2 text-slate-500" />
                          Numéro d'enregistrement
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.numero_rc}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                          Code d'activité
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.code_activite}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Banknote className="h-4 w-4 mr-2 text-slate-500" />
                          Capital social
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.capital_social}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                          Date de création
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_generales.date_creation}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Phone className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations de contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse du siège
                        </p>
                        <p className="text-slate-800">{contract.societe.coordonnees.adresse_direction_generale}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse du bureau régional
                        </p>
                        <p className="text-slate-800">{contract.societe.coordonnees.adresse_direction_regionale}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                          Adresse de l'agence
                        </p>
                        <p className="text-slate-800">{contract.societe.coordonnees.adresse_agence}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-slate-500" />
                          Site web
                        </p>
                        <p className="text-slate-800">{contract.societe.coordonnees.site_web}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-slate-800">
                      <Bank className="h-5 w-5 mr-2 text-cyan-600" />
                      Informations bancaires
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Bank className="h-4 w-4 mr-2 text-slate-500" />
                          Nom de la banque
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_bancaires.nom_banque}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-slate-500" />
                          Numéro de compte
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_bancaires.rib_ou_numero_compte}</p>
                      </div>
                      <div className="bg-white p-3 rounded-md border shadow-sm">
                        <p className="text-sm font-medium text-slate-600 flex items-center">
                          <Banknote className="h-4 w-4 mr-2 text-slate-500" />
                          Devise
                        </p>
                        <p className="text-slate-800">{contract.societe.informations_bancaires.devise_compte}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ContractDetailsSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Skeleton className="h-10 w-full mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
