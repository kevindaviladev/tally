# Tally

Reparte gastos entre amigos y cuadra las cuentas. Dices quién pagó cada cosa, Tally calcula el saldo de cada persona y el mínimo de pagos para dejarlo todo a cero.

## Desarrollo

```bash
npm install
npm start        # http://localhost:4200
npm test         # tests de la lógica de reparto (vitest)
npm run build    # build de producción
```

## Estructura

- `src/app/split.ts` — lógica de reparto: `splitEqually`, `computeBalances`, `settleUp`, `formatCurrency`.
- `src/app/split.spec.ts` — tests de esa lógica.
- `src/app/app.ts` / `app.html` / `app.css` — la pantalla (grupo, gastos, saldos y cómo saldar).

## Cómo funciona el reparto

Los importes se guardan en céntimos. Al repartir un gasto entre varias personas, las partes deben sumar exactamente el importe original: un saldo positivo significa que el grupo le debe dinero a esa persona.
