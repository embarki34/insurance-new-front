"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Check, CalendarIcon, Trash, PlusCircle, Copy, ThumbsUp } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { contractInput } from "@/lib/input-Types"
import { createContract } from "@/data/contracts.service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/format"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar";
import { fr } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// Mock data for insurance types
const insuranceTypes = [
  { id: "1", name: "Auto Insurance" },
  { id: "2", name: "Life Insurance" },
  { id: "3", name: "Health Insurance" },
  { id: "4", name: "Property Insurance" },
  { id: "5", name: "Travel Insurance" }
];

// Status options
const statusOptions = [
  { value: "active", label: "Active", className: "text-green-500 font-bold hover:text-green-500" },
  { value: "inactive", label: "Inactive", className: "text-red-500 font-bold hover:text-red-500" },
  { value: "pending", label: "Pending", className: "text-yellow-500 font-bold hover:text-yellow-500" }
];

interface AddCaseProps {
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

const AddCase = ({ onAdd }: AddCaseProps) => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contractData, setContractData] = useState<contractInput>({
    type_id: "",
    policyNumber: "",
    insuredAmount: "",
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
    setIsSubmitting(true)
    try {
      await createContract(contractData)
      toast.success("Le contrat a été créé avec succès")
      onAdd()
    } catch (error) {
      toast.error("Une erreur s'est produite lors de la création du contrat")
    }
    setIsSubmitting(false)
    setOpen(false)
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

  return (
    <div className="flex items-center justify-end ">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un nouveau contrat
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl w-full overflow-y-auto p-6 bg-background shadow-lg rounded-lg">
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
                      <div className="space-y-4">
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
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Schéma d'objet dynamique</h3>
                        
                        {!schemaApproved ? (
                          <>
                            <div className="p-4 bg-muted/20 rounded-md">
                              <h4 className="text-sm font-medium mb-3">Définir les attributs du schéma</h4>
                              
                              <div className="grid grid-cols-12 gap-4 mb-4">
                                <div className="col-span-7">
                                  <Label htmlFor="attributeName" className="text-xs font-semibold mb-1 block">Nom de l'attribut</Label>
                                  <Input
                                    id="attributeName"
                                    value={newAttributeName}
                                    onChange={(e) => setNewAttributeName(e.target.value)}
                                    placeholder="ex: nom, prix, quantité"
                                  />
                                </div>
                                
                                <div className="col-span-5">
                                  <Label htmlFor="attributeType" className="text-xs font-semibold mb-1 block">Type</Label>
                                  <Select 
                                    value={newAttributeType} 
                                    onValueChange={(value: any) => setNewAttributeType(value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choisir un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Texte</SelectItem>
                                      <SelectItem value="number">Nombre</SelectItem>
                                      <SelectItem value="boolean">Oui/Non</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addAttributeToSchema}
                                disabled={!newAttributeName.trim()}
                                className="w-full"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un attribut
                              </Button>
                            </div>
                            
                            {schemaAttributes.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Attributs définis</h4>
                                <div className="space-y-2">
                                  {schemaAttributes.map((attr) => (
                                    <div 
                                      key={attr.id} 
                                      className="p-3 border rounded-md flex items-center justify-between bg-background"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{attr.name}</span>
                                        <Badge variant="outline">{attr.type}</Badge>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeAttributeFromSchema(attr.id)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                
                                <Button 
                                  type="button" 
                                  onClick={approveSchema}
                                  className="w-full mt-4"
                                >
                                  <ThumbsUp className="mr-2 h-4 w-4" />
                                  Approuver le schéma
                                </Button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Schéma approuvé</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {schemaAttributes.length} attributs définis
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={resetSchema}
                              >
                                Réinitialiser
                              </Button>
                            </div>
                            
                            <div className="p-4 bg-muted/20 rounded-md">
                              <h4 className="text-sm font-medium mb-3">Ajouter un objet</h4>
                              
                              <div className="space-y-4">
                                {schemaAttributes.map((attr) => (
                                  <div key={attr.id} className="space-y-1">
                                    <Label 
                                      htmlFor={`attr-${attr.id}`} 
                                      className="text-xs font-semibold block"
                                    >
                                      {attr.name}
                                    </Label>
                                    
                                    {attr.type === 'boolean' ? (
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`attr-${attr.id}`}
                                          checked={Boolean(currentInstance[attr.name])}
                                          onCheckedChange={(checked) => 
                                            updateCurrentInstance(attr.id, checked === true)
                                          }
                                        />
                                        <label 
                                          htmlFor={`attr-${attr.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {Boolean(currentInstance[attr.name]) ? 'Oui' : 'Non'}
                                        </label>
                                      </div>
                                    ) : (
                                      <Input
                                        id={`attr-${attr.id}`}
                                        type={attr.type === 'number' ? 'number' : 'text'}
                                        value={currentInstance[attr.name] || ''}
                                        onChange={(e) => updateCurrentInstance(attr.id, e.target.value)}
                                        placeholder={`Entrez ${attr.name}`}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                              
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addObjectInstance}
                                className="w-full mt-4"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter cet objet
                              </Button>
                            </div>
                            
                            {objectInstances.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Objets ajoutés ({objectInstances.length})</h4>
                                <div className="space-y-2">
                                  {objectInstances.map((obj) => (
                                    <div 
                                      key={obj.id} 
                                      className="p-3 border rounded-md bg-background"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="text-xs text-muted-foreground">
                                          Object #{objectInstances.indexOf(obj) + 1}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => duplicateObjectInstance(obj.id)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => removeObjectInstance(obj.id)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <Trash className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {Object.entries(obj.attributes).map(([key, value]) => (
                                          <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{key}:</span>
                                            <span className="text-sm">
                                              {typeof value === 'boolean' 
                                                ? (value ? 'Oui' : 'Non') 
                                                : String(value)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
    </div>
  )
}

export default AddCase