interface DataConfigType {
    groups: (SubGroupType | ItemType)[];
}

interface DataConfigGroupType {
    type: 'subGroup' | 'item';
}

interface SubGroupType extends DataConfigGroupType {
    type: 'subGroup';
    id: string;
    name: string;
    icon?: string;
    children: (SubGroupType | ItemType)[];
}

interface ItemType extends DataConfigGroupType {
    type: 'item';
    id: string;
    name: string;
    description: string;
    api_keys: string | string[];
    api_urls: string | string[];
    models: string | string[];
    status: 'active' | 'inactive';
    provider: string;
    icon?: string; // url
}
