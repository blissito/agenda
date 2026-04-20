export default ({
  plansUrl,
  displayName,
  daysLeft,
}: {
  plansUrl: string
  displayName?: string | null
  daysLeft: number
}) => `
<body style="font-family:Arial;background-color:#F8F8F8; padding:24px ">
    <div style="min-width:360px; max-width:480px;  margin:0 auto;padding:24px;background-color:#ffffff; border-radius:24px;">
      <div>
        <img alt="logo" style="width:120px; margin-bottom:32px;" src="https://i.imgur.com/sunNMiV.png"/>
      </div>
      <div >
        <img style="width:100%" src="https://i.imgur.com/u30rscF.png "/>
      </div>
      <div style="text-align:left; margin-top:40px; ">
        <h2 style="color:#15191E; font-size:20px; margin-top:24px">
        Tu periodo de prueba está por terminar ⏳
        </h2>
        <p style="color:#4B5563; font-size:14px; line-height:22px; margin-top:16px;">
          ${displayName ? `Hola ${displayName}, t` : "T"}e quedan aproximadamente <strong>${daysLeft} día${daysLeft === 1 ? "" : "s"}</strong>
          de tu prueba gratuita del Plan Profesional. Para que no pierdas acceso a tu agenda, pagos,
          recordatorios y landing, actualiza tu plan ahora.
        </p>
        <p style="color:#15191E; font-size:14px; line-height:22px; margin-top:16px;">
          🎁 <strong>Promo de bienvenida:</strong> actualiza ahora y paga solo el
          <strong>20% de tu mensualidad</strong> durante los primeros <strong>3 meses</strong>
          (80% de descuento). Después, continúas con el precio regular.
        </p>
        <a style="text-decoration:none;" href="${plansUrl}" target="blank">
            <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:200px; margin-top:32px; cursor:pointer;">
          Actualizar plan
            </button>
        </a>
      </div>
       <div style="text-align:center; margin-top:64px; margin-bottom:16px">
           <p style="color:#4B5563;">
          Deník. Tu agenda. Tus clientes. Tu negocio.
        </p>
      </div>
        <div style="text-align:center; margin-top:32px; margin-bottom:16px">
        <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
            <p style="color:#4B5563;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
        </a>
        </div>

    </div>
</body>
`
