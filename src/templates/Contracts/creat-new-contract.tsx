import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, Trash } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { contractInput } from "@/lib/input-Types"
import { createContract } from "@/data/contracts.service"
import { getParameters } from "@/data/parameters.service"
import { CompagnieOutput, garantiesOutput, InsuranceCampaniseOutput, ObjectOutput, parameter, ZoneOutput, ZoneDetailsOutput } from "@/lib/output-Types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { getObjects } from "@/data/object.service"
import CreateObjects from "../objects/creatObjects"
import { getCompagnies } from "@/data/societes.service"
import { getInsuranceCampanises } from "@/data/insuranceCampanise.service"
import { getGaranties } from "@/data/garanties.service"
import DatePicker from "react-datepicker"
import { getZones, getZoneById } from "@/data/zone.service"
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { GarantieCard, DropZone, type DragItem } from '@/components/dnd/garantie-dnd'

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


const AddContract = ({ onAdd }: AddContractProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState("company")
  const [showValidation, setShowValidation] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [contractData, setContractData] = useState<contractInput>({
    type_id: "",
    insuranceCompanyId: "",
    policyNumber: "",
    insuredAmount: 0,
    primeAmount: 0,
    societeId: "",
    insuredList: [{
      object_id: "",
      garanties: [],
    }],

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
  const [societe, setSociete] = useState<CompagnieOutput[]>([]);
  const [compagnie_dassurance, setCompagnie_dassurance] = useState<InsuranceCampaniseOutput[]>([]);
  const [garanties, setGaranties] = useState<garantiesOutput[]>([]);
  const [filteredGaranties, setFilteredGaranties] = useState<garantiesOutput[]>([]);


  const [selectedSociete, setSelectedSociete] = useState<string>("");
  const [selectedCompagnie_dassurance, setSelectedCompagnie_dassurance] = useState<string>("");

  // Add a new state variable to track object-specific guarantees
  const [objectGuarantees, setObjectGuarantees] = useState<{
    [objectId: string]: string[]
  }>({});

  // Add new state for zones and sites
  const [zones, setZones] = useState<ZoneOutput[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedZoneDetails, setSelectedZoneDetails] = useState<ZoneDetailsOutput | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>("");

  // Add state for carousel
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);

  const steps = ["company", "police", "details", "garanties"]

  const getNextStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    return steps[currentIndex + 1]
  }

  const getPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep)
    return steps[currentIndex - 1]
  }

  const handleNext = () => {
    // Validate only current step requirements
    const errors = validateForm(currentStep)

    if (errors.length > 0) {
      setShowValidation(true)
      setValidationErrors(errors)
      toast.error(`Veuillez remplir les champs obligatoires pour cette étape`)
      return
    }

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

  const validateForm = (step?: string) => {
    const currentStepToValidate = step || currentStep
    const errors: string[] = []

    switch (currentStepToValidate) {
      case "company":
        if (!selectedSociete) errors.push("societe")
        if (!selectedCompagnie_dassurance) errors.push("compagnie_dassurance")
        break

      case "police":
        if (!contractData.type_id) errors.push("type_id")
        if (!contractData.policyNumber) errors.push("policyNumber")
        if (!contractData.insuredAmount) errors.push("insuredAmount")
        if (!contractData.primeAmount) errors.push("primeAmount")
        if (!contractData.startDate) errors.push("startDate")
        if (!contractData.endDate) errors.push("endDate")
        if (!contractData.status) errors.push("status")
        break

      case "details":
        if (selectedObjectIds.length === 0) errors.push("objects")
        break

      case "garanties":
        // Validate that each object has at least one guarantee
        const objectsWithoutGuarantees = selectedObjectIds.filter(
          id => !objectGuarantees[id] || objectGuarantees[id].length === 0
        );
        if (objectsWithoutGuarantees.length > 0) {
          errors.push("objectGuarantees");
        }
        break
    }

    return errors
  }

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const parameters = await getParameters();
        const societe = await getCompagnies();
        const compagnie_dassurance = await getInsuranceCampanises();
        const garanties = await getGaranties();


        const insuranceTypes = parameters.filter((type) => type.key === "type_de_police");

        setInsuranceTypes(insuranceTypes);
        setSociete(societe);
        setCompagnie_dassurance(compagnie_dassurance);
        setGaranties(garanties);
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

  // Modify useEffect for filtering objects
  useEffect(() => {
    if (selectedObjectType) {
      if (selectedObjectType === "batiment") {
        // For batiment type, objects are already filtered by site selection
        if (!selectedSite) {
          setFilteredObjects([]);
        }
      } else {
        // For other types, use the existing filtering logic
        const filtered = objects.filter(obj => obj.objectType === selectedObjectType);
        setFilteredObjects(filtered);
      }
    } else {
      setFilteredObjects([]);
    }
  }, [selectedObjectType, objects, selectedSite]);

  // Handle object type selection
  const handleObjectTypeChange = (value: string) => {
    setSelectedObjectType(value);
  };

  // Handle object selection (checkbox)
  const handleObjectSelection = (objectId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedObjectIds(prev => [...prev, objectId]);
      // Initialize empty guarantees array for this object
      setObjectGuarantees(prev => ({
        ...prev,
        [objectId]: prev[objectId] || []
      }));
    } else {
      setSelectedObjectIds(prev => prev.filter(id => id !== objectId));
      // Remove guarantees for this object if unselected
      setObjectGuarantees(prev => {
        const newState = { ...prev };
        delete newState[objectId];
        return newState;
      });
    }
  };

  // Add function to handle guarantees selection for specific object
  const handleObjectGuaranteeToggle = (objectId: string, guaranteeId: string) => {
    setObjectGuarantees(prev => {
      const currentGuarantees = prev[objectId] || [];

      // If guarantee already selected, remove it, otherwise add it
      if (currentGuarantees.includes(guaranteeId)) {
        return {
          ...prev,
          [objectId]: currentGuarantees.filter(id => id !== guaranteeId)
        };
      } else {
        return {
          ...prev,
          [objectId]: [...currentGuarantees, guaranteeId]
        };
      }
    });
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

  useEffect(() => {
    if (selectedCompagnie_dassurance) {
      const filtered = garanties.filter(g => g.insurance_company === selectedCompagnie_dassurance);
      setFilteredGaranties(filtered);
    } else {
      setFilteredGaranties([]);
    }
  }, [selectedCompagnie_dassurance, garanties]);

  // Add resetForm function
  const resetForm = () => {
    // Reset all form-related state
    setContractData({
      type_id: "",
      insuranceCompanyId: "",
      policyNumber: "",
      insuredAmount: 0,
      primeAmount: 0,
      societeId: "",
      insuredList: [{
        object_id: "",
        garanties: [],
      }],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      status: "",
      policyDocument: null,

    });

    // Reset selection states
    setSelectedSociete("");
    setSelectedCompagnie_dassurance("");
    setSelectedObjectType("");
    setSelectedObjectIds([]);
    setObjectGuarantees({});
    setSelectedZone("");
    setSelectedZoneDetails(null);
    setSelectedSite("");
    setFilteredObjects([]);
    setFilteredGaranties([]);

    // Reset validation states
    setShowValidation(false);
    setValidationErrors([]);

    // Reset current step
    setCurrentStep("company");
    setCurrentObjectIndex(0);

  };
  

    // Update handleSubmit to include resetForm
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Validate all steps before submission
      const allErrors = steps.flatMap(step => validateForm(step));

      if (allErrors.length > 0) {
        setShowValidation(true);
        setValidationErrors(allErrors);

        // Find first error tab
        const firstErrorStep = steps.find(step =>
          validateForm(step).length > 0
        );

        if (firstErrorStep) {
          setCurrentStep(firstErrorStep);
          toast.error("Veuillez corriger toutes les erreurs avant soumission");
        }
        return;
      }

      // Proceed with submission
      setIsSubmitting(true);
      try {
        // Create the insured list with object-specific guarantees
        const insuredObjectsList = selectedObjectIds.map(objectId => ({
          object_id: objectId,
          garanties: objectGuarantees[objectId] || []
        }));

        const finalContractData = {
          ...contractData,
          // Convert insuredAmount and primeAmount to numbers
          insuranceCompanyId: selectedCompagnie_dassurance, // Use selected ID directly
          societeId: selectedSociete, // Use the selected ID directly
          insuredAmount: Number(contractData.insuredAmount),
          primeAmount: Number(contractData.primeAmount),
          insuredList: insuredObjectsList,
          startDate: new Date(contractData.startDate).toISOString(),
          endDate: new Date(contractData.endDate).toISOString()
        };

        await createContract(finalContractData);
        toast.success("Le contrat a été créé avec succès");
        onAdd();
        resetForm(); // Reset the form after successful submission
        setOpen(false);
      } catch (error) {
        console.error("Error creating contract:", error);
        toast.error("Une erreur s'est produite lors de la création du contrat");
      }
      setIsSubmitting(false);
    };

    // Update the insurance company selection handler
    const handleCompagnieChange = (value: string) => {
      setSelectedCompagnie_dassurance(value);
      const selectedCompany = compagnie_dassurance.find(c => c.id === value);
      setContractData(prev => ({
        ...prev,
        insuranceCompanyId: selectedCompany?.id || ""
      }));
    };

    // Update the societe selection handler to set holderId
    const handleSocieteChange = (value: string) => {
      setSelectedSociete(value);
      // Since we're now using the ID directly, we can set it to holderId
      setContractData(prev => ({
        ...prev,
        holderId: value
      }));
    };

    // Add useEffect to fetch zones
    useEffect(() => {
      const fetchZones = async () => {
        try {
          const zonesData = await getZones();
          console.log("Fetched zones:", zonesData); // Add logging
          setZones(zonesData);
        } catch (error) {
          console.error("Error fetching zones:", error);
          toast.error("Erreur lors de la récupération des zones");
        }
      };

      fetchZones();
    }, []);

    // Add useEffect to fetch zone details when a zone is selected
    useEffect(() => {
      const fetchZoneDetails = async () => {
        if (selectedZone) {
          try {
            const zoneDetails = await getZoneById(selectedZone);
            console.log("Fetched zone details:", zoneDetails); // Add logging
            setSelectedZoneDetails(zoneDetails);
          } catch (error) {
            console.error("Error fetching zone details:", error);
            toast.error("Erreur lors de la récupération des détails de la zone");
          }
        } else {
          setSelectedZoneDetails(null);
        }
      };

      fetchZoneDetails();
    }, [selectedZone]);

    // Add handler for zone selection
    const handleZoneChange = (value: string) => {
      console.log("Selected zone:", value); // Add logging
      setSelectedZone(value);
      setSelectedSite(""); // Reset site selection when zone changes
      setSelectedObjectType(""); // Reset object type when zone changes
      setFilteredObjects([]); // Reset filtered objects
    };

    // Add handler for site selection
    const handleSiteChange = (value: string) => {
      console.log("Selected site:", value); // Add logging
      setSelectedSite(value);
      // When site is selected, filter objects to show only batiments from this site
      if (value && selectedZoneDetails) {
        const site = selectedZoneDetails.sites.find(s => s.id === value);
        if (site) {
          console.log("Site batiments:", site.batiments); // Add logging
          setFilteredObjects(site.batiments || []);
        }
      }
    };

    // Replace handleDragEnd with handleDrop
    const handleDrop = (item: DragItem, targetId: string) => {
      const { id: guaranteeId } = item;

      // If dropping to an object
      if (targetId.startsWith('object-')) {
        const targetObjectId = targetId.replace('object-', '');

        setObjectGuarantees(prev => {
          const newState = { ...prev };

          // Add to target object if not already present
          if (!newState[targetObjectId]?.includes(guaranteeId)) {
            newState[targetObjectId] = [...(newState[targetObjectId] || []), guaranteeId];
          }

          return newState;
        });
      }
    };

    // Add handleRemoveGuarantee function
    const handleRemoveGuarantee = (objectId: string, guaranteeId: string) => {
      setObjectGuarantees(prev => {
        const newState = { ...prev };
        newState[objectId] = newState[objectId].filter(id => id !== guaranteeId);
        return newState;
      });
    };

    // Add navigation functions
    const nextObject = () => {
      setCurrentObjectIndex(prev =>
        prev < selectedObjectIds.length - 1 ? prev + 1 : prev
      );
    };

    const previousObject = () => {
      setCurrentObjectIndex(prev => prev > 0 ? prev - 1 : prev);
    };

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
                  <TabsTrigger value="details" className="flex-1">
                    Objets
                    {showValidation && validationErrors.includes("objects") &&
                      <span className="ml-2 text-red-500">*</span>
                    }
                  </TabsTrigger>
                  <TabsTrigger value="garanties" className="flex-1">
                    Garanties
                    {showValidation && validationErrors.includes("objectGuarantees") &&
                      <span className="ml-2 text-red-500">*</span>
                    }
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="company">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="holderId" className="text-sm font-semibold flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Société
                          </Label>
                          <Select
                            value={selectedSociete}
                            onValueChange={handleSocieteChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez une société" />
                            </SelectTrigger>
                            <SelectContent>
                              {societe.map((societe) => (
                                <SelectItem key={societe.id} value={societe.id}>
                                  {societe.informations_generales.raison_sociale}
                                </SelectItem>
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
                            onValueChange={handleCompagnieChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez une compagnie d'assurance" />
                            </SelectTrigger>
                            <SelectContent>
                              {compagnie_dassurance.map((compagnie) => (
                                <SelectItem key={compagnie.id} value={compagnie.id}>
                                  {compagnie.informations_generales.raison_sociale}
                                </SelectItem>
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
                              <span className="text-red-500 ">*</span>
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
                            <Label htmlFor="startDate" className="text-sm font-semibold flex items-center gap-1">
                              <span className="text-red-500">*</span>
                              Date de début
                            </Label>
                            <DatePicker
                              id="startDate"
                              // showTimeSelect={true}
                              selected={contractData.startDate ? new Date(contractData.startDate) : undefined}
                              // The onChange for react-datepicker provides Date | null
                              onChange={(date: Date | null) => handleDateChange(date as Date, 'startDate')}
                              dateFormat="dd/MM/yyyy"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholderText="Choisir une date"
                              wrapperClassName="datePicker"
                            // showYearDropdown 
                            // yearDropdownItemNumber={5} 
                            />
                            {/* Optional: Add CalendarIcon next to it if desired, maybe using flex */}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-sm font-semibold flex items-center gap-1">
                              <span className="text-red-500">*</span>
                              Date de fin
                            </Label>
                            <DatePicker
                              id="endDate"
                              selected={contractData.endDate ? new Date(contractData.endDate) : undefined}
                              onChange={(date: Date | null) => handleDateChange(date as Date, 'endDate')}
                              dateFormat="dd/MM/yyyy" // Customize the display format
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholderText="Choisir une date"
                            // showYearDropdown 
                            // yearDropdownItemNumber={5} 
                            />
                            {/* Optional: Add CalendarIcon next to it if desired, maybe using flex */}

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

                <TabsContent value="details">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Left side - List of selected objects */}
                        <div className="md:col-span-1 space-y-4">
                          <h3 className="text-lg font-semibold">Objets sélectionnés</h3>

                          {selectedObjectIds.length > 0 ? (
                            <div className="h-[480px] overflow-y-auto pr-2 space-y-4">
                              {selectedObjectIds.map((objectId) => {
                                const object = objects.find(obj => obj.id === objectId);
                                return (
                                  <div key={objectId} className="p-3 border rounded-md bg-background">
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

                          <div className="space-y-4">
                            <div>
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

                            {/* Add zone and site selection for batiment type */}
                            {selectedObjectType === "batiment" && (
                              <div className="space-y-4 border-t pt-4">
                                <div>
                                  <Label htmlFor="zone" className="text-xs font-semibold mb-1 block">
                                    Zone
                                  </Label>
                                  <Select
                                    value={selectedZone}
                                    onValueChange={handleZoneChange}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Sélectionnez une zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {zones.map((zone) => (
                                        <SelectItem key={zone.id} value={zone.id}>
                                          {zone.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedZone && selectedZoneDetails && (
                                  <div>
                                    <Label htmlFor="site" className="text-xs font-semibold mb-1 block">
                                      Site
                                    </Label>
                                    <Select
                                      value={selectedSite}
                                      onValueChange={handleSiteChange}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionnez un site" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {selectedZoneDetails.sites.map((site) => (
                                          <SelectItem key={site.id} value={site.id}>
                                            {site.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Object list */}
                            <div className="flex-1 p-4  bg-muted/20 rounded-md">
                              <h4 className="text-sm font-medium mb-3">Objets disponibles</h4>

                              {selectedObjectType ? (
                                selectedObjectType === "batiment" && !selectedSite ? (
                                  <div className="p-6 border rounded-md text-center bg-muted/5">
                                    <p className="text-muted-foreground">Veuillez sélectionner une zone et un site</p>
                                  </div>
                                ) : filteredObjects.length > 0 ? (
                                  <div className="space-y-3 max-h-[400px]  overflow-y-auto pr-2">
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
                                      <CreateObjects onObjectsCreated={handleObjectCreated} />
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
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="garanties">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Attribution des garanties aux objets</h3>

                        {selectedObjectIds.length === 0 ? (
                          <div className="p-6 border rounded-md text-center bg-muted/5">
                            <p className="text-muted-foreground">
                              Veuillez d'abord sélectionner des objets dans l'onglet précédent
                            </p>
                          </div>
                        ) : (
                          <DndProvider backend={HTML5Backend}>
                            <div className="space-y-6">
                              {/* Available Guarantees Section - Always visible at top */}
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-base font-medium">Garanties disponibles</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {filteredGaranties.length} garanties
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {filteredGaranties.map((garantie, index) => (
                                    <GarantieCard
                                      key={garantie.id}
                                      garantie={garantie}
                                      index={index}
                                      sourceId="available-guarantees"
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Object Carousel Section */}
                              <div className="border rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-base font-medium">
                                      Objet {currentObjectIndex + 1} sur {selectedObjectIds.length}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      {objectGuarantees[selectedObjectIds[currentObjectIndex]]?.length || 0} garanties assignées
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={previousObject}
                                      disabled={currentObjectIndex === 0}
                                    >
                                      Précédent
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={nextObject}
                                      disabled={currentObjectIndex === selectedObjectIds.length - 1}
                                    >
                                      Suivant
                                    </Button>
                                  </div>
                                </div>

                                {/* Current Object Display */}
                                {(() => {
                                  const objectId = selectedObjectIds[currentObjectIndex];
                                  const object = objects.find(obj => obj.id === objectId);
                                  if (!object) return null;

                                  return (
                                    <div className="space-y-4">
                                      {/* Object Details */}
                                      <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                        <Badge>{object.objectType || "Objet"}</Badge>
                                        <h5 className="font-medium">
                                          {object.details.find(d => d.key === "name")?.value ||
                                            object.details.find(d => d.key === "titre")?.value ||
                                            `Objet ${objectId.substring(0, 8)}`}
                                        </h5>
                                      </div>

                                      {/* Drop Zone for Current Object */}
                                      <DropZone
                                        id={`object-${objectId}`}
                                        onDrop={handleDrop}
                                        className="min-h-[200px]"
                                      >
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                          {objectGuarantees[objectId]?.map((guaranteeId, index) => {
                                            const garantie = filteredGaranties.find(g => g.id === guaranteeId);
                                            if (!garantie) return null;

                                            return (
                                              <GarantieCard
                                                key={guaranteeId}
                                                garantie={garantie}
                                                index={index}
                                                sourceId={`object-${objectId}`}
                                                onRemove={() => handleRemoveGuarantee(objectId, guaranteeId)}
                                              />
                                            );
                                          })}
                                        </div>
                                        {(!objectGuarantees[objectId] || objectGuarantees[objectId].length === 0) && (
                                          <div className="text-sm text-muted-foreground text-center py-4">
                                            Faites glisser les garanties ici pour les assigner à cet objet
                                          </div>
                                        )}
                                      </DropZone>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </DndProvider>
                        )}
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
