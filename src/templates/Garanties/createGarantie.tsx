import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, CalendarIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { garantiesInput } from "@/lib/input-Types"
import { garantiesOutput, CompagnieOutput, InsuranceCampaniseOutput } from "@/lib/output-Types"
import { createGarantie, updateGarantie } from "@/data/garanties.service"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { fr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getCompagnies } from "@/data/societes.service"
import { getInsuranceCampanises } from "@/data/insuranceCampanise.service"

interface CreateGarantieProps {
  garantie?: garantiesOutput
  onSuccess: () => void
}

const guarantee_type = [
  { value: "incendie", label: "Incendie" },
  { value: "vol", label: "Vol" },
  { value: "degat_des_eaux", label: "Dégât des eaux" },
  { value: "responsabilite_civile", label: "Responsabilité civile" },
  { value: "bris_de_glace", label: "Bris de glace" },
]

const CreateGarantie = ({ garantie, onSuccess }: CreateGarantieProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [insuranceCampanises, setInsuranceCampanises] = useState<InsuranceCampaniseOutput[]>([])
  const [garantieData, setGarantieData] = useState<garantiesInput>({
    code: garantie?.code || "",
    label: garantie?.label || "",
    description: garantie?.description || "",
    deductible: garantie?.deductible || "",
    guarantee_type: garantie?.guarantee_type || "",
    rate: garantie?.rate || 0,
    insurance_company: garantie?.insurance_company || "",
    validity_duration_months: garantie?.validity_duration_months || 12,
    validity_date: garantie?.validity_date || new Date(),
    exclusions: garantie?.exclusions || [],
  })
  const [newExclusion, setNewExclusion] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setGarantieData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGarantieData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setGarantieData((prev) => ({ ...prev, validity_date: date }))
    }
  }

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      setGarantieData((prev) => ({
        ...prev,
        exclusions: [...prev.exclusions, newExclusion.trim()],
      }))
      setNewExclusion("")
    }
  }

  const handleRemoveExclusion = (index: number) => {
    setGarantieData((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (garantie) {
        await updateGarantie(garantieData, garantie.id)
        toast.success("Garantie mise à jour avec succès")
      } else {
        await createGarantie(garantieData)
        toast.success("Garantie créée avec succès")
      }
      onSuccess()
      setOpen(false)
    } catch (error) {
      console.error("Error submitting garantie:", error)
      toast.error(
        garantie
          ? "Erreur lors de la mise à jour de la garantie"
          : "Erreur lors de la création de la garantie"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {

    const fetchCompagnies = async () => {
      const compagnies = await getInsuranceCampanises()
      setInsuranceCampanises(compagnies)
    }

    fetchCompagnies()
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          {garantie ? "Modifier la garantie" : "Ajouter une garantie"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {garantie ? "Modifier la garantie" : "Ajouter une garantie"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    name="code"
                    value={garantieData.code}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    name="label"
                    value={garantieData.label}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2 ">
                  <Label htmlFor="garantee_type">Type de garantie</Label>
                  <Select
                    value={garantieData.guarantee_type}
                    onValueChange={(value) =>
                      setGarantieData((prev) => ({ ...prev, guarantee_type: value }))
                    }

                
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {guarantee_type.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Taux (%)</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    value={garantieData.rate}
                    onChange={handleNumberChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductible">Franchise</Label>
                  <Input
                    id="deductible"
                    name="deductible"
                    type="number"
                    value={garantieData.deductible}
                    onChange={handleNumberChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_company">Compagnie d'assurance</Label>
                  <Select
                    value={garantieData.insurance_company}
                    onValueChange={(value) =>
                      setGarantieData((prev) => ({ ...prev, insurance_company: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une compagnie" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceCampanises.map((insuranceCampanise) => (
                        <SelectItem key={insuranceCampanise.id} value={insuranceCampanise.id}>
                          {insuranceCampanise.informations_generales.raison_sociale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity_duration_months">
                    Durée de validité (mois)
                  </Label>
                  <Input
                    id="validity_duration_months"
                    name="validity_duration_months"
                    type="number"
                    value={garantieData.validity_duration_months}
                    onChange={handleNumberChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date de validité</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !garantieData.validity_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {garantieData.validity_date ? (
                          garantieData.validity_date.toLocaleDateString()
                        ) : (
                          <span>Choisir une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={garantieData.validity_date}
                        onSelect={handleDateChange}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={garantieData.description}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label>Exclusions</Label>
                <div className="flex gap-2">
                  <Input
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="Ajouter une exclusion"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddExclusion}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {garantieData.exclusions.map((exclusion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded-md"
                    >
                      <span>{exclusion}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExclusion(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {garantie ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {garantie ? "Mettre à jour" : "Créer"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGarantie 