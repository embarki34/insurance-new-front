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
    builtSurface: number;
    zone: string;
    unbuiltSurface: number;
    totalValue: number;
    createdAt: string;
    updatedAt: string;
}
