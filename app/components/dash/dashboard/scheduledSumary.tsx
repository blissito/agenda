export function Scheduled() {
  return (
    <article className="bg-white w-auto rounded-2xl p-5 overflow-y-auto flex flex-col h-96">
        <p className="font-bold">Servicios agendados:</p>
        <span className="flex justify-between items-center mt-5">
          <div className="flex">
            <img src="https://hinves.com/wp-content/uploads/2023/06/como-mantener-tu-piano-en-perfectas-condiciones.jpg" alt="clase" className="w-20 rounded-2xl" />
            <span className="ml-4">
              <p>
                Clase de piano
              </p>
              <p className="text-gray-500">
                10 clases
              </p>
            </span>
          </div>
          <p>36%</p>
        </span>
      </article>
  )
}
