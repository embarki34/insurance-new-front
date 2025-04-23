"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, Trash } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent,  } from "@/components/ui/card"
import { getParameters } from "@/data/parameters.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createObjects } from "@/data/object.service"

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
  values: {
    valueKey: string;
    valueLabel: string;
    customValue: string;
  }[];
  id: string;
}

// Temporary parameter value inputs for form
interface ParameterFormValues {
  [key: string]: string;
}

// Simple key-value interface
interface SimpleKeyValue {
  [key: string]: string;
}

interface CreateObjectsProps {
  onObjectsCreated?: (objects: SimpleKeyValue[]) => void;
}

const CreateObjects = ({ onObjectsCreated }: CreateObjectsProps) => {
  const [open, setOpen] = useState(false)
  
  // Parameters state
  const [parameters, setParameters] = useState<ParameterWithValues[]>([])
  const [selectedParameter, setSelectedParameter] = useState<string>("")
  const [isLoadingParameters, setIsLoadingParameters] = useState(false)
  
  // Created objects state
  const [objectValues, setObjectValues] = useState<ObjectValue[]>([])
  const [parameterFormValues, setParameterFormValues] = useState<ParameterFormValues>({})
  
  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch parameters when component mounts
  useEffect(() => {
    if (open) {
      fetchParameters()
    }
  }, [open])
  
  const fetchParameters = async () => {
    setIsLoadingParameters(true)
    try {
      const response = await getParameters()
      // Convert the response to match our ParameterWithValues interface
      const formattedParameters = response.map(param => {
        // Handle the parameter values properly. If they are strings, 
        // this is an older format, so we create dummy objects
        const formattedValues = Array.isArray(param.values) && typeof param.values[0] === 'string'
          ? (param.values as string[]).map(val => ({ key: val, label: val, linked_params: [] }))
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
  
  // Handle parameter selection
  const handleParameterChange = (value: string) => {
    setSelectedParameter(value)
    // Reset form values when parameter changes
    setParameterFormValues({})
  }
  
  // Handle form value changes
  const handleParameterFormChange = (valueKey: string, value: string) => {
    setParameterFormValues(prev => ({
      ...prev,
      [valueKey]: value
    }))
  }
  
  // Add values to create a new object
  const addParameterValues = () => {
    // Get the selected parameter
    const selectedParam = parameters.find(param => param.key === selectedParameter)
    if (!selectedParam) return
    
    // Process the form values and group them by parameter
    const filledValues = Object.entries(parameterFormValues)
      .filter(([_, value]) => value.trim() !== '')
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
    
    if (filledValues.length === 0) {
      toast.error("Veuillez remplir au moins un champ")
      return
    }
    
    // Create a single parameter value object with all the values
    const newObjectValue: ObjectValue = {
      paramKey: selectedParam.key,
      paramLabel: selectedParam.label,
      values: filledValues,
      id: Date.now().toString() // Add a unique ID
    }
    
    // Add the new parameter value object to the list
    setObjectValues(prev => [...prev, newObjectValue])
    
    // Reset just the form values but keep the selected parameter
    setParameterFormValues({})
    
    toast.success(`Nouveau groupe de valeurs ajouté avec succès`)
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
                if (onObjectsCreated) {
                    onObjectsCreated(formattedObjects as unknown as SimpleKeyValue[]);
                }
                toast.success("Objets créés avec succès");
                
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
            <Plus className="mr-2 h-4 w-4" />
            Créer des objets dynamiques
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl w-full overflow-y-auto p-6 bg-background shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">Créer des objets</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left side - List of added objects */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold">Objets créés</h3>
              
              {objectValues.length > 0 ? (
                <div className="h-[480px] overflow-y-auto pr-2 space-y-2">
                  {objectValues.map((objectValue) => (
                    <div 
                      key={objectValue.id} 
                      className="p-3 border rounded-md bg-background"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge className="text-xs">
                          {objectValue.paramLabel}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeObjectValue(objectValue.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {objectValue.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="flex items-start text-sm border-b pb-1 last:border-0">
                            <span className="font-medium min-w-24">{value.valueLabel}:</span>
                            <span className="ml-2">{value.customValue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[480px] border rounded-md flex items-center justify-center bg-muted/10">
                  <div className="text-center p-4 text-muted-foreground">
                    <p>Aucun objet créé</p>
                    <p className="text-sm">Sélectionnez un paramètre à droite pour créer des objets</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Parameter selection and form */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold">Définir un objet</h3>
              
              {/* Parameter selection dropdown */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="parameter" className="text-sm font-semibold mb-1 block">
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
                    </div>
                    
                    {selectedParameter && selectedParameterObject && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Remplir les détails pour {selectedParameterObject.label}</h4>
                        
                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                          {selectedParameterObject.values.map((paramValue) => (
                            <div key={paramValue.key} className="space-y-1">
                              <Label 
                                htmlFor={`param-${paramValue.key}`} 
                                className="text-xs font-semibold block"
                              >
                                {paramValue.label}
                              </Label>
                              <Input
                                id={`param-${paramValue.key}`}
                                value={parameterFormValues[paramValue.key] || ''}
                                onChange={(e) => handleParameterFormChange(paramValue.key, e.target.value)}
                                placeholder={`Entrez la valeur pour ${paramValue.label}`}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          type="button"
                          onClick={addParameterValues}
                          className="w-full mt-2"
                          variant="outline"
                          disabled={Object.values(parameterFormValues).every(val => !val || val.trim() === '')}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter cet objet
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="min-w-24"
            >
              Annuler
            </Button>
            
            <Button
              type="button"
              onClick={createFinalObjects}
              className="bg-primary hover:bg-primary/90 min-w-32 transition-colors"
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
                  Créer les objets
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateObjects
