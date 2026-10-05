import { Component, computed, signal } from '@angular/core';
import {
  computeBalances,
  formatCurrency,
  round2,
  settleUp,
  splitEqually,
  type Expense,
  type Member,
} from './split';

interface ExpenseRow {
  id: string;
  description: string;
  paidBy: string;
  amount: string;
  shares: string;
}

interface BalanceRow {
  name: string;
  net: string;
  positive: boolean;
  width: number;
}

interface SettlementRow {
  from: string;
  to: string;
  amount: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly groupName = 'Viaje a la costa';
  protected readonly members: Member[] = [
    { id: 'ana', name: 'Ana' },
    { id: 'beto', name: 'Beto' },
    { id: 'caro', name: 'Caro' },
  ];

  protected readonly expenses = signal<Expense[]>([
    {
      id: 'e1',
      description: 'Cena en el puerto',
      amount: 84.6,
      paidBy: 'ana',
      participants: ['ana', 'beto', 'caro'],
    },
    {
      id: 'e2',
      description: 'Gasolina',
      amount: 46.2,
      paidBy: 'beto',
      participants: ['ana', 'beto', 'caro'],
    },
    {
      id: 'e3',
      description: 'Supermercado',
      amount: 32.55,
      paidBy: 'caro',
      participants: ['ana', 'beto', 'caro'],
    },
    {
      id: 'e4',
      description: 'Café de camino',
      amount: 10,
      paidBy: 'ana',
      participants: ['ana', 'beto', 'caro'],
    },
  ]);

  private readonly nameOf = (id: string) => this.members.find((m) => m.id === id)?.name ?? id;

  protected readonly total = computed(() =>
    round2(this.expenses().reduce((sum, expense) => sum + expense.amount, 0)),
  );

  protected readonly allocated = computed(() =>
    round2(
      this.expenses().reduce(
        (sum, expense) =>
          sum + splitEqually(expense.amount, expense.participants.length).reduce((a, b) => a + b, 0),
        0,
      ),
    ),
  );

  protected readonly difference = computed(() => round2(this.total() - this.allocated()));
  protected readonly mismatch = computed(() => Math.abs(this.difference()) >= 0.005);

  protected readonly totalLabel = computed(() => formatCurrency(this.total()));
  protected readonly allocatedLabel = computed(() => formatCurrency(this.allocated()));
  protected readonly differenceLabel = computed(() => formatCurrency(Math.abs(this.difference())));

  protected readonly rows = computed<ExpenseRow[]>(() =>
    this.expenses().map((expense) => ({
      id: expense.id,
      description: expense.description,
      paidBy: this.nameOf(expense.paidBy),
      amount: formatCurrency(expense.amount),
      shares: splitEqually(expense.amount, expense.participants.length)
        .map((share) => formatCurrency(share))
        .join(' + '),
    })),
  );

  protected readonly balances = computed<BalanceRow[]>(() => {
    const list = computeBalances(this.expenses(), this.members).map((balance) => ({
      name: this.nameOf(balance.memberId),
      net: balance.net,
    }));
    const max = Math.max(...list.map((item) => Math.abs(item.net)), 1);
    return list.map((item) => ({
      name: item.name,
      net: `${item.net > 0 ? '+' : ''}${formatCurrency(item.net)}`,
      positive: item.net > 0,
      width: Math.min(100, (Math.abs(item.net) / max) * 100),
    }));
  });

  protected readonly settlements = computed<SettlementRow[]>(() =>
    settleUp(computeBalances(this.expenses(), this.members)).map((settlement) => ({
      from: this.nameOf(settlement.from),
      to: this.nameOf(settlement.to),
      amount: formatCurrency(settlement.amount),
    })),
  );
}
