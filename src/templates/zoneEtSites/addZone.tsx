"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createZone } from "@/data/zone.service"
import { ZoneOutput } from "@/lib/output-Types"
// import { useNavigate } from "react-router-dom"

const AddZone = ({ onAdd }: { onAdd: (response: ZoneOutput) => void }) => {
    // const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // const [selectedZone, setSelectedZone] = useState<ZoneOutput | null>(null)
    const [zoneData, setZoneData] = useState({
        name: "",
        address: ""
    })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!zoneData.name || !zoneData.address) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createZone(zoneData)
      onAdd(response)

      // Reset form
      setZoneData({
        name: "",
        address: ""
      })

      toast.success("Ajout réussi", {
        description: "La zone a été ajoutée avec succès"
      })
      setOpen(false)
    } catch (error) {
      console.error("Error creating zone:", error)
      toast.error("Une erreur s'est produite lors de l'ajout de la zone", {
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
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une nouvelle zone
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Ajouter une nouvelle zone</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails de la zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de la zone</Label>
                    <Input
                      id="name"
                      value={zoneData.name}
                      onChange={(e) => setZoneData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Exemple: Zone Nord"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={zoneData.address}
                      onChange={(e) => setZoneData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Exemple: 123 rue Example"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 min-w-32"
                disabled={isSubmitting || !zoneData.name || !zoneData.address}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    En cours de sauvegarde...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Sauvegarder la zone
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

export default AddZone