"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Check, Building, MapPin, CreditCard } from "lucide-react"; // Removed Shield
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { createCompagnie, updateCompagnie } from "@/data/societes.service";
// --- Assume API functions exist ---
// import { createCompagnie, updateCompagnie } from "@/data/compagnie.service";
// --- Mock functions if the real ones aren't ready ---
// const createCompagnie = async (data: any) => { console.log("Mock createCompagnie:", data); await new Promise(res => setTimeout(res, 500)); return { id: 'new-comp-123', ...data }; };
const createSociete = async (data: any) => await createCompagnie(data)
const updateSociete = async (data: any, id: string) => await updateCompagnie(id, data)
// --- End Mock ---

// --- Define Helper Types ---
type ContactRole = 'PDG' | 'DG' | 'DR' | 'DA';
type ContactEntry = { telephone: string; fax: string; email: string };

// --- Define Compagnie Input Type (based on CompagnieOutput, excluding read-only) ---
// We derive this from CompagnieOutput for the form state
interface CompagnieInput {
    informations_generales: {
        raison_sociale: string;
        forme_juridique: string;
        numero_rc: string;
        code_activite: string;
        capital_social: string;
        date_creation: string; // Keep as string YYYY-MM-DD for input type="date"
    };
    coordonnees: {
        adresse_direction_generale: string;
        adresse_direction_regionale: string;
        adresse_agence: string;
        contacts: {
            PDG: ContactEntry;
            DG: ContactEntry;
            DR: ContactEntry;
            DA: ContactEntry;
        };
        site_web: string;
    };
    informations_bancaires: {
        nom_banque: string;
        rib_ou_numero_compte: string;
        devise_compte: string;
    };
}

// --- Define CompagnieOutput type (as provided in the prompt) ---
export interface CompagnieOutput {
    id: string;
    informations_generales: {
      raison_sociale: string;
      forme_juridique: string;
      numero_rc: string;
      code_activite: string;
      capital_social: string;
      date_creation: string; // Can be string (ISO date) from backend
    };
    coordonnees: {
      adresse_direction_generale: string;
      adresse_direction_regionale: string;
      adresse_agence: string;
      contacts: {
        PDG: ContactEntry;
        DG: ContactEntry;
        DR: ContactEntry;
        DA: ContactEntry;
      };
      site_web: string;
    };
    informations_bancaires: {
      nom_banque: string;
      rib_ou_numero_compte: string;
      devise_compte: string;
    };
    createdAt: string;
    updatedAt: string;
};


// --- Reusable ContactFields Component (Identical to previous version) ---
interface ContactFieldsProps {
    role: ContactRole;
    contactData: ContactEntry;
    onChange: (role: ContactRole, field: keyof ContactEntry, value: string) => void;
}

const ContactFields = ({ role, contactData, onChange }: ContactFieldsProps) => {
    const roleTitles = { PDG: "Président Directeur Général", DG: "Directeur Général", DR: "Directeur Régional", DA: "Directeur d'Agence" };
    const handleInputChange = (field: keyof ContactEntry, value: string) => { onChange(role, field, value); };

    return (
        <div className="rounded-lg border p-4 bg-muted/20">
            <h3 className="font-medium mb-3">{roleTitles[role]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`${role.toLowerCase()}_telephone`}>Téléphone</Label>
                    <Input id={`${role.toLowerCase()}_telephone`} placeholder="+XXX XXXXXXXX" type="tel" value={contactData?.telephone ?? ''} onChange={(e) => handleInputChange('telephone', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${role.toLowerCase()}_fax`}>Fax</Label>
                    <Input id={`${role.toLowerCase()}_fax`} placeholder="+XXX XXXXXXXX" type="tel" value={contactData?.fax ?? ''} onChange={(e) => handleInputChange('fax', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${role.toLowerCase()}_email`}>Email</Label>
                    <Input id={`${role.toLowerCase()}_email`} type="email" placeholder="email@example.com" value={contactData?.email ?? ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
            </div>
        </div>
    );
};


// --- Main Component for Generic Compagnie ---
interface CreateCompagnieProps {
    // Use CompagnieOutput for the prop, as it includes the ID needed for editing
    company?: CompagnieOutput;
    onSuccess: () => void;
}

// Define the default state structure clearly for CompagnieInput
const defaultCompagnieData: CompagnieInput = {
    informations_generales: {
        raison_sociale: "", forme_juridique: "", numero_rc: "",
        code_activite: "", capital_social: "", date_creation: new Date().toISOString().split('T')[0],
    },
    coordonnees: {
        adresse_direction_generale: "", adresse_direction_regionale: "", adresse_agence: "",
        contacts: {
            PDG: { telephone: "", fax: "", email: "" }, DG: { telephone: "", fax: "", email: "" },
            DR: { telephone: "", fax: "", email: "" }, DA: { telephone: "", fax: "", email: "" },
        },
        site_web: "",
    },
    informations_bancaires: {
        nom_banque: "", rib_ou_numero_compte: "", devise_compte: "",
    },
};

const CreateCompagnie = ({ company, onSuccess }: CreateCompagnieProps) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [companyData, setCompanyData] = useState<CompagnieInput>(
        JSON.parse(JSON.stringify(defaultCompagnieData)) // Deep clone default state
    );

    // Effect to load or reset form data
    useEffect(() => {
        if (company) { // If editing existing company
            setOpen(true);
            // Prepare data for the form state (CompagnieInput) from CompagnieOutput
            const formStateData: CompagnieInput = {
                informations_generales: { ...company.informations_generales },
                coordonnees: { ...company.coordonnees }, // Deep copy might be needed if contacts are mutable elsewhere
                informations_bancaires: { ...company.informations_bancaires },
            };

            // Ensure date format is YYYY-MM-DD for the input
             if (formStateData.informations_generales.date_creation && typeof formStateData.informations_generales.date_creation === 'string') {
                 try {
                    // Attempt to parse and format. Handle potential invalid dates.
                    const dateObj = new Date(formStateData.informations_generales.date_creation);
                    if (!isNaN(dateObj.getTime())) {
                        formStateData.informations_generales.date_creation = dateObj.toISOString().split('T')[0];
                    } else {
                         formStateData.informations_generales.date_creation = defaultCompagnieData.informations_generales.date_creation; // Fallback
                    }
                 } catch (e) {
                     formStateData.informations_generales.date_creation = defaultCompagnieData.informations_generales.date_creation; // Fallback
                 }
             } else {
                 formStateData.informations_generales.date_creation = defaultCompagnieData.informations_generales.date_creation;
             }

            // Ensure all nested contact objects exist (important if source data might be incomplete)
            const defaultContacts = defaultCompagnieData.coordonnees.contacts;
            formStateData.coordonnees.contacts = {
                PDG: { ...defaultContacts.PDG, ...(formStateData.coordonnees.contacts?.PDG || {}) },
                DG: { ...defaultContacts.DG, ...(formStateData.coordonnees.contacts?.DG || {}) },
                DR: { ...defaultContacts.DR, ...(formStateData.coordonnees.contacts?.DR || {}) },
                DA: { ...defaultContacts.DA, ...(formStateData.coordonnees.contacts?.DA || {}) },
            };


            setCompanyData(formStateData);
            setActiveTab("general"); // Start on the first tab when editing
        } else { // If creating a new company or closing/reopening
            // Reset to default when opening for creation or if company prop becomes undefined
             if (open) { // Only reset if dialog is intended to be open (avoids reset on initial mount)
                 setCompanyData(JSON.parse(JSON.stringify(defaultCompagnieData)));
                 setActiveTab("general");
             }
        }
    }, [company, open]); // Re-run when company changes or dialog opens/closes

    // --- Handler for Contact Fields (memoized with useCallback) ---
    const handleContactChange = useCallback((role: ContactRole, field: keyof ContactEntry, value: string) => {
        setCompanyData((prev) => ({
            ...prev,
            coordonnees: {
                ...prev.coordonnees,
                contacts: { ...prev.coordonnees.contacts, [role]: { ...prev.coordonnees.contacts[role], [field]: value } }
            }
        }));
    }, []);

    // --- Handler for General/Banking Fields (memoized with useCallback) ---
    const handleFieldChange = useCallback((section: keyof Omit<CompagnieInput, 'coordonnees'>, field: string, value: any) => {
        setCompanyData((prev) => ({
            ...prev,
            [section]: { ...(prev[section] as any), [field]: value }
        }));
    }, []);

    // --- Handler for top-level Coordonnees fields (addresses, site_web) ---
    const handleCoordonneesChange = useCallback((field: keyof Omit<CompagnieInput['coordonnees'], 'contacts'>, value: string) => {
        setCompanyData((prev) => ({
            ...prev,
            coordonnees: { ...prev.coordonnees, [field]: value }
        }));
    }, []);

    // --- Form Submission ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Use companyData (which is CompagnieInput type) for submission
        const dataToSubmit: CompagnieInput = JSON.parse(JSON.stringify(companyData));

        // Optional: Trim values just before submission
        Object.keys(dataToSubmit.coordonnees.contacts).forEach((role) => {
            const contact = dataToSubmit.coordonnees.contacts[role as ContactRole];
            contact.telephone = contact.telephone.trim();
            contact.fax = contact.fax.trim();
            contact.email = contact.email.trim();
        });
        dataToSubmit.informations_generales.raison_sociale = dataToSubmit.informations_generales.raison_sociale.trim();
        // ... trim other fields as needed ...

        try {
            if (company?.id) { // If editing (company prop has id)
                await updateSociete(dataToSubmit, company.id); // Pass ID separately
                toast.success("Compagnie mise à jour avec succès");
            } else { // If creating
                await createSociete(dataToSubmit);
                toast.success("Compagnie créée avec succès");
            }
            onSuccess(); // Callback to refresh list or perform other actions
            setOpen(false); // Close dialog on success
        } catch (error) {
            console.error("Error submitting compagnie:", error);
            toast.error(company?.id ? "Erreur lors de la mise à jour" : "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    const pdgContact = companyData.coordonnees?.contacts?.PDG ?? defaultCompagnieData.coordonnees.contacts.PDG;
    const dgContact = companyData.coordonnees?.contacts?.DG ?? defaultCompagnieData.coordonnees.contacts.DG;
    const drContact = companyData.coordonnees?.contacts?.DR ?? defaultCompagnieData.coordonnees.contacts.DR;
    const daContact = companyData.coordonnees?.contacts?.DA ?? defaultCompagnieData.coordonnees.contacts.DA;

    return (
        <>
            {!company && ( // Show "Add" button only if not editing
                <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une compagnie
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {company ? "Modifier la compagnie" : "Ajouter une compagnie"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            {/* Tabs List - Reduced to 3 tabs */}
                            <TabsList className="grid grid-cols-3 mb-6">
                                <TabsTrigger value="general" className="flex items-center gap-2"><Building className="h-4 w-4" /><span>Informations</span></TabsTrigger>
                                <TabsTrigger value="coordonnees" className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>Coordonnées</span></TabsTrigger>
                                <TabsTrigger value="banking" className="flex items-center gap-2"><CreditCard className="h-4 w-4" /><span>Bancaire</span></TabsTrigger>
                            </TabsList>

                            {/* Tab: Informations Générales */}
                            <TabsContent value="general" className="space-y-4">
                                <Card><CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="space-y-2"><Label htmlFor="raison_sociale">Raison Sociale*</Label><Input id="raison_sociale" placeholder="Nom de la compagnie" value={companyData.informations_generales.raison_sociale} onChange={(e) => handleFieldChange('informations_generales', 'raison_sociale', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="forme_juridique">Forme Juridique*</Label><Input id="forme_juridique" placeholder="SA, SARL, etc." value={companyData.informations_generales.forme_juridique} onChange={(e) => handleFieldChange('informations_generales', 'forme_juridique', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="numero_rc">Numéro RC*</Label><Input id="numero_rc" placeholder="Numéro RC" value={companyData.informations_generales.numero_rc} onChange={(e) => handleFieldChange('informations_generales', 'numero_rc', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="code_activite">Code Activité*</Label><Input id="code_activite" placeholder="Code NAF/APE..." value={companyData.informations_generales.code_activite} onChange={(e) => handleFieldChange('informations_generales', 'code_activite', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="capital_social">Capital Social*</Label><Input id="capital_social" placeholder="Montant" value={companyData.informations_generales.capital_social} onChange={(e) => handleFieldChange('informations_generales', 'capital_social', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="date_creation">Date de Création*</Label><Input id="date_creation" type="date" value={companyData.informations_generales.date_creation} onChange={(e) => handleFieldChange('informations_generales', 'date_creation', e.target.value)} required /></div>
                                    </div>
                                </CardContent></Card>
                                <div className="flex justify-end">
                                    <Button type="button" onClick={() => setActiveTab("coordonnees")}>Suivant</Button>
                                </div>
                            </TabsContent>

                            {/* Tab: Coordonnées */}
                            <TabsContent value="coordonnees" className="space-y-4">
                                <Card><CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div className="space-y-2 md:col-span-2"><Label htmlFor="site_web">Site Web</Label><Input id="site_web" type="url" placeholder="https://..." value={companyData.coordonnees.site_web} onChange={(e) => handleCoordonneesChange('site_web', e.target.value)} /></div>
                                        <div className="space-y-2 md:col-span-2"><Label htmlFor="adresse_direction_generale">Adresse Direction Générale*</Label><Textarea id="adresse_direction_generale" placeholder="Adresse complète" value={companyData.coordonnees.adresse_direction_generale} onChange={(e) => handleCoordonneesChange('adresse_direction_generale', e.target.value)} required rows={2} /></div>
                                        <div className="space-y-2 md:col-span-2"><Label htmlFor="adresse_direction_regionale">Adresse Direction Régionale</Label><Textarea id="adresse_direction_regionale" placeholder="Adresse complète" value={companyData.coordonnees.adresse_direction_regionale} onChange={(e) => handleCoordonneesChange('adresse_direction_regionale', e.target.value)} rows={2} /></div>
                                        <div className="space-y-2 md:col-span-2"><Label htmlFor="adresse_agence">Adresse Agence</Label><Textarea id="adresse_agence" placeholder="Adresse complète" value={companyData.coordonnees.adresse_agence} onChange={(e) => handleCoordonneesChange('adresse_agence', e.target.value)} rows={2} /></div>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        <h3 className="font-medium text-lg border-b pb-2">Contacts</h3>
                                        <div className="space-y-4">
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
                                        <div className="space-y-2"><Label htmlFor="nom_banque">Nom de la Banque*</Label><Input id="nom_banque" placeholder="Banque principale" value={companyData.informations_bancaires.nom_banque} onChange={(e) => handleFieldChange('informations_bancaires', 'nom_banque', e.target.value)} required /></div>
                                        <div className="space-y-2"><Label htmlFor="devise_compte">Devise du Compte*</Label><Input id="devise_compte" placeholder="EUR, USD..." value={companyData.informations_bancaires.devise_compte} onChange={(e) => handleFieldChange('informations_bancaires', 'devise_compte', e.target.value)} required /></div>
                                        <div className="space-y-2 md:col-span-2"><Label htmlFor="rib">RIB/Numéro de Compte*</Label><Input id="rib" placeholder="Numéro complet" value={companyData.informations_bancaires.rib_ou_numero_compte} onChange={(e) => handleFieldChange('informations_bancaires', 'rib_ou_numero_compte', e.target.value)} required /></div>
                                    </div>
                                </CardContent></Card>
                                <div className="flex justify-between">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab("coordonnees")}>Précédent</Button>
                                    {/* Submit Button is now on the last tab */}
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

export default CreateCompagnie;