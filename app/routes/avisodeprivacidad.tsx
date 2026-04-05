import { type ReactNode, useEffect, useState } from "react"
import { Footer } from "~/components/common/Footer"
import { TopBar } from "~/components/common/topBar"
import { Rocket } from "~/components/icons/rocket"

export default function AvisoDePrivacidad() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [])
  return (
    <main className="bg-brand_dark">
      <div className="bg-white rounded-b-[40px] pb-[120px]">
        <TopBar />

        <div className="grid grid-cols-8 max-w-[90%] xl:max-w-7xl mx-auto gap-12 pt-[240px] ">
          <Tabs />
          <Info />
        </div>
      </div>
      <Footer />
    </main>
  )
}

const Info = () => {
  return (
    <section className="col-span-6">
      <h2 className="group text-4xl lg:text-6xl font-bold text-brand_dark leading-tight flex flex-wrap items-center justify-start">
        <span className="mr-4">Aviso de </span>
        <Rocket className="group-hover:animate-vibration-effect cursor-pointer" />{" "}
        <span className="ml-4 mr-4">Privacidad</span>
      </h2>
      <div>
        <Clause id="identidad" name="1. Identidad del Responsable">
          <div className="flex flex-col gap-4">
            <p>
              En cumplimiento de lo dispuesto por la Ley Federal de Protección
              de Datos Personales en Posesión de los Particulares (en adelante
              "LFPDPPP"), su Reglamento y los Lineamientos del Aviso de
              Privacidad, Deník, con domicilio en los Estados Unidos
              Mexicanos (en adelante "el Responsable"), es responsable del
              tratamiento de los datos personales que nos proporcione, los
              cuales serán protegidos conforme a la legislación vigente en la
              materia.
            </p>
            <p>
              Para cualquier asunto relacionado con el presente Aviso de
              Privacidad, el titular podrá contactarnos a través del correo
              electrónico:{" "}
              <strong className="font-satoMiddle">privacidad@denik.me</strong>
            </p>
          </div>
        </Clause>

        <Clause id="datos" name="2. Datos personales recabados">
          <div className="flex flex-col gap-4">
            <p>
              Para las finalidades señaladas en el presente Aviso de
              Privacidad, podemos recabar las siguientes categorías de datos
              personales:
            </p>
            <p>
              <strong className="font-satoMiddle">
                2.1. Datos del Negocio (usuario de la Plataforma):
              </strong>
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>a. Nombre completo o razón social.</li>
              <li>b. Correo electrónico.</li>
              <li>c. Número telefónico.</li>
              <li>d. País y dirección del establecimiento.</li>
              <li>e. Tipo de negocio y giro comercial.</li>
              <li>f. Logotipo e imágenes del negocio.</li>
              <li>g. Información de servicios ofrecidos (nombre, precio, duración).</li>
              <li>h. Horarios de operación.</li>
              <li>i. Información fiscal para facturación (en su caso).</li>
            </ul>
            <p>
              <strong className="font-satoMiddle">
                2.2. Datos del Usuario Final (cliente del Negocio):
              </strong>
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>a. Nombre completo.</li>
              <li>b. Correo electrónico.</li>
              <li>c. Número telefónico.</li>
              <li>d. Historial de citas y servicios contratados.</li>
              <li>e. Datos de pago procesados por terceros (Stripe y/o MercadoPago).</li>
            </ul>
            <p>
              <strong className="font-satoMiddle">
                2.3. Datos sensibles.
              </strong>{" "}
              Deník no recaba datos personales sensibles de manera directa. Sin
              embargo, dependiendo del giro del Negocio (por ejemplo,
              servicios de salud o estética), la información contenida en las
              notas de citas podría contener datos sensibles. El Negocio es el
              único responsable de informar a sus Usuarios Finales cuando
              recabe datos sensibles a través de la Plataforma.
            </p>
          </div>
        </Clause>

        <Clause id="finalidades" name="3. Finalidades del tratamiento">
          <div className="flex flex-col gap-4">
            <p>
              <strong className="font-satoMiddle">
                3.1. Finalidades primarias (necesarias):
              </strong>
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                a. Crear y administrar la cuenta del Negocio en la Plataforma.
              </li>
              <li>
                b. Proveer los servicios de agendamiento, gestión de citas y
                administración de clientes.
              </li>
              <li>
                c. Procesar pagos a través de los procesadores de pagos
                integrados (Stripe y/o MercadoPago).
              </li>
              <li>
                d. Enviar notificaciones transaccionales por correo electrónico
                (confirmaciones de citas, recordatorios, cancelaciones).
              </li>
              <li>
                e. Generar la página web pública (landing page) del Negocio
                dentro de la Plataforma.
              </li>
              <li>
                f. Proveer soporte técnico y atención al cliente.
              </li>
              <li>
                g. Cumplir con obligaciones legales y fiscales aplicables.
              </li>
            </ul>
            <p>
              <strong className="font-satoMiddle">
                3.2. Finalidades secundarias (no necesarias):
              </strong>
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                a. Enviar comunicaciones de marketing, promociones o novedades
                de la Plataforma.
              </li>
              <li>
                b. Realizar análisis estadísticos y de uso de la Plataforma
                para mejorar nuestros servicios.
              </li>
              <li>
                c. Mostrar el perfil del Negocio en la Comunidad Deník
                (marketplace), cuando el Negocio haya optado por participar.
              </li>
              <li>
                d. Realizar encuestas de satisfacción.
              </li>
            </ul>
            <p>
              Si usted no desea que sus datos personales sean tratados para
              las finalidades secundarias, podrá manifestarlo enviando un
              correo electrónico a{" "}
              <strong className="font-satoMiddle">privacidad@denik.me</strong>{" "}
              con el asunto "Negativa finalidades secundarias". La negativa
              para el uso de sus datos personales para estas finalidades no
              será motivo para que le neguemos los servicios que solicita o
              contrata.
            </p>
          </div>
        </Clause>

        <Clause
          id="ia"
          name="4. Uso de Inteligencia Artificial y transferencia a terceros tecnológicos"
        >
          <div className="flex flex-col gap-4">
            <p>
              <strong className="font-satoMiddle">
                4.1. Funcionalidades de Inteligencia Artificial.
              </strong>{" "}
              La Plataforma ofrece funcionalidades que utilizan modelos de
              inteligencia artificial provistos por terceros ("Proveedores de
              IA"), incluyendo de manera enunciativa mas no limitativa a
              Anthropic (Claude) y OpenAI (DALL-E), para la generación
              automatizada de páginas web (landing pages) del Negocio.
            </p>
            <p>
              <strong className="font-satoMiddle">
                4.2. Datos compartidos con Proveedores de IA.
              </strong>{" "}
              Para el funcionamiento de estas funcionalidades, la siguiente
              información del Negocio podrá ser enviada a los servidores de
              los Proveedores de IA:
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>a. Nombre y descripción del negocio.</li>
              <li>b. Servicios ofrecidos (nombre, descripción, precio).</li>
              <li>c. Horarios de operación.</li>
              <li>d. Imágenes de galería del negocio.</li>
              <li>
                e. Imágenes de referencia subidas por el Negocio para
                personalizar el diseño.
              </li>
            </ul>
            <p>
              <strong className="font-satoMiddle">
                4.3. Datos que NO se comparten.
              </strong>{" "}
              Deník no envía datos personales de los Usuarios Finales (nombre,
              correo electrónico, teléfono, historial de citas) a los
              Proveedores de IA.
            </p>
            <p>
              <strong className="font-satoMiddle">
                4.4. Transferencia internacional.
              </strong>{" "}
              Los Proveedores de IA tienen sus servidores ubicados en los
              Estados Unidos de América. Al utilizar las Funcionalidades de IA,
              el Negocio consiente la transferencia internacional de sus datos
              conforme al artículo 36 de la LFPDPPP. Los Proveedores de IA
              están obligados a mantener medidas de seguridad equivalentes a
              las exigidas por la legislación mexicana conforme a sus propias
              políticas de privacidad.
            </p>
            <p>
              <strong className="font-satoMiddle">
                4.5. Contenido generado.
              </strong>{" "}
              El contenido producido por las Funcionalidades de IA (texto,
              diseño, imágenes) no constituye datos personales. Sin embargo, el
              Negocio es responsable de verificar que el contenido generado no
              incluya inadvertidamente datos personales de terceros antes de
              publicarlo.
            </p>
          </div>
        </Clause>

        <Clause id="transferencias" name="5. Transferencias de datos">
          <div className="flex flex-col gap-4">
            <p>
              Sus datos personales podrán ser transferidos a los siguientes
              terceros, para las finalidades que se indican:
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                <strong className="font-satoMiddle">
                  a. Stripe, Inc. y/o MercadoPago:
                </strong>{" "}
                para el procesamiento de pagos en línea. Estos terceros operan
                como encargados del tratamiento y cuentan con sus propias
                políticas de privacidad.
              </li>
              <li>
                <strong className="font-satoMiddle">
                  b. Amazon Web Services (AWS):
                </strong>{" "}
                para el envío de correos electrónicos transaccionales
                (notificaciones de citas, confirmaciones) a través del servicio
                Amazon SES, y para el almacenamiento de imágenes.
              </li>
              <li>
                <strong className="font-satoMiddle">
                  c. Proveedores de IA (Anthropic, OpenAI):
                </strong>{" "}
                para la generación de contenido mediante las Funcionalidades de
                IA, conforme a lo descrito en la cláusula 4 del presente Aviso.
              </li>
              <li>
                <strong className="font-satoMiddle">
                  d. Pexels:
                </strong>{" "}
                para la obtención de imágenes de stock utilizadas en la
                generación de páginas web. Pexels no recibe datos personales.
              </li>
            </ul>
            <p>
              Las transferencias indicadas en los incisos anteriores no
              requieren del consentimiento del titular, de conformidad con el
              artículo 37 de la LFPDPPP, al ser necesarias para el
              cumplimiento de la relación jurídica entre el titular y el
              Responsable.
            </p>
            <p>
              Deník no venderá, alquilará ni compartirá sus datos personales
              con terceros para fines de marketing sin su consentimiento
              expreso.
            </p>
          </div>
        </Clause>

        <Clause id="derechos" name="6. Derechos ARCO">
          <div className="flex flex-col gap-4">
            <p>
              Usted tiene derecho a conocer qué datos personales tenemos de
              usted, para qué los utilizamos y las condiciones del uso que les
              damos (Acceso). Asimismo, es su derecho solicitar la corrección
              de su información personal en caso de que esté desactualizada,
              sea inexacta o incompleta (Rectificación); que la eliminemos de
              nuestros registros o bases de datos cuando considere que la misma
              no está siendo utilizada adecuadamente (Cancelación); así como
              oponerse al uso de sus datos personales para fines específicos
              (Oposición). Estos derechos se conocen como derechos ARCO.
            </p>
            <p>
              Para el ejercicio de cualquiera de los derechos ARCO, usted
              deberá enviar una solicitud al correo electrónico{" "}
              <strong className="font-satoMiddle">privacidad@denik.me</strong>,
              que contenga al menos la siguiente información:
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                a. Nombre completo del titular y correo electrónico asociado a
                su cuenta.
              </li>
              <li>
                b. Documentos que acrediten la identidad del titular o, en su
                caso, la representación legal.
              </li>
              <li>
                c. Descripción clara y precisa de los datos personales respecto
                de los cuales se busca ejercer alguno de los derechos ARCO.
              </li>
              <li>
                d. Cualquier otro elemento o documento que facilite la
                localización de los datos personales.
              </li>
            </ul>
            <p>
              Deník dará respuesta a su solicitud en un plazo máximo de 20
              días hábiles contados a partir de la fecha en que se reciba la
              solicitud completa. La respuesta indicará si la solicitud es
              procedente y, en su caso, se hará efectiva dentro de los 15 días
              hábiles siguientes a la comunicación de la respuesta. Los plazos
              referidos podrán ser ampliados conforme a lo previsto por la
              LFPDPPP.
            </p>
          </div>
        </Clause>

        <Clause
          id="revocacion"
          name="7. Revocación del consentimiento"
        >
          <div className="flex flex-col gap-4">
            <p>
              Usted puede revocar el consentimiento que, en su caso, nos haya
              otorgado para el tratamiento de sus datos personales. Sin
              embargo, es importante que tenga en cuenta que no en todos los
              casos podremos atender su solicitud o concluir el uso de forma
              inmediata, ya que es posible que por alguna obligación legal
              requiramos seguir tratando sus datos personales.
            </p>
            <p>
              Para revocar su consentimiento deberá enviar su solicitud al
              correo electrónico{" "}
              <strong className="font-satoMiddle">privacidad@denik.me</strong>{" "}
              con el asunto "Revocación de consentimiento", incluyendo la
              información señalada en la cláusula 6 del presente Aviso.
            </p>
          </div>
        </Clause>

        <Clause
          id="cookies"
          name="8. Uso de cookies y tecnologías de rastreo"
        >
          <div className="flex flex-col gap-4">
            <p>
              La Plataforma puede utilizar cookies y tecnologías similares
              para mejorar la experiencia de navegación, recordar preferencias
              y analizar el uso de la Plataforma. Las cookies son archivos de
              datos que se almacenan en su dispositivo y que permiten
              reconocerlo en visitas posteriores.
            </p>
            <p>
              Usted puede deshabilitar el uso de cookies a través de la
              configuración de su navegador de Internet. Sin embargo, esto
              podría afectar el funcionamiento de algunas funcionalidades de la
              Plataforma.
            </p>
          </div>
        </Clause>

        <Clause id="seguridad" name="9. Medidas de seguridad">
          <div className="flex flex-col gap-4">
            <p>
              Deník ha implementado y mantiene medidas de seguridad
              administrativas, técnicas y físicas para proteger sus datos
              personales contra daño, pérdida, alteración, destrucción o el
              uso, acceso o tratamiento no autorizado, incluyendo:
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                a. Cifrado de datos en tránsito mediante protocolo HTTPS/TLS.
              </li>
              <li>
                b. Autenticación mediante enlaces de acceso únicos (magic
                links) que evitan el almacenamiento de contraseñas.
              </li>
              <li>
                c. Almacenamiento de datos en servidores con certificaciones de
                seguridad (MongoDB Atlas, AWS).
              </li>
              <li>
                d. Control de acceso basado en roles para los colaboradores del
                Negocio.
              </li>
              <li>
                e. Los datos de pago son procesados directamente por Stripe y/o
                MercadoPago; Deník no almacena números de tarjeta.
              </li>
            </ul>
          </div>
        </Clause>

        <Clause id="modificaciones" name="10. Modificaciones al Aviso de Privacidad">
          <div className="flex flex-col gap-4">
            <p>
              El presente Aviso de Privacidad puede sufrir modificaciones,
              cambios o actualizaciones derivadas de nuevos requerimientos
              legales, de nuestras propias necesidades por los servicios que
              ofrecemos, de nuestras prácticas de privacidad, de cambios en
              nuestro modelo de negocio, o por otras causas.
            </p>
            <p>
              Nos comprometemos a mantenerlo informado sobre los cambios que
              pueda sufrir el presente Aviso de Privacidad a través de la
              Plataforma y/o mediante correo electrónico enviado a la
              dirección registrada en su cuenta. La fecha de la última
              actualización será visible al final de este documento.
            </p>
          </div>
        </Clause>

        <Clause id="legislacion" name="11. Legislación aplicable y jurisdicción">
          <div className="flex flex-col gap-4">
            <p>
              El presente Aviso de Privacidad se rige por lo dispuesto en la
              Ley Federal de Protección de Datos Personales en Posesión de los
              Particulares, su Reglamento y demás normatividad aplicable en
              los Estados Unidos Mexicanos.
            </p>
            <p>
              Para cualquier controversia derivada del presente Aviso de
              Privacidad, las partes se someten a la jurisdicción de los
              tribunales competentes en los Estados Unidos Mexicanos,
              renunciando expresamente a cualquier otro fuero que pudiera
              corresponderles.
            </p>
          </div>
        </Clause>

        <Clause id="contacto" name="12. Contacto">
          <div className="flex flex-col gap-4">
            <p>
              Si usted tiene dudas, comentarios o desea ejercer sus derechos
              en relación con el tratamiento de sus datos personales, puede
              contactarnos a través de:
            </p>
            <ul className="ml-4 flex flex-col gap-2">
              <li>
                <strong className="font-satoMiddle">Correo electrónico:</strong>{" "}
                hola@denik.me
              </li>
              <li>
                <strong className="font-satoMiddle">Plataforma:</strong>{" "}
                www.denik.me
              </li>
            </ul>
            <p className="mt-4 text-sm text-brand_gray/60">
              Última actualización: Abril 2026
            </p>
          </div>
        </Clause>
      </div>
    </section>
  )
}

const Clause = ({
  id,
  name,
  children,
}: {
  id: string
  name: string
  children: ReactNode
}) => {
  return (
    <section id={id} className="py-40">
      <h3 className="font-title text-xl text-brand_dark font-satoBold">
        {name}
      </h3>
      <p className="mt-4 text-brand_gray">{children}</p>
    </section>
  )
}

const handleClick = (id: string) => {
  const node = document.querySelector(id)
  node?.scrollIntoView({ behavior: "smooth" })
}

const CLAUSE_IDS = [
  "identidad",
  "datos",
  "finalidades",
  "ia",
  "transferencias",
  "derechos",
  "revocacion",
  "cookies",
  "seguridad",
  "modificaciones",
  "legislacion",
  "contacto",
]

const CLAUSE_LABELS = [
  "1. Identidad del Responsable",
  "2. Datos recabados",
  "3. Finalidades",
  "4. Inteligencia Artificial",
  "5. Transferencias",
  "6. Derechos ARCO",
  "7. Revocación",
  "8. Cookies",
  "9. Medidas de seguridad",
  "10. Modificaciones",
  "11. Legislación aplicable",
  "12. Contacto",
]

const Tabs = () => {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    )

    for (const id of CLAUSE_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="col-span-6 xl:col-span-2">
      <div className="bg-white rounded-2xl overflow-hidden sticky top-[280px] flex flex-col gap-2 text-brand_dark">
        {CLAUSE_IDS.map((id, i) => (
          <p
            key={id}
            className={`cursor-pointer font-satoBold transition-colors ${
              activeId === id ? "text-brand_blue" : ""
            }`}
            onClick={() => handleClick(`#${id}`)}
          >
            {CLAUSE_LABELS[i]}
          </p>
        ))}
      </div>
    </section>
  )
}
