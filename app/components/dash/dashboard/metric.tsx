import { AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown } from "lucide-react"

export const Metric=({ info }: { info: {  quantity: number;
    currency?: string | null;
    quantityFormated: string;
    description: string;
    conclusion: string;
    isGrow: boolean;} })=>{
      return (
        <article className="bg-white overflow-hidden rounded-2xl h-48 flex flex-col justify-between p-0">
          <AlertDescription className="ml-8">
            <p className="text-5xl text-left font-bold mt-4">{info.quantityFormated}</p>
            <p className="flex gap-1 text-gray-500">{info.description}</p>
          </AlertDescription>
          
          <AlertDescription className="flex gap-5 text-center mb-4 items-center">
            {info.isGrow?<TrendingUp className="h-10 w-10 text-lime-500 ml-8" />:<TrendingDown className="h-10 w-10 text-rose-500 ml-8" />}
            <figcaption className="text-gray-500">{info.conclusion}</figcaption>
          </AlertDescription>
        </article>
      )
  }