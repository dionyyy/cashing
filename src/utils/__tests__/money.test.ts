import { formatCompactMoney, formatMoney, parseAmountInput, toMajor, toMinor } from '@/utils/money';

describe('money conversions', () => {
  it('converts major decimals to integer minor units without float drift', () => {
    expect(toMinor('12.50')).toBe(1250);
    expect(toMinor('0.1')).toBe(10);
    expect(toMinor('0.01')).toBe(1);
    expect(toMinor(19.99)).toBe(1999);
    // Classic float trap: 0.1 + 0.2
    expect(toMinor('0.3')).toBe(30);
  });

  it('round-trips minor to major', () => {
    expect(toMajor(1250)).toBe(12.5);
    expect(toMajor(1)).toBe(0.01);
  });

  it('handles invalid input gracefully', () => {
    expect(toMinor('abc')).toBe(0);
    expect(toMinor('')).toBe(0);
  });

  it('parses free-form currency text', () => {
    expect(parseAmountInput('₱1,250.00', 'PHP')).toBe(125000);
    expect(parseAmountInput('$12.5', 'USD')).toBe(1250);
    // JPY has 0 decimals
    expect(parseAmountInput('¥1500', 'JPY')).toBe(1500);
  });
});

describe('money formatting', () => {
  it('formats with currency symbol and separators', () => {
    expect(formatMoney(125000, 'PHP')).toBe('₱1,250.00');
    expect(formatMoney(0, 'PHP')).toBe('₱0.00');
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatMoney(-5000, 'PHP')).toBe('-₱50.00');
  });

  it('adds an explicit plus sign when requested', () => {
    expect(formatMoney(5000, 'PHP', { withSign: true })).toBe('+₱50.00');
  });

  it('respects zero-decimal currencies', () => {
    expect(formatMoney(1500, 'JPY')).toBe('¥1,500');
  });

  it('produces compact labels for charts', () => {
    expect(formatCompactMoney(125000, 'PHP')).toBe('₱1.3k');
    expect(formatCompactMoney(250000000, 'PHP')).toBe('₱2.5M');
    expect(formatCompactMoney(5000, 'PHP')).toBe('₱50');
  });
});
