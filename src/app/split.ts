export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
}

export interface Balance {
  memberId: string;
  net: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2).replace('.', ',')} €`;
}

/**
 * Reparte `total` entre `n` personas.
 * Las partes que devuelve deben sumar exactamente `total`, céntimo incluido.
 */
export function splitEqually(total: number, n: number): number[] {
  if (n <= 0) return [];
  const cents = Math.round(total * 100);
  const share = Math.floor(cents / n);
  const remainder = cents % n;

  const shares: number[] = [];
  for (let i = 0; i < n; i++) {
    shares.push((share + (i < remainder ? 1 : 0)) / 100);
  }
  return shares;
}

/**
 * Saldo neto por persona sumando todos los gastos.
 * Un saldo positivo significa que el grupo le debe dinero a esa persona.
 */
export function computeBalances(expenses: Expense[], members: Member[]): Balance[] {
  const net = new Map<string, number>(members.map((member) => [member.id, 0]));

  for (const expense of expenses) {
    net.set(expense.paidBy, (net.get(expense.paidBy) ?? 0) - expense.amount);
    for (const participant of expense.participants) {
      const share = expense.amount / expense.participants.length;
      net.set(participant, (net.get(participant) ?? 0) + share);
    }
  }

  return members.map((member) => ({
    memberId: member.id,
    net: round2(net.get(member.id) ?? 0),
  }));
}

/**
 * Convierte saldos en el mínimo de pagos para dejarlo todo a cero.
 */
export function settleUp(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((balance) => balance.net > 0.005)
    .map((balance) => ({ id: balance.memberId, net: balance.net }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((balance) => balance.net < -0.005)
    .map((balance) => ({ id: balance.memberId, net: balance.net }))
    .sort((a, b) => a.net - b.net);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].net, creditors[j].net);
    settlements.push({ from: debtors[i].id, to: creditors[j].id, amount: round2(amount) });
    debtors[i].net += amount;
    creditors[j].net -= amount;
    if (Math.abs(debtors[i].net) < 0.005) i++;
    if (Math.abs(creditors[j].net) < 0.005) j++;
  }

  return settlements;
}
