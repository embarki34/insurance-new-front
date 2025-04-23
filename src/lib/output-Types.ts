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
    values: string[];
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
    value: number | boolean | string; // Specific types based on the provided context
}
