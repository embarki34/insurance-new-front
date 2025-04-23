
export type contractInput = {
    type_id: string;
    policyNumber: string;
    insuredAmount: string;
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