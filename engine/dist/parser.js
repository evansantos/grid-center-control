export function parsePlan(markdown) {
    // Build a set of positions inside code fences to skip
    const fenceRanges = [];
    const fenceRegex = /^```[\s\S]*?^```/gm;
    let fenceMatch;
    while ((fenceMatch = fenceRegex.exec(markdown)) !== null) {
        fenceRanges.push({ start: fenceMatch.index, end: fenceMatch.index + fenceMatch[0].length });
    }
    function isInsideCodeFence(index) {
        return fenceRanges.some((r) => index >= r.start && index < r.end);
    }
    const taskRegex = /^### Task (\d+): (.+)$/gm;
    const tasks = [];
    let match;
    const matches = [];
    while ((match = taskRegex.exec(markdown)) !== null) {
        if (isInsideCodeFence(match.index))
            continue;
        matches.push({
            task_number: parseInt(match[1], 10),
            title: match[2].trim(),
            index: match.index,
            headerEnd: match.index + match[0].length,
        });
    }
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].headerEnd;
        const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
        const description = markdown.slice(start, end).trim();
        tasks.push({
            task_number: matches[i].task_number,
            title: matches[i].title,
            description,
        });
    }
    return tasks;
}
//# sourceMappingURL=parser.js.map