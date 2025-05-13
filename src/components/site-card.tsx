"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, CalendarDays, Landmark, AreaChart, DollarSign } from "lucide-react"
import type { Detail, ObjectOutput, SiteOutput } from "@/lib/output-Types"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CreateBatiment from "@/components/creatbatiment"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "N/A"
  }
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "DZD",
    maximumFractionDigits: 0,
  }).format(value)
}

const formatSurface = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A"
  return `${value.toLocaleString("fr-FR")} m²`
}

// --- Structured Batiment Details Component ---
interface BatimentDetailsProps {
  batiment: ObjectOutput
}

const BatimentDetails = ({ batiment }: BatimentDetailsProps) => {
  const details = batiment.details || []
  const type = batiment.objectType || "Inconnu"
  const name = batiment.objectName || "Sans nom"

  // Group details by category
  const valueDetails = details.filter((d) => d.key.includes("valeur"))
  const typeDetails = details.filter((d) => d.key === "type")
  const otherDetails = details.filter((d) => !d.key.includes("valeur") && d.key !== "type")

  const formatDetailKey = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/^(valeurs|typede):?\s*/i, "")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDetailValue = (value: any) => {
    if (value === null || value === undefined) return "N/A"

    // Handle numeric values
    if (!isNaN(value)) {
      if (value > 1000) return value.toLocaleString("fr-FR")
      return value.toString()
    }

    // Handle date strings
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return formatDate(value)
    }

    return value
  }

  const renderDetailList = (detailList: Detail[], title: string | null = null) => {
    if (detailList.length === 0) return null

    return (
      <div className="space-y-1">
        {title && (
          <dt className="col-span-full font-medium text-slate-700 mt-3 mb-1.5 text-sm border-b pb-1">{title}</dt>
        )}
        {detailList.map((detail, idx) => (
          <div
            key={`${detail.key}-${idx}`}
            className="grid grid-cols-2 gap-2 py-1.5 px-3 rounded-md hover:bg-slate-50 transition-colors"
          >
            <dt className="text-xs font-medium text-slate-600 capitalize">{formatDetailKey(detail.key)}</dt>
            <dd className="text-sm text-slate-800 font-medium text-right">{formatDetailValue(detail.value)}</dd>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-base text-slate-900">{name}</h4>
        <Badge variant="secondary" className="text-xs font-medium">
          {type}
        </Badge>
      </div>
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-sm">
        {renderDetailList(typeDetails, "Type")}
        {renderDetailList(valueDetails, "Valeurs")}
        {renderDetailList(otherDetails, "Autres détails")}
      </dl>
      {details.length === 0 && <p className="text-sm text-slate-500 text-center py-2">Aucun détail disponible.</p>}
    </div>
  )
}

// --- Main SiteCard Component ---
interface SiteCardProps {
  site: SiteOutput
  onEdit: () => void
}

function SiteCard({ site, onEdit }: SiteCardProps) {
  // Ensure batiments array exists and is valid
  const batiments = Array.isArray(site.batiments) ? site.batiments : []
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 flex flex-col h-full">
      {/* Header with site info */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
              {site.name || "Site Sans Nom"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {site.zone || "Zone inconnue"}
            </CardDescription>
          </div>

          {/* Total Value Badge - More prominent */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-green-600 mb-0.5">Valeur Totale</p>
                  <Badge
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-800 text-base font-bold px-3 py-1"
                  >
                    <DollarSign className="h-4 w-4 mr-1.5 opacity-80" />
                    {formatCurrency(site.totalValue)}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Valeur totale de tous les bâtiments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      {/* Content - Metrics and Buildings */}
      <CardContent className="pt-5 pb-3 flex-grow">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/70 transition-colors">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Surface Bâtie</p>
              <p className="text-sm font-semibold text-slate-800">{formatSurface(site.builtSurface)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/70 transition-colors">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <AreaChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Surface Non Bâtie</p>
              <p className="text-sm font-semibold text-slate-800">{formatSurface(site.unbuiltSurface)}</p>
            </div>
          </div>
        </div>

        {/* Expandable Batiments Section using Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={isExpanded ? "batiments" : undefined}
          onValueChange={(value) => setIsExpanded(!!value)}
        >
          <AccordionItem value="batiments" className="border-t pt-2">
            <div className="flex items-center justify-between">
              <AccordionTrigger className="text-base font-medium text-slate-700 hover:no-underline py-2 px-1">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-slate-500" />
                  <span>Bâtiments</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {batiments.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <CreateBatiment oldBatiment={batiments} siteId={site.id} onEdit={onEdit} />
            </div>
            <AccordionContent className="pt-3 pb-1 space-y-3">
              {batiments.length === 0 ? (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <Landmark className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Aucun bâtiment associé à ce site.</p>
                  <p className="text-slate-400 text-xs mt-1">Utilisez le bouton "+" pour ajouter un bâtiment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batiments.map((batiment, index) => (
                    <BatimentDetails key={`batiment-${batiment.id || index}`} batiment={batiment} />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      {/* Footer */}
      <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3 px-5 mt-auto">
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarDays className="h-4 w-4" />
          <span className="text-xs font-medium">Dernière mise à jour : {formatDate(site.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SiteCard
