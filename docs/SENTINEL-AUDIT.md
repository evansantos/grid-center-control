# SENTINEL — Security Audit: Grid Dashboard

**Audit Date:** February 17, 2026  
**Audited by:** Sentinel Agent  
**Target:** Next.js Grid Dashboard (`~/workspace/mcp-projects/grid/app/`)  
**Scope:** Full security assessment covering authentication, input validation, path traversal, command injection, CORS/CSRF, data exposure, and dependencies.

---

## Executive Summary

The Grid Dashboard has several security measures in place, but contains **CRITICAL and HIGH risk vulnerabilities** that require immediate attention. The application implements localhost-only authentication and has basic CORS/CSRF protections, however critical path traversal vulnerabilities and command injection risks were discovered.

**Risk Rating: HIGH** - Immediate remediation recommended.

---

## Findings

### 🔴 CRITICAL - Command Injection Vulnerabilities

**Location:** `/api/agents/[id]/message/route.ts`, `/api/agents/[id]/control/route.ts`

**Issue:** User-controlled input is passed directly to shell commands without proper sanitization.

**Proof of Concept:**
```bash
# Agent Message API - Command injection via agent ID
POST /api/agents/test%3Bcat%20/etc/passwd/message
{
  "message": "hello"  
}
# Executes: openclaw message send --agent test;cat /etc/passwd --text hello

# Agent Control API - Command injection via action
POST /api/agents/test/control  
{
  "action": "pause && rm -rf /"
}
# Could potentially execute: openclaw agent pause && rm -rf / test
```

**Impact:** Remote code execution, system compromise, data theft.

**Recommendation:**
```typescript
// Implement strict allowlists and escaping
const VALID_AGENT_IDS = /^[a-zA-Z0-9_-]+$/;
const VALID_ACTIONS = ['pause', 'resume', 'kill'];

if (!VALID_AGENT_IDS.test(id) || !VALID_ACTIONS.includes(action)) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}

// Use array form of execFile to prevent shell interpretation
const args = ['agent', action, id];
const { stdout, stderr } = await execFileAsync('openclaw', args, { timeout: 15000 });
```

---

### 🔴 CRITICAL - Path Traversal in Files API

**Location:** `/api/files/route.ts`

**Issue:** The `safePath()` function uses `path.resolve()` which can be bypassed with encoded characters and symlinks.

**Proof of Concept:**
```bash
# Attempt directory traversal
GET /api/files?path=..%2F..%2F..%2F..%2Fetc%2Fpasswd&content=true

# Symlink attack (if attacker can create files in workspace)
ln -s /etc/passwd ~/workspace/evil_link
GET /api/files?path=evil_link&content=true
```

**Impact:** Unauthorized file system access, sensitive data exposure.

**Recommendation:**
```typescript
function safePath(relativePath: string): string | null {
  // Decode and normalize the path
  const decoded = decodeURIComponent(relativePath);
  const normalized = path.normalize(decoded);
  
  // Block dangerous patterns
  if (normalized.includes('..') || normalized.startsWith('/') || normalized.includes('\0')) {
    return null;
  }
  
  const resolved = path.resolve(WORKSPACE_ROOT, normalized);
  
  // Check canonical path after resolving symlinks
  const realPath = fs.realpathSync(resolved);
  if (!realPath.startsWith(fs.realpathSync(WORKSPACE_ROOT))) {
    return null;
  }
  
  return resolved;
}
```

---

### 🟠 HIGH - Git Command Injection in Soul API

**Location:** `/api/soul/route.ts`

**Issue:** Git commands use user-controlled `revertHash` parameter without sufficient validation.

**Proof of Concept:**
```bash
POST /api/soul
{
  "agent": "test",
  "file": "SOUL.md", 
  "revertHash": "HEAD; cat /etc/passwd"
}
```

**Impact:** Command injection, unauthorized file access.

**Recommendation:**
```typescript
// Strengthen hash validation
const SAFE_HASH_PATTERN = /^[a-f0-9]{7,40}$/;
if (revertHash && !SAFE_HASH_PATTERN.test(revertHash)) {
  return NextResponse.json({ error: 'Invalid hash format' }, { status: 400 });
}

// Use absolute path and safer git command structure
const args = ['checkout', revertHash, '--', path.basename(resolved)];
await execFileAsync('git', args, {
  cwd: path.dirname(resolved),
  timeout: 10000
});
```

---

### 🟠 HIGH - Missing Dependency Validation

**Location:** `package.json` and imports

**Issue:** Code imports `zod` but it's not declared in dependencies, relying on Next.js bundled version. This creates supply chain risks.

**Impact:** Build failures, potential supply chain attacks.

**Recommendation:**
```bash
# Add explicit Zod dependency
npm install zod@^3.22.0
```

---

### 🟠 HIGH - Insufficient Input Validation

**Location:** Multiple API routes

**Issues:**
1. Skills API allows arbitrary directory enumeration within constraints
2. Soul API accepts any file from `VALID_FILES` list without context validation
3. Agent spawning allows unlimited concurrent spawns

**Recommendations:**
1. Implement rate limiting on all APIs
2. Add file access logging and monitoring
3. Limit concurrent agent spawns per user/session

---

### 🟡 MEDIUM - Localhost Authentication Bypass

**Location:** `middleware.ts`

**Issue:** Relies only on `x-forwarded-for` header which can be spoofed by proxies or load balancers.

**Proof of Concept:**
```bash
curl -H "X-Forwarded-For: 127.0.0.1" http://external-server:3000/api/files?path=../../../etc/passwd
```

**Impact:** Authentication bypass if deployed behind proxy.

**Recommendation:**
```typescript
// Add multiple layers of localhost validation  
const remoteAddr = req.socket.remoteAddress;
const xForwarded = headers.get('x-forwarded-for');
const xRealIP = headers.get('x-real-ip');

const clientIPs = [
  remoteAddr,
  xForwarded?.split(',')[0]?.trim(),
  xRealIP
].filter(Boolean);

if (!clientIPs.some(ip => ALLOWED_HOSTS.includes(ip))) {
  return NextResponse.json({ error: 'Forbidden: non-local request' }, { status: 403 });
}
```

---

### 🟡 MEDIUM - CSRF Protection Gaps

**Location:** `middleware.ts`

**Issue:** CSRF protection allows requests with no Origin/Referer headers, potentially enabling same-site attacks.

**Recommendation:**
```typescript
// Require Origin header for state-changing operations
if (MUTATING_METHODS.includes(method) && !origin && !referer) {
  return NextResponse.json({ error: 'Forbidden: missing origin' }, { status: 403 });
}
```

---

### 🟡 MEDIUM - Information Disclosure

**Location:** Error responses across APIs

**Issue:** Detailed error messages leak system information (file paths, internal structure).

**Recommendation:**
```typescript
// Generic error responses in production
const isDev = process.env.NODE_ENV === 'development';
return NextResponse.json({ 
  error: isDev ? actualError.message : 'Internal server error' 
}, { status: 500 });
```

---

### 🟡 MEDIUM - Dependency Vulnerabilities

**Location:** npm dependencies

**Issue:** npm audit shows 10 moderate severity vulnerabilities in ESLint ecosystem.

```bash
10 moderate severity vulnerabilities
To address issues that do not require attention, run:
  npm audit fix
```

**Recommendation:** Run `npm audit fix` and review breaking changes.

---

## Security Recommendations

### Immediate Actions (Critical/High Priority)

1. **Fix command injection** in agent control and message APIs
2. **Strengthen path traversal protection** in files API  
3. **Secure git command execution** in soul API
4. **Add explicit Zod dependency** to package.json
5. **Implement rate limiting** on all API endpoints

### Secondary Actions (Medium Priority)

1. **Enhance localhost validation** in middleware
2. **Tighten CSRF protection** requirements
3. **Implement error message sanitization**
4. **Run npm audit fix** for dependency vulnerabilities
5. **Add comprehensive input logging** for security monitoring

### Security Controls to Implement

1. **Web Application Firewall (WAF)** rules for path traversal and injection
2. **Rate limiting middleware** (e.g., 100 requests/minute per IP)
3. **Content Security Policy (CSP)** headers
4. **Security headers** (HSTS, X-Frame-Options, etc.)
5. **Audit logging** for all sensitive operations
6. **Input sanitization library** for all user inputs
7. **File upload restrictions** and virus scanning

---

## Testing Recommendations

1. **Automated security scanning** integration in CI/CD
2. **Penetration testing** before production deployment  
3. **Dependency vulnerability monitoring**
4. **Regular security audits** (quarterly)
5. **Fuzz testing** for all API endpoints

---

## Conclusion

The Grid Dashboard requires **immediate security remediation** before production use. The command injection vulnerabilities pose significant risk and should be addressed first. While the localhost-only authentication provides some protection, it's insufficient for a production environment.

Total findings: **2 Critical, 4 High, 4 Medium**

**Next Steps:**
1. Implement Critical and High priority fixes immediately
2. Deploy in staging environment for testing
3. Conduct penetration testing
4. Implement monitoring and logging
5. Regular security reviews and updates

---

*This audit was conducted by Sentinel, OpenClaw's security specialist agent. For questions or clarification, contact the security team.*