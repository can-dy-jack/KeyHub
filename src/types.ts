export interface DataConfigType {
    groups: ConfigNode[];
}

export interface DataConfigGroupType {
    type: 'subGroup' | 'item';
}

export interface SubGroupType extends DataConfigGroupType {
    type: 'subGroup';
    id: string;
    name: string;
    icon?: string;
    children: ConfigNode[];
}

export interface ItemType extends DataConfigGroupType {
    type: 'item';
    id: string;
    name: string;
    description: string;
    website?: string;
    api_keys: string | string[];
    api_urls: string | string[];
    models: string | string[];
    switch: boolean;
    provider: string;
    icon?: string; // url
}

export type ConfigNode = SubGroupType | ItemType;
