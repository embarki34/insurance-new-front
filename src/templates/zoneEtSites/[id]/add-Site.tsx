"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSite } from "@/data/sites.service"

interface AddSiteProps {
  zoneId: string;
  onAdd: () => void;
}

function AddSite({ zoneId, onAdd }: AddSiteProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [siteData, setSiteData] = useState({
    name: "",
    builtSurface: "",
    unbuiltSurface: "",
    totalValue: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate required fields
    if (!siteData.name || !siteData.builtSurface || !siteData.unbuiltSurface || !siteData.totalValue) {
      toast.error("Veuillez remplir tous les champs requis")
      return
    }

    // Validate numeric fields
    const numericFields = {
      builtSurface: parseFloat(siteData.builtSurface),
      unbuiltSurface: parseFloat(siteData.unbuiltSurface),
      totalValue: parseFloat(siteData.totalValue)
    }

    if (Object.values(numericFields).some(isNaN)) {
      toast.error("Les surfaces et la valeur doivent être des nombres valides")
      return
    }

    setIsSubmitting(true)

    try {
      const sitePayload = {
        ...siteData,
        zone: zoneId,
        builtSurface: numericFields.builtSurface.toString() as string,
        unbuiltSurface: numericFields.unbuiltSurface.toString() as string,
        totalValue: numericFields.totalValue.toString() as string,
        batiments: []
      }

       await createSite(zoneId, sitePayload)
      onAdd()

      // Reset form
      setSiteData({
        name: "",
        builtSurface: "",
        unbuiltSurface: "",
        totalValue: "",
      })

      toast.success("Site ajouté avec succès", {
        description: "Le nouveau site a été créé dans la zone"
      })
      setOpen(false)
    } catch (error) {
      console.error("Error creating site:", error)
      toast.error("Erreur lors de la création du site", {
        description: "Une erreur s'est produite pendant le processus"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-end space-x-reverse">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un nouveau site
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ajouter un nouveau site</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails du site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du site</Label>
                    <Input
                      id="name"
                      value={siteData.name}
                      onChange={(e) => setSiteData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Exemple: Site Principal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="builtSurface">Surface bâtie (m²)</Label>
                      <Input
                        id="builtSurface"
                        type="number"
                        value={siteData.builtSurface}
                        onChange={(e) => setSiteData(prev => ({ ...prev, builtSurface: e.target.value }))}
                        placeholder="Exemple: 1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unbuiltSurface">Surface non bâtie (m²)</Label>
                      <Input
                        id="unbuiltSurface"
                        type="number"
                        value={siteData.unbuiltSurface}
                        onChange={(e) => setSiteData(prev => ({ ...prev, unbuiltSurface: e.target.value }))}
                        placeholder="Exemple: 500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalValue">Valeur totale ($)</Label>
                    <Input
                      id="totalValue"
                      type="number"
                      value={siteData.totalValue}
                      onChange={(e) => setSiteData(prev => ({ ...prev, totalValue: e.target.value }))}
                      placeholder="Exemple: 1000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="min-w-24"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 min-w-32 transition-colors"
                disabled={isSubmitting || !siteData.name || !siteData.builtSurface || !siteData.unbuiltSurface || !siteData.totalValue}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    En cours...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Créer le site
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddSite