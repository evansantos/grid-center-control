import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
export class WorktreeManager {
    repoPath;
    constructor(repoPath) {
        this.repoPath = repoPath;
    }
    create(branch) {
        const safeBranch = branch.replace(/\//g, '-');
        const wtPath = path.join(path.dirname(this.repoPath), '.worktrees', safeBranch);
        fs.mkdirSync(path.dirname(wtPath), { recursive: true });
        execSync(`git worktree add -b "${branch}" "${wtPath}"`, {
            cwd: this.repoPath,
            stdio: 'pipe',
        });
        return wtPath;
    }
    list() {
        const output = execSync('git worktree list --porcelain', {
            cwd: this.repoPath,
            encoding: 'utf-8',
        });
        const worktrees = [];
        let current = {};
        for (const line of output.split('\n')) {
            if (line.startsWith('worktree ')) {
                if (current.path)
                    worktrees.push(current);
                current = { path: line.slice(9) };
            }
            else if (line.startsWith('HEAD ')) {
                current.head = line.slice(5);
            }
            else if (line.startsWith('branch ')) {
                current.branch = line.slice(7).replace('refs/heads/', '');
            }
            else if (line === '') {
                if (current.path)
                    worktrees.push(current);
                current = {};
            }
        }
        if (current.path)
            worktrees.push(current);
        return worktrees;
    }
    remove(wtPath) {
        execSync(`git worktree remove "${wtPath}" --force`, {
            cwd: this.repoPath,
            stdio: 'pipe',
        });
    }
}
//# sourceMappingURL=worktree.js.map