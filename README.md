## Welcome to Agenda.

«Considera los efectos prácticos de los objetos de tu concepción. Luego, tu concepción de esos efectos es la totalidad de tu concepción del objeto»

- Charles Sanders Peirce

```
npm start
```

## Webhooks

Los webhooks de pago (Stripe y MercadoPago) son **idempotentes**:
- Verifican si el evento ya existe antes de crear uno nuevo
- El modelo `Event` tiene un unique constraint `@@unique([serviceId, start])` como doble protección

Made by: Brendi and Bliss @ [Fixter.org](http://fixter.org)
