

export type contract = {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}   


export type parameter = {
    id: string;
    key: string;
    label: string;
    values: {
        key: string;
        label: string;
        linked_params: {
            param_key: string;
            allowed_values: string[];
        }[];
    }[]; // Removed hasDependencies property
}



export type pagination = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}







export type getObjectsOutput = {
    objects: ObjectOutput[]
}

export interface ObjectOutput {
    id: string;
    objectType: string; // Fixed to "site" based on the provided context
    details: Detail[];
    createdAt: string;
    updatedAt: string;
}

export interface Detail {
    key: string; // Specific keys based on the provided context
    value: string | number | boolean; // Specific types based on the provided context
}







export interface ZoneOutput {
    id: string;
    name: string;
    address: string;
    sites: string[];
    createdAt: string;
    updatedAt: string;
}


export interface ZoneDetailsOutput {
    id: string;
    name: string;
    address: string;
    sites: SiteOutput[];
    createdAt: string;
    updatedAt: string;
}






export interface SiteOutput {
    id: string;
    name: string;
    zone: string;
    builtSurface: number;
    unbuiltSurface: number;
    batiments: ObjectOutput[];
    totalValue: number;
    createdAt: string;
    updatedAt: string;
}



export interface garantiesOutput {
    id: string;
    code: string;
    label: string;
    description: string;
    deductible: string;
    guarantee_type: string;
    rate: number;
    insurance_company: string;
    validity_duration_months: number;
    validity_date: Date;
    exclusions: string[];
    createdAt: string;
    updatedAt: string;
  }
  


  export interface CompagnieOutput {
    id: string;
    informations_generales: {
      raison_sociale: string;
      forme_juridique: string;
      numero_rc: string;
      code_activite: string;
      capital_social: string;
      date_creation: string;
    };
    coordonnees: {
      adresse_direction_generale: string;
      adresse_direction_regionale: string;
      adresse_agence: string;
      contacts: {
        PDG: Contact;
        DG: Contact;
        DR: Contact;
        DA: Contact;
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
  
  type Contact = {
    telephone: string;
    fax: string;
    email: string;
  };

  export interface InsuranceCampaniseOutput extends CompagnieOutput {
    donnees_specifiques_assurance: {
      produits_assurance: string[];
      numero_agrement: string;
      validite_agrement: string;
    };
  };
  
