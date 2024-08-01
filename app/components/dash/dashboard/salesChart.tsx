"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const chartData = [
  { month: "Agosto 2023", clients: 205 },
  { month: "Septiembre 2023", clients: 237 },
  { month: "Octubre 2023", clients: 73 },
  { month: "Noviembre 2023", clients: 209 },
  { month: "Diciembre 2023", clients: 214 },
  { month: "Enero 2024", clients: 186 },
  { month: "Febrero 2024", clients: 214 },
  { month: "Marzo 2024", clients: 154 },
  { month: "Abril 2024", clients: 174 },
  { month: "Mayo 2024", clients: 189 },
  { month: "Junio 2024", clients: 230 },
  { month: "Julio 2024", clients: 120 },
  { month: "Agosto 2024", clients: 6 },
]

const chartConfig = {
  clients: {
    label: "Clients",
    color: "#65D0C5",
  },
} satisfies ChartConfig

export function SalesChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("clients")
    
  const error = console.error;
  console.error = (...args: any) => {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};

  return (
    <Card className="col-span-2 border-none rounded-2xl">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 text-slate-950">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 ">
          <CardTitle>Ventas</CardTitle>
          <CardDescription>
            Aqui puedes ver un historico de ventas
          </CardDescription>
        </div>
        
      </CardHeader>
      <CardContent className="px-2 sm:p-6 bg-white">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full bg-white"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
               dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
