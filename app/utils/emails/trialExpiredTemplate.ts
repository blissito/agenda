export default ({
  plansUrl,
  displayName,
}: {
  plansUrl: string
  displayName?: string | null
}) => `
<body style="font-family:Arial;background-color:#F8F8F8; padding:24px ">
    <div style="min-width:360px; max-width:480px;  margin:0 auto;padding:24px;background-color:#ffffff; border-radius:24px;">
      <div>
        <img alt="logo" style="width:120px; margin-bottom:32px;" src="https://i.imgur.com/sunNMiV.png"/>
      </div>
      <div>
        <img style="width:100%" src="https://i.imgur.com/2ucrNEa.png"/>
      </div>
      <div style="text-align:left; margin-top:40px; ">
        <h2 style="color:#15191E; font-size:20px; margin-top:24px">
        Vaya, tu periodo de prueba ha terminado 🚀
        </h2>
        <p style="color:#4B5563; font-size:14px; line-height:22px; margin-top:16px;">
          ${displayName ? `Hola ${displayName}, t` : "T"}u prueba gratuita de 30 días del Plan Profesional acaba de finalizar.
          Tu cuenta sigue activa, pero el acceso a las funciones Pro está pausado hasta que elijas un plan.
        </p>
        <p style="color:#4B5563; font-size:14px; line-height:22px; margin-top:16px;">
          No queremos que dejes de disfrutar de todos los beneficios que Deník tiene para ti y tu negocio,
          por eso preparamos una oferta especial para que sigas con nosotros.
        </p>
        <p style="color:#15191E; font-size:14px; line-height:22px; margin-top:16px;">
          🎁 <strong>Oferta por tiempo limitado:</strong> suscríbete ahora y paga solo el
          <strong>20% de tu mensualidad</strong> durante los primeros <strong>3 meses</strong>
          (80% de descuento). Después, continúas con el precio regular.
        </p>
        <p style="color:#4B5563; font-size:14px; line-height:22px; margin-top:16px;">
          ¡No esperes más! Nos vemos en Deník.me
        </p>
        <a style="text-decoration:none;" href="${plansUrl}" target="blank">
            <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:200px; margin-top:32px; cursor:pointer;">
          Suscribirme
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
