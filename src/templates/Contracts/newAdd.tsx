"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, CalendarIcon, Trash, PlusCircle, Copy, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { contractInput, objectInput } from "@/lib/input-Types"
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

interface DetailObject {
  id: number;
  label: string;
  value: string;
  count: number;
}

interface SchemaAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean';
}

interface ObjectInstance {
  id: string;
  attributes: { [key: string]: string | number | boolean };
}

interface ParameterValue {
  paramKey: string;
  paramLabel: string;
  values: {
    valueKey: string;
    valueLabel: string;
    customValue: string;
  }[];
  id: string; // Unique ID for each parameter group
}

// Value structure from the parameter data
interface ParamValue {
  key: string;
  label: string;
  linked_params: any[];
}

// Define the actual parameter structure that we receive from the API
interface ParameterWithValues {
  id: string;
  key: string;
  label: string;
  values: ParamValue[];
}

// Temporary parameter value inputs for form
interface ParameterFormValues {
  [key: string]: string;
}

// Add a type for the simplified parameter value format for API
interface SimpleKeyValue {
  [key: string]: string;
}

// Update the ContractWithParameters interface
interface ContractWithObjectDetails extends contractInput {
  insuredList: string[]; // Changed to string[] to store object IDs
}

const AddContract = ({ onAdd }: AddContractProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [detailObjects, setDetailObjects] = useState<DetailObject[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newCount, setNewCount] = useState(1)
  const [schemaAttributes, setSchemaAttributes] = useState<SchemaAttribute[]>([]);
  const [schemaApproved, setSchemaApproved] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeType, setNewAttributeType] = useState<'text' | 'number' | 'boolean'>('text');
  const [objectInstances, setObjectInstances] = useState<ObjectInstance[]>([]);
  const [currentInstance, setCurrentInstance] = useState<{ [key: string]: any }>({});
  const [objects, setObjects] = useState<ObjectOutput[]>([]);
  const [selectedObjectType, setSelectedObjectType] = useState<string>("");
  const [filteredObjects, setFilteredObjects] = useState<ObjectOutput[]>([]);
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [showCreateObjectDialog, setShowCreateObjectDialog] = useState(false);

  // New states for parameters
  const [parameters, setParameters] = useState<ParameterWithValues[]>([])
  const [selectedParameter, setSelectedParameter] = useState<string>("")
  const [parameterValues, setParameterValues] = useState<ParameterValue[]>([])
  const [isLoadingParameters, setIsLoadingParameters] = useState(false)
  const [parameterFormValues, setParameterFormValues] = useState<ParameterFormValues>({})
  const [insuranceTypes, setInsuranceTypes] = useState<parameter[]>([])
  const [refetch, setRefetch] = useState(false);

  // Fetch parameters on component mount
  useEffect(() => {
    if (open) {
      fetchParameters()
    }
  }, [open])

  const fetchParameters = async () => {
    setIsLoadingParameters(true)
    try {
      const response = await getParameters().then((response) => {
        const filteredResponse = response.filter((param) => param.key !== "type_dassurance")
        return filteredResponse
      })
      // Convert the response to match our ParameterWithValues interface
      const formattedParameters = response.map(param => {

        const formattedValues = Array.isArray(param.values) && typeof param.values[0] === 'string'
          ? (param.values as unknown as ParamValue[])
          : (param.values as unknown as ParamValue[])

        return {
          ...param,
          values: formattedValues
        }
      })

      setParameters(formattedParameters as ParameterWithValues[])
    } catch (error) {
      console.error("Error fetching parameters:", error)
      toast.error("Échec de la récupération des paramètres")
    } finally {
      setIsLoadingParameters(false)
    }
  }




  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const parameters = await getParameters();
        const insuranceTypes = parameters.filter((type) => type.key === "type_dassurance");
        console.log(insuranceTypes)
        setInsuranceTypes(insuranceTypes);
      } catch (error) {
        console.error("Error fetching insurance types:", error);
      }
    };

    const fetchObjects = async () => {
      try {
        const objectsData = await getObjects();
        setObjects(objectsData.objects);
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

  // When parameter selection changes
  const handleParameterChange = (value: string) => {
    setSelectedParameter(value)
    // Reset form values when parameter changes
    setParameterFormValues({})
  }

  // Handle changes in the form values
  const handleParameterFormChange = (valueKey: string, value: string) => {
    setParameterFormValues(prev => ({
      ...prev,
      [valueKey]: value
    }))
  }

  // Modify the addParameterValues function to group all values into a single object
  const addParameterValues = () => {
    // Get the selected parameter
    const selectedParam = parameters.find(param => param.key === selectedParameter)
    if (!selectedParam) return

    // Process the form values and group them into key-value pairs
    const filledValues = Object.entries(parameterFormValues)
      .filter(([_, value]) => value.trim() !== '')
      .map(([valueKey, customValue]) => {
        const paramValue = selectedParam.values.find(val => val.key === valueKey)
        if (!paramValue) return null

        return {
          key: paramValue.key,
          label: paramValue.label,
          value: customValue
        }
      })
      .filter(Boolean) as { key: string; label: string; value: string }[]

    if (filledValues.length === 0) {
      toast.error("Veuillez remplir au moins un champ")
      return
    }

    // Create a single parameter value object with all the values
    const newParameterValueObject: ParameterValue = {
      paramKey: selectedParam.key,
      paramLabel: selectedParam.label,
      values: filledValues.map(val => ({
        valueKey: val.key,
        valueLabel: val.label,
        customValue: val.value
      })),
      id: Date.now().toString() // Add a unique ID
    }

    // Add the new parameter value object to the list
    setParameterValues(prev => [...prev, newParameterValueObject])

    // Reset just the form values but keep the selected parameter
    setParameterFormValues({})

    toast.success(`Nouveau groupe de valeurs ajouté avec succès`)
  }

  // Update the removeParameterValue function
  const removeParameterValue = (id: string) => {
    setParameterValues(prev => prev.filter(param => param.id !== id))
  }

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

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Use the selectedObjectIds directly
      const contractWithDetails: ContractWithObjectDetails = {
        ...contractData,
        insuredList: selectedObjectIds // Just use the array of IDs
      };

      console.log("Sending contract data:", JSON.stringify(contractWithDetails, null, 2));

      // Use the contractWithDetails object with the object IDs
      await createContract(contractWithDetails as any);
      toast.success("Le contrat a été créé avec succès");
      onAdd();
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Une erreur s'est produite lors de la création du contrat");
    }
    setIsSubmitting(false);
    setOpen(false);
  }

  const addDetailObject = () => {
    if (newLabel.trim() === "" || newValue.trim() === "") return;

    setDetailObjects([
      ...detailObjects,
      {
        id: Date.now(),
        label: newLabel,
        value: newValue,
        count: newCount
      }
    ]);

    // Keep the count, clear the other fields
    setNewLabel("");
    setNewValue("");
  };

  const deleteDetailObject = (id: number) => {
    setDetailObjects(detailObjects.filter(obj => obj.id !== id));
  };

  const getColorForCount = (count: number) => {
    const colors = [
      "bg-blue-100 border-blue-300",
      "bg-green-100 border-green-300",
      "bg-yellow-100 border-yellow-300",
      "bg-purple-100 border-purple-300",
      "bg-red-100 border-red-300",
      "bg-orange-100 border-orange-300",
      "bg-indigo-100 border-indigo-300",
      "bg-pink-100 border-pink-300"
    ];

    return colors[(count - 1) % colors.length];
  };

  const addAttributeToSchema = () => {
    if (!newAttributeName.trim()) return;

    const newAttribute: SchemaAttribute = {
      id: Date.now().toString(),
      name: newAttributeName,
      type: newAttributeType
    };

    setSchemaAttributes([...schemaAttributes, newAttribute]);
    setNewAttributeName("");
  };

  const removeAttributeFromSchema = (id: string) => {
    setSchemaAttributes(schemaAttributes.filter(attr => attr.id !== id));
  };

  const approveSchema = () => {
    if (schemaAttributes.length === 0) return;
    setSchemaApproved(true);
    setCurrentInstance({});
  };

  const resetSchema = () => {
    if (window.confirm("Are you sure? This will delete all objects and reset the schema.")) {
      setSchemaApproved(false);
      setSchemaAttributes([]);
      setObjectInstances([]);
      setCurrentInstance({});
    }
  };

  const updateCurrentInstance = (attributeId: string, value: any) => {
    const attribute = schemaAttributes.find(attr => attr.id === attributeId);
    if (!attribute) return;

    let processedValue = value;
    if (attribute.type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else if (attribute.type === 'boolean') {
      processedValue = Boolean(value);
    }

    setCurrentInstance({
      ...currentInstance,
      [attribute.name]: processedValue
    });
  };

  const addObjectInstance = () => {
    const newInstance: ObjectInstance = {
      id: Date.now().toString(),
      attributes: { ...currentInstance }
    };

    setObjectInstances([...objectInstances, newInstance]);
    setCurrentInstance({});
  };

  const removeObjectInstance = (id: string) => {
    setObjectInstances(objectInstances.filter(obj => obj.id !== id));
  };

  const duplicateObjectInstance = (id: string) => {
    const instanceToDuplicate = objectInstances.find(obj => obj.id === id);
    if (!instanceToDuplicate) return;

    const newInstance: ObjectInstance = {
      id: Date.now().toString(),
      attributes: { ...instanceToDuplicate.attributes }
    };

    setObjectInstances([...objectInstances, newInstance]);
  };

  // Get the selected parameter object
  const selectedParameterObject = parameters.find(p => p.key === selectedParameter);

  return (
    <div className="flex items-center justify-end ">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un nouveau contrat (avec paramètres et détails)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-7xl w-full overflow-y-auto p-6 bg-background shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">Ajouter un nouveau contrat</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="general">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="general" className="flex-1">Général</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
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

                      <div className="space-y-2">
                        <Label htmlFor="insuranceCompanyName" className="text-sm font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Nom de la compagnie d'assurance
                        </Label>
                        <Input
                          id="insuranceCompanyName"
                          value={contractData.insuranceCompanyName}
                          onChange={handleChange}
                          required
                          placeholder="Entrez le nom de la compagnie d'assurance"
                          className="transition-all focus-visible:ring-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="holderName" className="text-sm font-semibold flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Nom du titulaire de la police
                        </Label>
                        <Input
                          id="holderName"
                          value={contractData.holderName}
                          onChange={handleChange}
                          required
                          placeholder="Entrez le nom du titulaire de la police"
                          className="transition-all focus-visible:ring-primary"
                        />
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
                              {parameters.map((param) => (
                                <SelectItem key={param.id} value={param.key}>
                                  {param.label}
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

            <div className="flex justify-end gap-3">
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
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating objects */}

    </div>
  )
}

export default AddContract