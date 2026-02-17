import { TokenCounter } from '@/components/token-counter';
import { RateLimitBars } from '@/components/rate-limit-bars';

export default function TokensPage() {
  return (
    <>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 0' }}>
        <RateLimitBars />
      </div>
      <TokenCounter />
    </>
  );
}
