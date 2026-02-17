export declare class WorktreeManager {
    private repoPath;
    constructor(repoPath: string);
    create(branch: string): string;
    list(): {
        path: string;
        branch: string;
        head: string;
    }[];
    remove(wtPath: string): void;
}
