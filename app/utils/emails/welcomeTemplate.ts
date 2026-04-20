export default ({
  dashUrl,
  displayName,
}: {
  dashUrl: string
  displayName?: string | null
}) => `
<body style="font-family:Arial;background-color:#F8F8F8; padding:24px ">
    <div style="min-width:360px; max-width:480px;  margin:0 auto;padding:24px;background-color:#ffffff; border-radius:24px;">
      <div>
        <img alt="logo" style="width:120px; margin-bottom:32px;" src="https://i.imgur.com/sunNMiV.png"/>
      </div>
      <div>
        <img style="width:100%" src="https://i.imgur.com/93xlYX9.png"/>
      </div>
      <div style="text-align:left; margin-top:40px;">
        <h2 style="color:#15191E; font-size:20px; margin-top:24px">
          ¡Hoy es tu primer día en Deník${displayName ? `, ${displayName}` : ""}! 🤩
        </h2>
        <p style="margin-top:14px; color:#4B5563; font-weight: lighter;">
          Tu prueba gratuita de <strong>30 días</strong> ya empezó. Tienes acceso completo al
          <strong>Plan Profesional</strong>: agenda, recordatorios, pagos, landing y más.
          Conoce todos los beneficios que Deník tiene para ti y tu negocio.
        </p>
        <div style="margin-top:20px; display:block; min-height:80px;">
          <img style="width:100px; float:left;" src="https://i.imgur.com/XQBSM6C.png"/>
          <div>
            <h3 style="margin:0px; font-size:16px; padding-top:16px;">Toma el control de tu agenda</h3>
            <p style="margin-top:4px; color:#4B5563;">Permite a tus clientes agendar citas en línea, y adminístralas desde tu dashboard.</p>
          </div>
        </div>

        <div style="margin-top:32px;display:block; min-height:80px;">
          <img style="width:100px; float:left;" src="https://i.imgur.com/BTsSrCo.png"/>
          <div>
            <h3 style="margin:0px; font-size:16px;">¡No más citas olvidadas!</h3>
            <p style="margin-top:4px; color:#4B5563;">Ya no te dejarán plantado@, confirmamos tus citas y enviamos recordatorios a tus clientes para que no las olviden.</p>
          </div>
        </div>
        <div style="margin-top:32px;display:block; min-height:80px;">
          <img style="width:100px; float:left;" src="https://i.imgur.com/Vachd5c.png"/>
          <div>
            <h3 style="margin:0px; font-size:16px;padding-top:16px;">Recibe pagos en línea</h3>
            <p style="margin-top:4px; color:#4B5563;">No pierdas más clientes, ahora tienes más alternativas de pago desde tu sitio web.</p>
          </div>
        </div>
        <div style="margin-top:32px;display:block; min-height:80px;">
          <div style="width:100px; padding:8px; float:left; box-sizing:border-box;">
            <img style="width:100%; display:block;" src="https://www.denik.me/images/nik.svg"/>
          </div>
          <div>
            <h3 style="margin:0px; font-size:16px;padding-top:16px;">Nik, tu asistente personal</h3>
            <p style="margin-top:4px; color:#4B5563;">Administra tu negocio desde WhatsApp: consulta tu agenda, clientes y servicios hablando con Nik.</p>
          </div>
        </div>
        <p style="color:#4B5563;float:left;">¡No esperes más! Configura tu agenda y empieza a compartirla con tus clientes.</p>
        <a style="text-decoration:none; cursor:pointer;" href="${dashUrl}" target="blank">
          <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:160px; margin-top:40px; cursor:pointer;">
            Probar mi agenda
          </button>
        </a>
      </div>
      <div style="text-align:center; margin-top:64px; margin-bottom:16px">
        <p style="color:#4B5563;">
          Deník. Tu agenda. Tus clientes. Tu negocio.
        </p>
        <a href="https://www.facebook.com/profile.php?id=61563700900314" target="blank" style="text-decoration:none;">
          <img alt="facebook" style="width:28px; height:28px" src="https://i.imgur.com/JvkVAdP.png"/>
        </a>
        <a href="https://www.linkedin.com/company/den%C3%ADk/" target="blank" style="text-decoration:none;">
          <img alt="linkedin" style="width:28px; height:28px" src="https://i.imgur.com/Y8zd5tO.png"/>
        </a>
        <a href="https://www.instagram.com/denik_agenda/" target="blank" style="text-decoration:none;">
          <img alt="instagram" style="width:28px; height:28px" src="https://i.imgur.com/cqGKCq6.png"/>
        </a>
        <a href="https://www.youtube.com/@Den%C3%ADk-v9s" target="blank" style="text-decoration:none;">
          <img alt="youtube" style="width:28px; height:28px" src="https://i.imgur.com/S92vVcz.png"/>
        </a>
      </div>
      <div style="text-align:center; margin-top:32px; margin-bottom:16px">
        <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
          <p style="color:#4B5563;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
        </a>
      </div>
    </div>
</body>
`
