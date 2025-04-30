import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, CalendarIcon, Trash } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { contractInput } from "@/lib/input-Types"
import { createContract } from "@/data/contracts.service"
import { getParameters } from "@/data/parameters.service"
import { ObjectOutput, parameter } from "@/lib/output-Types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/format"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getObjects } from "@/data/object.service"
import CreateObjects from "../objects/creatObjects"

// Status options
const statusOptions = [
  { value: "active", label: "Active", className: "text-green-500 font-bold hover:text-green-500" },
  { value: "inactive", label: "Inactive", className: "text-red-500 font-bold hover:text-red-500" },
  { value: "pending", label: "Pending", className: "text-yellow-500 font-bold hover:text-yellow-500" }
];

interface AddContractProps {
  onAdd: () => void
}

// Update the ContractWithParameters interface
interface ContractWithObjectDetails extends contractInput {
  insuredList: string[]; // Changed to string[] to store object IDs
}

const AddContract = ({ onAdd }: AddContractProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState("company")
  const [showValidation, setShowValidation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [contractData, setContractData] = useState<contractInput>({
    type_id: "",
    policyNumber: "",
    insuredAmount: "",
    primeAmount: "",
    insuranceCompanyName: "",
    holderName: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: "",
    policyDocument: null,
  })
  const [objects, setObjects] = useState<ObjectOutput[]>([]);
  const [selectedObjectType, setSelectedObjectType] = useState<string>("");
  const [filteredObjects, setFilteredObjects] = useState<ObjectOutput[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [showCreateObjectDialog, setShowCreateObjectDialog] = useState(false);
  const [insuranceTypes, setInsuranceTypes] = useState<parameter[]>([])
  const [refetch, setRefetch] = useState(false);
  const [societe, setSociete] = useState<parameter[]>([]);
  const [compagnie_dassurance, setCompagnie_dassurance] = useState<parameter[]>([]);

  const [selectedSociete, setSelectedSociete] = useState<string>("");
  const [selectedCompagnie_dassurance, setSelectedCompagnie_dassurance] = useState<string>("");

  const steps = ["company", "police", "garanties", "details"]

  const getNextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    return steps[currentIndex + 1]
  }

  const getPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    return steps[currentIndex - 1]
  }

  const handleNext = () => {
    const nextStep = getNextStep()
    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  const handlePrevious = () => {
    const previousStep = getPreviousStep()
    if (previousStep) {
      setCurrentStep(previousStep)
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    // Company tab validation
    if (!selectedSociete) errors.push("societe")
    if (!selectedCompagnie_dassurance) errors.push("compagnie_dassurance")

    // Police tab validation
    if (!contractData.type_id) errors.push("type_id")
    if (!contractData.policyNumber) errors.push("policyNumber")
    if (!contractData.insuredAmount) errors.push("insuredAmount")
    if (!contractData.primeAmount) errors.push("primeAmount")
    if (!contractData.startDate) errors.push("startDate")
    if (!contractData.endDate) errors.push("endDate")
    if (!contractData.status) errors.push("status")

    // Details tab validation (if you want to require at least one object)
    if (selectedObjectIds.length === 0) errors.push("objects")

    return errors
  }

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const parameters = await getParameters();
        const insuranceTypes = parameters.filter((type) => type.key === "type_de_police");
        const societe = parameters.filter((type) => type.key === "societe");
        const compagnie_dassurance = parameters.filter((type) => type.key === "compagnie_dassurance");
        setInsuranceTypes(insuranceTypes);
        setSociete(societe);
        setCompagnie_dassurance(compagnie_dassurance);
      } catch (error) {
        console.error("Error fetching insurance types:", error);
      }
    };


    

    const fetchObjects = async () => {
      try {
        const objectsData = await getObjects();
        setObjects(objectsData.objects);
        console.log(objectsData.objects)
      } catch (error) {
        console.error("Error fetching objects:", error);
      }
    };

    fetchInsuranceTypes();
    fetchObjects();
  }, [refetch]);

  // Filter objects when object type is selected
  useEffect(() => {
    if (selectedObjectType) {
      const filtered = objects.filter(obj => obj.objectType === selectedObjectType);
      setFilteredObjects(filtered);
    } else {
      setFilteredObjects([]);
    }
  }, [selectedObjectType, objects]);

  // Handle object type selection
  const handleObjectTypeChange = (value: string) => {
    setSelectedObjectType(value);
  };

  // Handle object selection (checkbox)
  const handleObjectSelection = (objectId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedObjectIds(prev => [...prev, objectId]);
    } else {
      setSelectedObjectIds(prev => prev.filter(id => id !== objectId));
    }
  };

  // Handle object creation completion
  const handleObjectCreated = () => {
    setRefetch(!refetch); // Trigger a refetch of objects
    setShowCreateObjectDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setContractData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setContractData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (date: Date, field: string) => {
    if (date) {
      if (field === 'startDate') {
        setContractData(prev => ({
          ...prev,
          startDate: date.toISOString()
        }));
      } else if (field === 'endDate') {
        setContractData(prev => ({
          ...prev,
          endDate: date.toISOString()
        }));
      } else {
        setContractData(prev => ({
          ...prev,
          [field]: date.toISOString()
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowValidation(true)
    
    const errors = validateForm()
    setValidationErrors(errors)

    if (errors.length > 0) {
      // Find the first tab with errors and switch to it
      if (errors.some(error => ["societe", "compagnie_dassurance"].includes(error))) {
        setCurrentStep("company")
      } else if (errors.some(error => ["type_id", "policyNumber", "insuredAmount", "primeAmount", "startDate", "endDate", "status"].includes(error))) {
        setCurrentStep("police")
      } else if (errors.includes("objects")) {
        setCurrentStep("details")
      }
      
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    try {
      const contractWithDetails: ContractWithObjectDetails = {
        ...contractData,
        insuredList: selectedObjectIds
      };

      await createContract(contractWithDetails as any);
      toast.success("Le contrat a été créé avec succès");
      onAdd();
      setOpen(false);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Une erreur s'est produite lors de la création du contrat");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex items-center justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un nouveau contrat
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[70vw] max-h-[90vh] w-full overflow-y-auto p-6 bg-background shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">Ajouter un nouveau contrat</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentStep} onValueChange={setCurrentStep}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="company" className="flex-1">
                  Informations de la compagnie
                  {showValidation && validationErrors.some(error => ["societe", "compagnie_dassurance"].includes(error)) && 
                    <span className="ml-2 text-red-500">*</span>
                  }
                </TabsTrigger>
                <TabsTrigger value="police" className="flex-1">
                  Détails de la police
                  {showValidation && validationErrors.some(error => ["type_id", "policyNumber", "insuredAmount", "primeAmount", "startDate", "endDate", "status"].includes(error)) && 
                    <span className="ml-2 text-red-500">*</span>
                  }
                </TabsTrigger>
                <TabsTrigger value="garanties" className="flex-1">Garanties</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">
                  Détails des objets
                  {showValidation && validationErrors.includes("objects") && 
                    <span className="ml-2 text-red-500">*</span>
                  }
                </TabsTrigger>
              </TabsList>
              <TabsContent value="company">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="societe" className="text-sm font-semibold flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Société
                      </Label>
                      <Select
                        value={selectedSociete}
                        onValueChange={(value) => setSelectedSociete(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez une société" />
                        </SelectTrigger>
                        <SelectContent>
                          {societe.map((societe) => (
                            societe.values.map((value) => (
                              <SelectItem key={value.key} value={value.key}>
                                {value.label}
                              </SelectItem>
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="compagnie_dassurance" className="text-sm font-semibold flex items-center gap-1">
                        <span className="text-red-500">*</span>
                        Compagnie d'assurance
                      </Label>
                      <Select
                        value={selectedCompagnie_dassurance}
                        onValueChange={(value) => setSelectedCompagnie_dassurance(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez une compagnie d'assurance" />
                        </SelectTrigger>
                        <SelectContent>
                          {compagnie_dassurance.map((compagnie_dassurance) => (
                            compagnie_dassurance.values.map((value) => (
                              <SelectItem key={value.key} value={value.key}>
                                {value.label}
                              </SelectItem>
                            ))
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </TabsContent>





              <TabsContent value="police">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type_id" className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Type de police
                          </Label>
                          <Select
                            value={contractData.type_id}
                            onValueChange={(value) => handleSelectChange("type_id", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez le type de police" />
                            </SelectTrigger>
                            <SelectContent>
                              {insuranceTypes.map((type) => (
                                type.values.map((value) => (
                                  <SelectItem key={value.key} value={value.key}>
                                    {value.label}
                                  </SelectItem>
                                ))
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="policyNumber" className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Numéro de police
                          </Label>
                          <Input
                            id="policyNumber"
                            value={contractData.policyNumber}
                            onChange={handleChange}
                            required
                            placeholder="Entrez le numéro de police"
                            className="transition-all focus-visible:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                        <div className="space-y-2">
                          <Label htmlFor="insuredAmount" className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Montant assuré
                          </Label>
                          <Input
                            id="insuredAmount"
                            value={contractData.insuredAmount}
                            onChange={handleChange}
                            required
                            type="number"
                            placeholder="Entrez le montant assuré"
                            className="transition-all focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="primeAmount" className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Montant de la prime
                          </Label>
                          <Input
                            id="primeAmount"
                            value={contractData.primeAmount}
                            onChange={handleChange}
                            required
                            type="number"
                            placeholder="Entrez le montant de la prime"
                            className="transition-all focus-visible:ring-primary"
                          />
                        </div>
                      </div>

                      

                      

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Date de début du contrat
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left",
                                  !contractData.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {contractData.startDate ? formatDate(contractData.startDate) : "Choisissez une date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={contractData.startDate ? new Date(contractData.startDate) : undefined}
                                onSelect={(date) => handleDateChange(date as Date, 'startDate')}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Date de fin du contrat
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left",
                                  !contractData.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {contractData.endDate ? formatDate(contractData.endDate) : "Choisissez une date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={contractData.endDate ? new Date(contractData.endDate) : undefined}
                                onSelect={(date) => handleDateChange(date as Date, 'endDate')}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Statut
                        </Label>
                        <Select
                          value={contractData.status}
                          onValueChange={(value) => handleSelectChange("status", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez le statut" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className={option.className}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>





              <TabsContent value="garanties">
                
              </TabsContent>


             

              <TabsContent value="details">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left side - List of selected objects */}
                      <div className="md:col-span-1 space-y-4">
                        <h3 className="text-lg font-semibold">Objets sélectionnés</h3>

                        {selectedObjectIds.length > 0 ? (
                          <div className="h-[480px] overflow-y-auto pr-2 space-y-2">
                            {selectedObjectIds.map((objectId) => {
                              const object = objects.find(obj => obj.id === objectId);
                              return (
                                <div
                                  key={objectId}
                                  className="p-3 border rounded-md bg-background"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <Badge className="text-xs">
                                      {object?.objectType || "Objet"}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleObjectSelection(objectId, false)}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    {object?.details.map((detail, index) => (
                                      <div key={index} className="flex items-start text-sm border-b pb-1 last:border-0">
                                        <span className="font-medium min-w-24">{detail.key}:</span>
                                        <span className="ml-2">{detail.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-[480px] border rounded-md flex items-center justify-center bg-muted/10">
                            <div className="text-center p-4 text-muted-foreground">
                              <p>Aucun objet sélectionné</p>
                              <p className="text-sm">Sélectionnez un type d'objet à droite puis choisissez des objets</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side - Object type selection and object list */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Sélectionner des objets</h3>

                          <CreateObjects
                            onObjectsCreated={handleObjectCreated}
                          />

                        </div>

                        <div className="mb-4">
                          <Label htmlFor="objectType" className="text-xs font-semibold mb-1 block">
                            Type d'objet
                          </Label>
                          <Select
                            value={selectedObjectType}
                            onValueChange={handleObjectTypeChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez un type d'objet" />
                            </SelectTrigger>
                            <SelectContent>
                              {[...new Set(objects.map(obj => obj.objectType))].map((objectType) => (
                                <SelectItem key={objectType} value={objectType}>
                                  {objectType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Object list */}
                        <div className="p-4 bg-muted/20 rounded-md">
                          <h4 className="text-sm font-medium mb-3">Objets disponibles</h4>

                          {selectedObjectType ? (
                            filteredObjects.length > 0 ? (
                              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" >
                                {filteredObjects.map((object) => (
                                  <div key={object.id} className="flex items-start border-b border-muted pb-2 last:border-0">
                                    <Checkbox
                                      id={`object-${object.id}`}
                                      checked={selectedObjectIds.includes(object.id)}
                                      onCheckedChange={(checked) =>
                                        handleObjectSelection(object.id, checked as boolean)
                                      }
                                      className="mt-1 mr-3"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={`object-${object.id}`}
                                        className="font-medium cursor-pointer"
                                      >
                                        {object.details.find(d => d.key === "name")?.value ||
                                          object.details.find(d => d.key === "titre")?.value ||
                                          `Objet ${object.id.substring(0, 8)}`}
                                      </Label>
                                      <div className="text-sm text-muted-foreground mt-1">
                                        {object.details.slice(0, 3).map((detail, index) => (
                                          <div key={index} className="flex items-start">
                                            <span className="font-medium min-w-24">{detail.key}:</span>
                                            <span className="ml-2">{detail.value}</span>
                                          </div>
                                        ))}
                                        {object.details.length > 3 && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            + {object.details.length - 3} autres attributs
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 border rounded-md text-center bg-muted/5">
                                <p className="text-muted-foreground">Aucun objet de ce type n'est disponible</p>
                                {showCreateObjectDialog && (
                                  <CreateObjects
                                    onObjectsCreated={handleObjectCreated}
                                  />
                                )}
                              </div>
                            )
                          ) : (
                            <div className="p-6 border rounded-md text-center bg-muted/5">
                              <p className="text-muted-foreground">Veuillez sélectionner un type d'objet</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>






            </Tabs>

            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === steps[0]}
              >
                Précédent
              </Button>

              <div className="flex gap-3">
                {currentStep !== steps[steps.length - 1] ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        En cours d'enregistrement...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Enregistrer le contrat
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating objects */}

    </div>
  )
}

export default AddContract