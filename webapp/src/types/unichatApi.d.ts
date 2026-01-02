export interface UniChatRelease {
    id: number;
    name: string;
    description: string;
    url: string;
    draft: boolean;
    immutable: boolean;
    prerelease: boolean;
    assets: UniChatReleaseAsset[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface UniChatReleaseAsset {
    id: number;
    name: string;
    size: number;
    contentType: string;
    digest: string;
    url: string;
    createdAt: string;
    updatedAt: string;
}
