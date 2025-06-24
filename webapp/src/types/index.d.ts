export interface Dimensions {
    width: number;
    height: number;
}

export interface AppMetadata {
    displayName: string;
    identifier: string;
    version: string;
    description: string;
    authors: string;
    homepage: string;
    icon: number[];
    license: string;
    licenseFile: string;

    widgetsDir: string;
}
