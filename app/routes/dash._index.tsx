import { ArrowDownFromLine } from 'lucide-react';
import { Form, useLoaderData } from "@remix-run/react";
import { RouteTitle } from "~/components/sideBar/routeTitle";

import { Metric } from '~/components/dash/dashboard/metric';
import { SalesChart } from '../components/dash/dashboard/salesChart';
import { Scheduled } from '../components/dash/dashboard/scheduledSumary';
import { MethodsPayment } from '~/components/dash/dashboard/methodsPayment';


export const loader = ()=>{
  return [{
    quantity: 4_500_600,
    currency: 'MXN',
    quantityFormated: '$4,500.00',
    description:'Ventas del mes',
    conclusion:'15% vs mes anterior',
    isGrow:true
  },
  {
    quantity: 28,
    currency: null,
    quantityFormated: '28',
    description:'Nuevos clientes',
    conclusion:'15% vs mes anterior',
    isGrow:true
  },
  {
    quantity: 30,
    currency: null,
    quantityFormated: '30',
    description:'Sesiones agendadas',
    conclusion:'15% vs mes anterior',
    isGrow:true
  },
  {
    quantity: 29,
    currency: null,
    quantityFormated: '29',
    description:'Sesiones confirmadas',
    conclusion:'15% vs mes anterior',
    isGrow:true
  },
  {
    quantity: 1,
    currency: null,
    quantityFormated: '1',
    description:'Sesiones canceladas',
    conclusion:'80% vs mes anterior',
    isGrow:false
  }
 ]
}

export default function Page() {
  const data = useLoaderData<typeof loader>()
  return (
    <section className="">
      <RouteTitle>Dash</RouteTitle>
      <Form className="flex justify-between">
        <input
          type="date"
          className="rounded-3xl border-none shadow-md focus:border-brand_blue transition-all"
        />
        <div className="flex gap-3">
          <select className="rounded-3xl border-none">
            <option value="">General</option>
          </select>
          <div className="rounded-full w-10 h-10 bg-white flex items-center justify-center">
          <ArrowDownFromLine />
          </div>
        </div>
      </Form>
      <section className="grid grid-cols-3  mx-auto gap-5 mt-10">
        {data.map((info, i)=><Metric info={info} key={i}/>)}
       <MethodsPayment />
      </section>
      <section className="grid grid-cols-3 gap-5 mt-5">
        <SalesChart />
        <Scheduled />
      </section>
    </section>
  );
}
