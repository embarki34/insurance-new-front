


export interface contractOutput {
  id: string
  type_id: string
  insuranceCompany: InsuranceCompany
  societe: Societe
  policyNumber: string
  insuredAmount: number
  primeAmount: number
  insuredList: InsuredList[]
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt: string
}


export interface InsuredList {
  object_id: string
  garanties: Garanty[]
}




export type parameter = {
    id: string;
    key: string;
    label: string;
    values: {
        key: string;
        label: string;
        valueType: string;
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
    objectType: string; 
    objectName: string;
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
  






  export interface contractOutputById {
    id: string
    type_id: string
    insuranceCompany: InsuranceCompany
    societe: Societe
    policyNumber: string
    insuredAmount: number
    primeAmount: number
    insuredList: InsuredListbyContract[]
    startDate: string
    endDate: string
    status: string
    createdAt: string
    updatedAt: string
  }
  
  export interface InsuranceCompany {
    informations_generales: InformationsGenerales
    coordonnees: Coordonnees
    informations_bancaires: InformationsBancaires
    donnees_specifiques_assurance: DonneesSpecifiquesAssurance
    _id: string
    createdAt: string
    updatedAt: string
    __v: number
  }
  
  export interface InformationsGenerales {
    raison_sociale: string
    forme_juridique: string
    numero_rc: string
    code_activite: string
    capital_social: string
    date_creation: string
  }
  
  export interface Coordonnees {
    contacts: Contacts
    adresse_direction_generale: string
    adresse_direction_regionale: string
    adresse_agence: string
    site_web: string
  }
  
  export interface Contacts {
    PDG: Pdg
    DG: Dg
    DR: Dr
    DA: Da
  }
  
  export interface Pdg {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Dg {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Dr {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Da {
    telephone: string
    fax: string
    email: string
  }
  
  export interface InformationsBancaires {
    nom_banque: string
    rib_ou_numero_compte: string
    devise_compte: string
  }
  
  export interface DonneesSpecifiquesAssurance {
    produits_assurance: string[]
    numero_agrement: string
    validite_agrement: string
  }
  
  export interface Societe {
    informations_generales: InformationsGenerales2
    coordonnees: Coordonnees2
    informations_bancaires: InformationsBancaires2
    _id: string
    createdAt: string
    updatedAt: string
    __v: number
  }
  
  export interface InformationsGenerales2 {
    raison_sociale: string
    forme_juridique: string
    numero_rc: string
    code_activite: string
    capital_social: string
    date_creation: string
  }
  
  export interface Coordonnees2 {
    contacts: Contacts2
    adresse_direction_generale: string
    adresse_direction_regionale: string
    adresse_agence: string
    site_web: string
  }
  
  export interface Contacts2 {
    PDG: Pdg2
    DG: Dg2
    DR: Dr2
    DA: Da2
  }
  
  export interface Pdg2 {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Dg2 {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Dr2 {
    telephone: string
    fax: string
    email: string
  }
  
  export interface Da2 {
    telephone: string
    fax: string
    email: string
  }
  
  export interface InformationsBancaires2 {
    nom_banque: string
    rib_ou_numero_compte: string
    devise_compte: string
  }
  
 
  
  export interface Object {
    _id: string
    objectName: string
    objectType: string
    details: Detail[]
    updatedBy: string
    __v: number
    createdAt: string
    updatedAt: string
  }
  
  export interface Detail {
    key: string
    value: string | number | boolean
  }
  
  export interface Garanty {
    _id: string
    code: string
    label: string
    description: string
    deductible: number
    guarantee_type: string
    rate: number
    insurance_company: string
    validity_duration_months: number
    validity_date: string
    exclusions: any[]
    createdAt: string
    updatedAt: string
    __v: number
  }

  export interface InsuredListbyContract {
    object: Object
    garanties: Garanty[]
  }
  











