import { describe, expect, it } from 'vitest';
import {
  computeBalances,
  formatCurrency,
  settleUp,
  splitEqually,
  type Expense,
  type Member,
} from './split';

const members: Member[] = [
  { id: 'ana', name: 'Ana' },
  { id: 'beto', name: 'Beto' },
  { id: 'caro', name: 'Caro' },
];

describe('splitEqually', () => {
  it('las partes suman el total, céntimo incluido', () => {
    const shares = splitEqually(10, 3);
    const total = shares.reduce((sum, share) => sum + share, 0);
    expect(Math.round(total * 100)).toBe(1000);
  });

  it('un reparto exacto no deja residuo', () => {
    expect(splitEqually(9, 3)).toEqual([3, 3, 3]);
  });
});

describe('computeBalances', () => {
  it('acredita a quien puso el dinero', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        description: 'Cena',
        amount: 30,
        paidBy: 'ana',
        participants: ['ana', 'beto', 'caro'],
      },
    ];
    const balance = computeBalances(expenses, members).find((b) => b.memberId === 'ana')!;
    expect(balance.net).toBe(20);
  });
});

describe('settleUp', () => {
  it('convierte saldos en el mínimo de pagos', () => {
    const settlements = settleUp([
      { memberId: 'ana', net: 20 },
      { memberId: 'beto', net: -10 },
      { memberId: 'caro', net: -10 },
    ]);
    expect(settlements).toEqual([
      { from: 'beto', to: 'ana', amount: 10 },
      { from: 'caro', to: 'ana', amount: 10 },
    ]);
  });
});

describe('formatCurrency', () => {
  it('usa coma decimal y el símbolo del euro', () => {
    expect(formatCurrency(3.5)).toBe('3,50 €');
    expect(formatCurrency(-4.2)).toBe('-4,20 €');
  });
});
