export type contractInput = {
  type_id: string;
  policyNumber: string;
  insuredAmount: string;
  primeAmount: string;
  insuranceCompanyName: string;
  holderName: string;
  startDate: string;
  endDate: string;
  status: string;
  policyDocument: File | null;
}


export type parameterInput = {
  key: string;
  label: string;
  values: {
    key: string;
    label: string;
    linked_params: {
      param_key: string;
      allowed_values: string[];
    }[];
  }[];
}





export interface objectInput {
  objectType: string
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
  zone: string;
}


