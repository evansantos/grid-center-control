export interface ParsedTask {
    task_number: number;
    title: string;
    description: string;
}
export declare function parsePlan(markdown: string): ParsedTask[];
