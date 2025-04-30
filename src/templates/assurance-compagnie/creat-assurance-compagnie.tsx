"use client";

import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Check, Building, MapPin, CreditCard, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
// Ensure this path and type definition are correct
import { InsuranceCampaniseInput } from "@/lib/input-Types";
import { createInsuranceCampanise, updateInsuranceCampanise } from "@/data/insuranceCampanise.service";

// --- Define Helper Types ---
type ContactRole = 'PDG' | 'DG' | 'DR' | 'DA';
type ContactEntry = { telephone: string; fax: string; email: string };

// --- Define ContactFields Component OUTSIDE ---
interface ContactFieldsProps {
  role: ContactRole;
  contactData: ContactEntry;
  // More specific onChange handler for this component
  onChange: (role: ContactRole, field: keyof ContactEntry, value: string) => void;
}

const ContactFields = ({ role, contactData, onChange }: ContactFieldsProps) => {
  const roleTitles = {
    PDG: "Président Directeur Général",
    DG: "Directeur Général",
    DR: "Directeur Régional",
    DA: "Directeur d'Agence"
  };

  // Use the passed onChange prop directly
  const handleInputChange = (field: keyof ContactEntry, value: string) => {
    onChange(role, field, value);
  };

  // console.log(`Rendering ContactFields for ${role}`, contactData); // Add for debugging if needed

  return (
    <div className="rounded-lg border p-4 bg-muted/20">
      <h3 className="font-medium mb-3">{roleTitles[role]}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${role.toLowerCase()}_telephone`}>Téléphone</Label>
          <Input
            id={`${role.toLowerCase()}_telephone`}
            placeholder="+XXX XXXXXXXX"
            type="number"
            // Ensure value is always a string to satisfy Input component
            value={contactData?.telephone ?? ''}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${role.toLowerCase()}_fax`}>Fax</Label>
          <Input
            id={`${role.toLowerCase()}_fax`}
            placeholder="+XXX XXXXXXXX"
            type="number"
            value={contactData?.fax ?? ''}
            onChange={(e) => handleInputChange('fax', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${role.toLowerCase()}_email`}>Email</Label>
          <Input
            id={`${role.toLowerCase()}_email`}
            type="email"
            placeholder="email@example.com"
            value={contactData?.email ?? ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
interface CreateAssuranceCompagnieProps {
  company?: InsuranceCampaniseInput & { id?: string }
  onSuccess: () => void
}

// Define the default state structure clearly
const defaultCompanyData: InsuranceCampaniseInput = {
  informations_generales: {
    raison_sociale: "",
    forme_juridique: "",
    numero_rc: "",
    code_activite: "",
    capital_social: "",
    date_creation: new Date().toISOString().split('T')[0],
  },
  coordonnees: {
    adresse_direction_generale: "",
    adresse_direction_regionale: "",
    adresse_agence: "",
    contacts: {
      PDG: { telephone: "", fax: "", email: "" },
      DG: { telephone: "", fax: "", email: "" },
      DR: { telephone: "", fax: "", email: "" },
      DA: { telephone: "", fax: "", email: "" },
    },
    site_web: "",
  },
  informations_bancaires: {
    nom_banque: "",
    rib_ou_numero_compte: "",
    devise_compte: "",
  },
  donnees_specifiques_assurance: {
    produits_assurance: [],
    numero_agrement: "",
    validite_agrement: "", // Consider if this should be date type? String for now.
  },
};

const CreateAssuranceCompagnie = ({ company, onSuccess }: CreateAssuranceCompagnieProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize state with the default structure
  const [companyData, setCompanyData] = useState<InsuranceCampaniseInput>(
    JSON.parse(JSON.stringify(defaultCompanyData)) // Deep clone default state
  );

  // Effect to load or reset form data
  useEffect(() => {
    if (company) {
      setOpen(true);
      // Deep merge incoming company data with default structure to ensure all fields exist
      // This is a basic deep merge, consider a library like lodash.merge for complex cases
      const mergeDeep = (target: any, source: any): any => {
        const output = { ...target };
        if (isObject(target) && isObject(source)) {
          Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
              if (!(key in target))
                Object.assign(output, { [key]: source[key] });
              else
                output[key] = mergeDeep(target[key], source[key]);
            } else {
              Object.assign(output, { [key]: source[key] ?? '' }); // Use empty string as fallback for null/undefined primitive values
            }
          });
        }
        return output;
      }
      const isObject = (item: any) => {
        return (item && typeof item === 'object' && !Array.isArray(item));
      }

      let mergedData = mergeDeep(defaultCompanyData, company);

      // Ensure date format is correct (YYYY-MM-DD)
      if (mergedData.informations_generales.date_creation && typeof mergedData.informations_generales.date_creation === 'string') {
        mergedData.informations_generales.date_creation = mergedData.informations_generales.date_creation.split('T')[0];
      } else {
        mergedData.informations_generales.date_creation = defaultCompanyData.informations_generales.date_creation;
      }

      // Ensure products_assurance is an array
      if (!Array.isArray(mergedData.donnees_specifiques_assurance.produits_assurance)) {
        mergedData.donnees_specifiques_assurance.produits_assurance = defaultCompanyData.donnees_specifiques_assurance.produits_assurance;
      }


      setCompanyData(mergedData);
    } else {
      // Reset to default when opening for creation or if company becomes undefined
      setCompanyData(JSON.parse(JSON.stringify(defaultCompanyData)));
      setActiveTab("general"); // Reset tab as well
    }
  }, [company, open]); // Re-run when company changes or dialog opens

  // --- Specific Handler for Contact Fields (memoized with useCallback) ---
  const handleContactChange = useCallback((
    role: ContactRole,
    field: keyof ContactEntry,
    value: string
  ) => {
    setCompanyData((prev) => {
      // Create a new object structure for immutability
      return {
        ...prev,
        coordonnees: {
          ...prev.coordonnees,
          contacts: {
            ...prev.coordonnees.contacts,
            [role]: {
              ...prev.coordonnees.contacts[role],
              [field]: value // Update the specific field
            }
          }
        }
      };
    });
  }, []); // Empty dependency array means this function is created once

  // --- General Handler for Non-Contact Fields (memoized with useCallback) ---
  const handleGeneralChange = useCallback((
    section: keyof Omit<InsuranceCampaniseInput, 'coordonnees' | 'donnees_specifiques_assurance'>, // Exclude sections with special handling
    field: string,
    value: any,
  ) => {
    setCompanyData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  }, []);

  // --- Handler for top-level coordonnees fields (addresses, site_web) ---
  const handleCoordonneesChange = useCallback((
    field: keyof Omit<InsuranceCampaniseInput['coordonnees'], 'contacts'>,
    value: string
  ) => {
    setCompanyData((prev) => ({
      ...prev,
      coordonnees: {
        ...prev.coordonnees,
        [field]: value
      }
    }));
  }, []);

  // --- Handler for specific assurance fields (excluding products array) ---
  const handleAssuranceChange = useCallback((
    field: keyof Omit<InsuranceCampaniseInput['donnees_specifiques_assurance'], 'produits_assurance'>,
    value: string
  ) => {
    setCompanyData((prev) => ({
      ...prev,
      donnees_specifiques_assurance: {
        ...prev.donnees_specifiques_assurance,
        [field]: value
      }
    }));
  }, []);


  // --- Handle product array updates (memoized with useCallback) ---
  const handleProductChange = useCallback((value: string) => {
    const products = value.split(',').map(p => p.trim()).filter(p => p !== '');
    setCompanyData(prev => ({
      ...prev,
      donnees_specifiques_assurance: {
        ...prev.donnees_specifiques_assurance,
        produits_assurance: products
      }
    }));
  }, []);

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Optional: Create a deep copy and trim values just before submission
    const dataToSubmit = JSON.parse(JSON.stringify(companyData));
    // Example trimming (apply as needed)
    Object.keys(dataToSubmit.coordonnees.contacts).forEach((role) => {
      const contact = dataToSubmit.coordonnees.contacts[role as ContactRole];
      contact.telephone = contact.telephone.trim();
      contact.fax = contact.fax.trim();
      contact.email = contact.email.trim();
    });
    dataToSubmit.informations_generales.raison_sociale = dataToSubmit.informations_generales.raison_sociale.trim();
    // ... trim other fields ...

    try {
      if (company?.id) {
        await updateInsuranceCampanise(dataToSubmit, company.id);
        toast.success("Compagnie d'assurance mise à jour avec succès");
      } else {
        await createInsuranceCampanise(dataToSubmit);
        toast.success("Compagnie d'assurance créée avec succès");
      }
      onSuccess(); // Callback to refresh list or perform other actions
      setOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Error submitting company:", error);
      toast.error(
        company?.id
          ? "Erreur lors de la mise à jour de la compagnie"
          : "Erreur lors de la création de la compagnie"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---

  // Provide default empty objects for contact data to prevent runtime errors if data is missing
  const pdgContact = companyData.coordonnees?.contacts?.PDG ?? defaultCompanyData.coordonnees.contacts.PDG;
  const dgContact = companyData.coordonnees?.contacts?.DG ?? defaultCompanyData.coordonnees.contacts.DG;
  const drContact = companyData.coordonnees?.contacts?.DR ?? defaultCompanyData.coordonnees.contacts.DR;
  const daContact = companyData.coordonnees?.contacts?.DA ?? defaultCompanyData.coordonnees.contacts.DA;

  return (
    <>
      {/* Button to open dialog (only shown if not editing) */}
      {!company && (
        <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une compagnie
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {company ? "Modifier la compagnie d'assurance" : "Ajouter une compagnie d'assurance"}
          </DialogTitle>
        </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs List */}
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="general" className="flex items-center gap-2"><Building className="h-4 w-4" /><span>Informations</span></TabsTrigger>
                <TabsTrigger value="coordonnees" className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>Coordonnées</span></TabsTrigger>
                <TabsTrigger value="banking" className="flex items-center gap-2"><CreditCard className="h-4 w-4" /><span>Bancaire</span></TabsTrigger>
                <TabsTrigger value="insurance" className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>Assurance</span></TabsTrigger>
              </TabsList>

              {/* Tab: Informations Générales */}
              <TabsContent value="general" className="space-y-4">
                <Card><CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Raison Sociale */}
                    <div className="space-y-2">
                      <Label htmlFor="raison_sociale">Raison Sociale*</Label>
                      <Input id="raison_sociale" placeholder="Nom de la compagnie" value={companyData.informations_generales.raison_sociale} onChange={(e) => handleGeneralChange('informations_generales', 'raison_sociale', e.target.value)} required />
                    </div>
                    {/* Forme Juridique */}
                    <div className="space-y-2">
                      <Label htmlFor="forme_juridique">Forme Juridique*</Label>
                      <Input id="forme_juridique" placeholder="SA, SARL, etc." value={companyData.informations_generales.forme_juridique} onChange={(e) => handleGeneralChange('informations_generales', 'forme_juridique', e.target.value)} required />
                    </div>
                    {/* Numéro RC */}
                    <div className="space-y-2">
                      <Label htmlFor="numero_rc">Numéro RC*</Label>
                      <Input id="numero_rc" placeholder="Numéro du registre de commerce" value={companyData.informations_generales.numero_rc} onChange={(e) => handleGeneralChange('informations_generales', 'numero_rc', e.target.value)} required />
                    </div>
                    {/* Code Activité */}
                    <div className="space-y-2">
                      <Label htmlFor="code_activite">Code Activité*</Label>
                      <Input id="code_activite" placeholder="Code d'activité" value={companyData.informations_generales.code_activite} onChange={(e) => handleGeneralChange('informations_generales', 'code_activite', e.target.value)} required />
                    </div>
                    {/* Capital Social */}
                    <div className="space-y-2">
                      <Label htmlFor="capital_social">Capital Social*</Label>
                      <Input id="capital_social" placeholder="En devise locale" value={companyData.informations_generales.capital_social} onChange={(e) => handleGeneralChange('informations_generales', 'capital_social', e.target.value)} required />
                    </div>
                    {/* Date de Création */}
                <div className="space-y-2">
                      <Label htmlFor="date_creation">Date de Création*</Label>
                      <Input id="date_creation" type="date" value={companyData.informations_generales.date_creation} onChange={(e) => handleGeneralChange('informations_generales', 'date_creation', e.target.value)} required />
                    </div>
                  </div>
                </CardContent></Card>
                <div className="flex justify-end"> {/* Only Next button */}
                  <Button type="button" onClick={() => setActiveTab("coordonnees")}>Suivant</Button>
                </div>
              </TabsContent>

              {/* Tab: Coordonnées */}
              <TabsContent value="coordonnees" className="space-y-4">
                <Card><CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Site Web */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="site_web">Site Web</Label>
                      <Input id="site_web" type="url" placeholder="https://www.example.com" value={companyData.coordonnees.site_web} onChange={(e) => handleCoordonneesChange('site_web', e.target.value)} />
                    </div>
                    {/* Adresse Direction Générale */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse_direction_generale">Adresse Direction Générale*</Label>
                      <Textarea id="adresse_direction_generale" placeholder="Adresse complète" value={companyData.coordonnees.adresse_direction_generale} onChange={(e) => handleCoordonneesChange('adresse_direction_generale', e.target.value)} required rows={2} />
                    </div>
                    {/* Adresse Direction Régionale */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse_direction_regionale">Adresse Direction Régionale</Label>
                      <Textarea id="adresse_direction_regionale" placeholder="Adresse complète" value={companyData.coordonnees.adresse_direction_regionale} onChange={(e) => handleCoordonneesChange('adresse_direction_regionale', e.target.value)} rows={2} />
                    </div>
                    {/* Adresse Agence */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="adresse_agence">Adresse Agence</Label>
                      <Textarea id="adresse_agence" placeholder="Adresse complète" value={companyData.coordonnees.adresse_agence} onChange={(e) => handleCoordonneesChange('adresse_agence', e.target.value)} rows={2} />
                    </div>
                  </div>
                  {/* Contacts Section - Use the external component */}
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium text-lg border-b pb-2">Contacts</h3>
                    <div className="space-y-4">
                      {/* Pass the specific contact data and the memoized handler */}
                      <ContactFields role="PDG" contactData={pdgContact} onChange={handleContactChange} />
                      <ContactFields role="DG" contactData={dgContact} onChange={handleContactChange} />
                      <ContactFields role="DR" contactData={drContact} onChange={handleContactChange} />
                      <ContactFields role="DA" contactData={daContact} onChange={handleContactChange} />
                    </div>
                  </div>
                </CardContent></Card>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("general")}>Précédent</Button>
                  <Button type="button" onClick={() => setActiveTab("banking")}>Suivant</Button>
                </div>
              </TabsContent>

              {/* Tab: Informations Bancaires */}
              <TabsContent value="banking" className="space-y-4">
                <Card><CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Nom Banque */}
                    <div className="space-y-2">
                      <Label htmlFor="nom_banque">Nom de la Banque*</Label>
                      <Input id="nom_banque" placeholder="Banque principale" value={companyData.informations_bancaires.nom_banque} onChange={(e) => handleGeneralChange('informations_bancaires', 'nom_banque', e.target.value)} required />
                    </div>
                    {/* Devise Compte */}
                <div className="space-y-2">
                      <Label htmlFor="devise_compte">Devise du Compte*</Label>
                      <Input id="devise_compte" placeholder="EUR, USD, etc." value={companyData.informations_bancaires.devise_compte} onChange={(e) => handleGeneralChange('informations_bancaires', 'devise_compte', e.target.value)} required />
                    </div>
                    {/* RIB */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="rib">RIB/Numéro de Compte*</Label>
                      <Input id="rib" placeholder="Numéro de compte complet" value={companyData.informations_bancaires.rib_ou_numero_compte} onChange={(e) => handleGeneralChange('informations_bancaires', 'rib_ou_numero_compte', e.target.value)} required />
                    </div>
                  </div>
                </CardContent></Card>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("coordonnees")}>Précédent</Button>
                  <Button type="button" onClick={() => setActiveTab("insurance")}>Suivant</Button>
                </div>
              </TabsContent>

              {/* Tab: Données Spécifiques Assurance */}
              <TabsContent value="insurance" className="space-y-4">
                <Card><CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Numéro Agrément */}
                    <div className="space-y-2">
                      <Label htmlFor="numero_agrement">Numéro Agrément*</Label>
                      <Input id="numero_agrement" placeholder="Numéro d'agrément officiel" value={companyData.donnees_specifiques_assurance.numero_agrement} onChange={(e) => handleAssuranceChange('numero_agrement', e.target.value)} required />
                    </div>
                    {/* Validité Agrément */}
                    <div className="space-y-2">
                      <Label htmlFor="validite_agrement">Validité Agrément*</Label>
                      <Input id="validite_agrement" type="date" placeholder="Date ou mention de validité" value={companyData.donnees_specifiques_assurance.validite_agrement} onChange={(e) => handleAssuranceChange('validite_agrement', e.target.value)} required />
                    </div>
                    {/* Produits Assurance */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="produits_assurance">Produits d'Assurance</Label>
                      <Textarea id="produits_assurance" placeholder="Séparez les produits par des virgules (Auto, Habitation, Santé...)" value={companyData.donnees_specifiques_assurance.produits_assurance.join(', ')} onChange={(e) => handleProductChange(e.target.value)} rows={3} />
                    </div>
              </div>
                </CardContent></Card>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("banking")}>Précédent</Button>
                  {/* Submit Button */}
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{company ? "Mise à jour..." : "Création..."}</>
              ) : (
                      <><Check className="mr-2 h-4 w-4" />{company ? "Mettre à jour" : "Créer"}</>
              )}
            </Button>
          </div>
              </TabsContent>
            </Tabs>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateAssuranceCompagnie;