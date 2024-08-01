import { Banknote, CreditCard, CircleCheckBig } from 'lucide-react';

export function MethodsPayment() {
  return (
    <article className="bg-white overflow-hidden rounded-2xl h-48 justify-between pl-12 pt-5">
        <p className="font-bold">Formas de pago más utilizadas:</p>
        
        <p className="pt-4 flex"><CircleCheckBig className="text-blue-950 mr-3"/>25% con Paypal</p>
        <p className="pt-4 flex"><Banknote className="text-emerald-600 mr-3" /> 34% con Tarjetas de debito</p>
        <p className="pt-4 flex"><CreditCard className="text-orange-700 mr-3" />41% con Tarjetas de credito</p>
    </article>
  )
}
