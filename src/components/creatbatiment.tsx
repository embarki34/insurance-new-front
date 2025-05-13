"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, Trash, X } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, } from "@/components/ui/card"
import { getParameters, updateParameter } from "@/data/parameters.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createObjects } from "@/data/object.service"
import { Checkbox } from "@/components/ui/checkbox"
import { parameterInput } from "@/lib/input-Types"
import { addBatiment } from "@/data/sites.service"

// Value structure from the parameter data
interface ParamValue {
  key: string;
  label: string;
  linked_params: any[];
}

// Parameter structure
interface ParameterWithValues {
  id: string;
  key: string;
  label: string;
  values: ParamValue[];
}

// Object value structure
interface ObjectValue {
  paramKey: string;
  paramLabel: string;
  objectName: string;
  values: {
    valueKey: string;
    valueLabel: string;
    customValue: string;
  }[];
  id: string;
  selectedFields: string[];
}

// Temporary parameter value inputs for form
interface ParameterFormValues {
  [key: string]: string;
}

// Simple key-value interface
interface SimpleKeyValue {
  [key: string]: string;
}

// New interface for dynamic field addition
interface NewFieldInput {
  key: string;
  label: string;
}

interface CreateBatimentProps {
  onObjectsCreated?: (objects: SimpleKeyValue[]) => void;
  siteId: string;
  onEdit: () => void; 
  oldBatiment: any[];
}

const CreateBatiment = ({ onObjectsCreated, siteId, onEdit, oldBatiment }: CreateBatimentProps) => {
  const [open, setOpen] = useState(false)
  const [batimentType, setBatimentType] = useState("")

  // Parameters state
  const [parameters, setParameters] = useState<ParameterWithValues[]>([])
  const [selectedParameter, setSelectedParameter] = useState<string>("")
  const [isLoadingParameters, setIsLoadingParameters] = useState(false)

  // Created objects state
  const [objectValues, setObjectValues] = useState<ObjectValue[]>([])
  const [parameterFormValues, setParameterFormValues] = useState<ParameterFormValues>({})
  const [selectedFields, setSelectedFields] = useState<string[]>([]) // Track currently selected fields

  // New field addition state
  const [isAddingField, setIsAddingField] = useState(false)
  const [newField, setNewField] = useState<NewFieldInput>({ key: "", label: "" })
  const [isAddingFieldLoading, setIsAddingFieldLoading] = useState(false)
  const [objectName, setObjectName] = useState("")

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add batiment types
  const batimentTypes = [
    "Batiment Administrative",
    "Uniter de Production",
    "Depot de Stoke"
  ]

  // Fetch parameters when component mounts
  useEffect(() => {
    if (open) {
      fetchParameters()
      // Pre-select batiment parameter
      setSelectedParameter("batiment")
    }
  }, [open])

  const fetchParameters = async () => {
    setIsLoadingParameters(true)
    try {
      const response = await getParameters()
      // Convert the response to match our ParameterWithValues interface
      const formattedParameters = response
        .filter(param => param.key === "batiment") // Keep only batiment
        .map(param => {
          const formattedValues = Array.isArray(param.values) && typeof param.values[0] === 'string'
            ? (param.values as unknown as ParamValue[])
            : (param.values as unknown as ParamValue[])

          return {
            ...param,
            values: formattedValues
          }
        });

      setParameters(formattedParameters as ParameterWithValues[])
    } catch (error) {
      console.error("Error fetching parameters:", error)
      toast.error("Échec de la récupération des paramètres")
    } finally {
      setIsLoadingParameters(false)
    }
  }

  // Handle parameter selection
  const handleParameterChange = (value: string) => {
    // If changing to a different parameter type, reset everything
    if (value !== selectedParameter) {
      setSelectedParameter(value)

      // Get all field keys from the selected parameter and pre-select them
      const selectedParam = parameters.find(param => param.key === value)
      if (selectedParam) {
        const allFieldKeys = selectedParam.values.map(value => value.key)
        setSelectedFields(allFieldKeys)
      }

      // Reset form values when parameter changes
      setParameterFormValues({})
    }
  }

  // Handle form value changes
  const handleParameterFormChange = (valueKey: string, value: string) => {
    setParameterFormValues(prev => ({
      ...prev,
      [valueKey]: value
    }))
  }

  // Handle field selection
  const handleFieldSelection = (fieldKey: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFields(prev => [...prev, fieldKey])
    } else {
      // Prevent deselecting if it's the last field
      if (selectedFields.length <= 1) {
        toast.error("Au moins un champ doit être sélectionné")
        return
      }
      setSelectedFields(prev => prev.filter(key => key !== fieldKey))
      // Also remove the value from form values
      const newFormValues = { ...parameterFormValues }
      delete newFormValues[fieldKey]
      setParameterFormValues(newFormValues)
    }
  }

  // Format key for new field
  const formatFieldKey = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  // Add new field to parameter
  const handleAddNewField = async () => {
    if (!selectedParameter || !newField.key || !newField.label) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsAddingFieldLoading(true)
    try {
      // Find the current parameter
      const currentParam = parameters.find(p => p.key === selectedParameter)
      if (!currentParam) return

      // Create updated parameter with new field
      const updatedParam = {
        ...currentParam,
        values: [
          ...currentParam.values,

          {
            key: newField.key,
            label: newField.label,
            valueType: "string",
            linked_params: []
          }
        ]
      }

      // Update parameter in backend
      await updateParameter(currentParam.id, updatedParam as parameterInput)

      // Update local state
      setParameters(prev =>
        prev.map(p =>
          p.key === selectedParameter ? updatedParam : p
        )
      )

      // Reset new field form
      setNewField({ key: "", label: "" })
      setIsAddingField(false)

      toast.success("Nouveau champ ajouté avec succès")
    } catch (error) {
      console.error("Error adding new field:", error)
      toast.error("Erreur lors de l'ajout du nouveau champ")
    } finally {
      setIsAddingFieldLoading(false)
    }
  }

  // Add values to create a new object
  const addParameterValues = () => {
    // Get the selected parameter
    const selectedParam = parameters.find(param => param.key === selectedParameter)
    if (!selectedParam) return

    if (!batimentType) {
      toast.error("Veuillez sélectionner un type de batiment")
      return
    }

    // Process the form values and group them by parameter
    const filledValues = Object.entries(parameterFormValues)
      .filter(([valueKey, value]) => value.trim() !== '' && selectedFields.includes(valueKey))
      .map(([valueKey, customValue]) => {
        const paramValue = selectedParam.values.find(val => val.key === valueKey)
        if (!paramValue) return null

        return {
          valueKey: paramValue.key,
          valueLabel: paramValue.label,
          customValue
        }
      })
      .filter(Boolean) as { valueKey: string; valueLabel: string; customValue: string }[]

    // Add batiment type as a value
    filledValues.push({
      valueKey: "type",
      valueLabel: "Type de Batiment",
      customValue: batimentType
    })

    if (filledValues.length === 0) {
      toast.error("Veuillez remplir au moins un champ")
      return
    }

    // Create a single parameter value object with all the values
    const newObjectValue: ObjectValue = {
      paramKey: selectedParam.key,
      paramLabel: selectedParam.label,
      objectName: objectName.trim(),
      values: filledValues,
      id: Date.now().toString(),
      selectedFields: [...selectedFields]
    }

    // Add the new parameter value object to the list
    setObjectValues(prev => [...prev, newObjectValue])

    // Reset form values but keep selected fields
    setParameterFormValues({})
    setObjectName("")
    setBatimentType("")

    toast.success(`Nouveau objet ajouté avec succès`)
  }

  // Remove an object value
  const removeObjectValue = (id: string) => {
    setObjectValues(prev => prev.filter(obj => obj.id !== id))
  }

  // Get the selected parameter object
  const selectedParameterObject = parameters.find(p => p.key === selectedParameter)

  // Create the final objects as simple key-value pairs
  const createFinalObjects = () => {
    setIsSubmitting(true);

    try {
      // Create array of formatted objects
      const formattedObjects = objectValues.map(objectValue => ({
        objectType: objectValue.paramKey,
        objectName: objectValue.objectName,
        details: objectValue.values.map(value => ({
          key: value.valueKey,
          value: value.customValue
        })),
        updatedBy: "put it fixed"
      }));

      // Single API call for all objects
      createObjects(formattedObjects)
        .then(response => {
          console.log("Created objects:", response);
          
          // Extract batiment IDs from response
          const newBatimentIds = response.map((obj: any) => obj.id);
          
          // Combine old and new batiment IDs
          const allBatimentIds = [...oldBatiment.map((batiment: any) => batiment.id), ...newBatimentIds];
          
          // Add batiments to site
          if (allBatimentIds.length > 0) {
            addBatiment(siteId, allBatimentIds)
              .then(() => {
                toast.success(`${newBatimentIds.length} batiment(s) added successfully`);
                onEdit();
              })
              .catch((error: Error) => {
                console.error("Error adding batiments to site:", error);
                toast.error("Failed to add batiments to site");
              });
          }

          if (onObjectsCreated) {
            onObjectsCreated(formattedObjects as unknown as SimpleKeyValue[]);
          }

          // Reset state
          setObjectValues([]);
          setSelectedParameter("");
          setParameterFormValues({});
          setOpen(false);
        })
        .catch(error => {
          console.error("Error creating objects:", error);
          toast.error("Une erreur s'est produite lors de la création des objets");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (error) {
      console.error("Error formatting objects:", error);
      toast.error("Erreur de format des objets");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className=" h-4 w-4" />
     
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] max-h-[100vh] overflow-hidden p-6 bg-background shadow-lg rounded-lg">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl font-bold">Créer un batiment</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 h-[calc(90vh-12rem)]">
            {/* Left column - List of added objects */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
              <Card className="flex-1 border-none shadow-none bg-muted/30 overflow-hidden flex flex-col">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Objets créés</h3>
                    <Badge variant="secondary" className="text-xs">
                      {objectValues.length} objet{objectValues.length > 1 ? 's' : ''}
                    </Badge>
                  </div>


                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {objectValues.length > 0 ? (
                      <div className="space-y-3">
                        {objectValues.map((objectValue) => (
                          <Card
                            key={objectValue.id}
                            className="bg-background border shadow-sm hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div className="space-y-1">
                                  <h4 className="font-medium text-sm">{objectValue.objectName}</h4>
                                  <Badge className="text-xs px-2 py-1">
                                    {objectValue.values.find(v => v.valueKey === "type")?.customValue || objectValue.paramLabel}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObjectValue(objectValue.id)}
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {objectValue.values.map((value, valueIndex) => (
                                  <div key={valueIndex} className="flex items-start text-sm border-b pb-2 last:border-0 last:pb-0">
                                    <span className="font-medium min-w-28 text-muted-foreground">{value.valueLabel}:</span>
                                    <span className="ml-2 flex-1">{value.customValue}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-background/50 rounded-lg">
                        <div className="text-center p-6 max-w-sm">
                          <div className="bg-muted/30 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-muted-foreground">Aucun objet créé</p>
                          <p className="text-sm text-muted-foreground/60 mt-1">
                            Sélectionnez un paramètre et commencez à créer des objets
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle column - Form */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
              <Card className="flex-1 border-none shadow-none bg-muted/30 overflow-hidden flex flex-col">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="space-y-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Type de Batiment</h3>
                      <Select
                        value={batimentType}
                        onValueChange={setBatimentType}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionnez un type de batiment" />
                        </SelectTrigger>
                        <SelectContent>
                          {batimentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Nom de l'objet</h3>
                      <div className="gap-2">
                        <label htmlFor="objectName" className="text-sm font-medium mb-2">Nom de l'objet</label>
                        <Input
                          id="objectName"
                          placeholder="Nom de l'objet"
                          value={objectName}
                          onChange={(e) => setObjectName(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Valeurs de l'objet</h3>

                    {selectedParameter && selectedParameterObject && (
                      <Badge variant="outline" className="text-xs">
                        {selectedParameterObject.label}
                      </Badge>
                    )}

                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="grid grid-cols-2 gap-12">
                      {selectedParameter && selectedParameterObject && selectedFields.length > 0 ? (
                        <>
                          {selectedParameterObject.values
                            .filter((value) => selectedFields.includes(value.key))
                            .map((value) => (
                              <div key={value.key} className="space-y-2">
                                <Label
                                  htmlFor={`param-${value.key}`}
                                  className="text-sm font-medium block"
                                >
                                  {value.label}
                                </Label>
                                <Input
                                  id={`param-${value.key}`}
                                  value={parameterFormValues[value.key] || ''}
                                  onChange={(e) => handleParameterFormChange(value.key, e.target.value)}
                                  placeholder={`Entrez la valeur pour ${value.label}`}
                                />
                              </div>
                            ))}
                          <div className="col-span-2">
                            <Button
                              type="button"
                              onClick={addParameterValues}
                              className="w-full mt-6"
                              disabled={selectedFields.length === 0 || Object.entries(parameterFormValues)
                                .filter(([key]) => selectedFields.includes(key))
                                .every(([_, val]) => !val || val.trim() === '')}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Ajouter cet objet
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center bg-background/50 rounded-lg col-span-2">
                          <div className="text-center p-6 max-w-sm">
                            <p className="font-medium text-muted-foreground">Aucun champ sélectionné</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">
                              Sélectionnez un paramètre et ses champs pour commencer
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Right column - Parameter selection and field checkboxes */}
            <div className="lg:col-span-4 h-full overflow-hidden flex flex-col">
              <Card className="flex-1 border-none shadow-none bg-muted/30 overflow-hidden flex flex-col">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Configuration</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-6">
                      {/* Parameter selection */}
                      <Card className="bg-background">
                        <CardContent className="p-4">
                          <Label htmlFor="parameter" className="text-sm font-medium mb-2 block">
                            Type de paramètre
                          </Label>
                          <Select
                            value={selectedParameter}
                            onValueChange={handleParameterChange}
                            disabled={isLoadingParameters}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={isLoadingParameters ? "Chargement des paramètres..." : "Sélectionnez un paramètre"} />
                            </SelectTrigger>
                            <SelectContent>
                              {parameters.map((param) => (
                                <SelectItem key={param.id} value={param.key}>
                                  {param.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      {selectedParameter && selectedParameterObject && (
                        <>
                          {/* Field Selection */}
                          <Card className="bg-background">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <h4 className="text-sm font-medium">Champs disponibles</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Sélectionnez les champs à remplir
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsAddingField(true)}
                                  className="text-xs"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Nouveau champ
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {selectedParameterObject.values.map((value) => (
                                  <div
                                    key={value.key}
                                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors"
                                  >
                                    <Checkbox
                                      id={`field-${value.key}`}
                                      checked={selectedFields.includes(value.key)}
                                      onCheckedChange={(checked) => handleFieldSelection(value.key, checked as boolean)}
                                    />
                                    <Label
                                      htmlFor={`field-${value.key}`}
                                      className="cursor-pointer text-sm flex-1"
                                    >
                                      {value.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>

                          {/* New Field Form */}
                          {isAddingField && (
                            <Card className="border-dashed bg-background">
                              <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-sm font-medium">Ajouter un nouveau champ</h5>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setIsAddingField(false)
                                      setNewField({ key: "", label: "" })
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="newFieldLabel">Nom du champ</Label>
                                    <Input
                                      id="newFieldLabel"
                                      value={newField.label}
                                      onChange={(e) => {
                                        const label = e.target.value
                                        setNewField({
                                          label,
                                          key: formatFieldKey(label)
                                        })
                                      }}
                                      placeholder="Ex: Numéro de série"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>Clé:</span>
                                    <Badge variant="outline">{newField.key || 'non définie'}</Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={handleAddNewField}
                                    disabled={isAddingFieldLoading || !newField.label}
                                    className="w-full"
                                  >
                                    {isAddingFieldLoading ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Ajout en cours...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Ajouter le champ
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-32"
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={createFinalObjects}
              className="bg-primary hover:bg-primary/90 min-w-40"
              disabled={isSubmitting || objectValues.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Créer {objectValues.length} objet{objectValues.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateBatiment
