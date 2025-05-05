

export type contractInput = {
  type_id: string;
  insuranceCompanyId: string; 
  policyNumber: string; 
  insuredAmount: number; 
  primeAmount: number; 
  societeId: string; 
  insuredList: {
    object_id: string; 
    garanties: string[]; 
  }[];
  startDate: string; // e.g., "2025-05-04T09:29:19.361Z"
  endDate: string; // e.g., "2025-05-04T09:29:19.361Z"
  status: string; // e.g., "active"
  policyDocument: File | null; // e.g., null
}


export type parameterInput = {
  key: string;
  label: string;
  values: {
    key: string;
    label: string;
    valueType: string | boolean | number | Date;
    linked_params: {
      param_key: string;
      allowed_values: string[];
    }[];
  }[];
}





export interface objectInput {
  objectType: string
  objectName: string
  details: Detail[]
  updatedBy: string
}

export interface Detail {
  key: string
  value: any
}



export interface ZoneInput {
  name: string;
  address: string;
}


export interface SiteInput {
  name: string;
  builtSurface: string;
  unbuiltSurface: string;
  totalValue: string;
  batiments: string[];
  zone: string;
}


export interface garantiesInput {
  code: string;
  label: string;
  description: string;
  deductible: string;
  guarantee_type: string;
  rate: number;
  insurance_company: string;
  validity_date: Date ;
  validity_duration_months: number;
  exclusions: string[];
}


export interface CompagnieInput {

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

};

type Contact = {
  telephone: string;
  fax: string;
  email: string;
};

export interface InsuranceCampaniseInput extends CompagnieInput {
  donnees_specifiques_assurance: {
    produits_assurance: string[];
    numero_agrement: string;
    validite_agrement: string;
  };
};





