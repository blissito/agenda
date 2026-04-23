export default ({
  orgName,
  serviceName,
  surveyLink,
}: {
  serviceName?: string
  orgName?: string
  customerName?: string
  surveyLink: string
}) => `
<body style="font-family:Arial; background-color:#F8F8F8; padding:24px;">
  <div style="min-width:360px; max-width:480px; margin:0 auto; padding:24px; background-color:#ffffff; border-radius:24px;">
    <div>
      <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
    </div>

    <div style="margin-top:24px;">
      <img alt="¡Tu opinión es importante!" style="width:100%; display:block; border-radius:24px;" src="cid:survey-hero"/>
    </div>

    <div style="text-align:left; margin-top:32px;">
      <h2 style="color:#15191E; font-size:20px; font-weight:bold; margin:0;">
        Gracias por visitar ${orgName} 🤓
      </h2>
      <p style="margin-top:16px; color:#4B5563; font-size:14px; line-height:1.6;">
        Esperamos que hayas tenido una muy buena experiencia en tu cita${serviceName ? ` de <strong>${serviceName}</strong>` : ""}.
      </p>
      <p style="margin-top:16px; color:#4B5563; font-size:14px; line-height:1.6;">
        Si tienes un minuto, nos ayudaría muchísimo que nos cuentes cómo te fue dejando una reseña. Tu opinión nos ayuda a saber qué hicimos bien y en qué podemos mejorar.
      </p>
      <p style="margin-top:16px; color:#4B5563; font-size:14px; line-height:1.6;">
        ¡Muchas gracias por tu tiempo y por confiar en nosotros!
      </p>

      <div style="margin-top:32px;">
        <a style="text-decoration:none;" href="${surveyLink}" target="blank">
          <button style="background:#5158F6; height:44px; border-radius:22px; border:none; color:white; padding:0 32px; cursor:pointer; font-size:14px; font-weight:bold;">
            Dejar reseña
          </button>
        </a>
      </div>

      <p style="margin-top:40px; color:#4B5563; font-size:14px; line-height:1.6;">
        Saludos,<br/>
        ${orgName} Team
      </p>
    </div>

    <div style="border-top:1px solid #EFEFEF; margin-top:40px;"></div>

    <div style="text-align:center; margin-top:24px;">
      <p style="color:#4B5563; font-size:13px; margin:0 0 16px 0;">
        Deník. Tu agenda. Tus clientes. Tu negocio.
      </p>
      <a href="https://www.facebook.com/profile.php?id=61563700900314" target="blank" style="text-decoration:none;">
        <img alt="facebook" style="width:24px; height:24px; margin:0 4px;" src="https://i.imgur.com/JvkVAdP.png"/>
      </a>
      <a href="https://www.linkedin.com/company/den%C3%ADk/" target="blank" style="text-decoration:none;">
        <img alt="linkedin" style="width:24px; height:24px; margin:0 4px;" src="https://i.imgur.com/Y8zd5tO.png"/>
      </a>
      <a href="https://www.instagram.com/denik_agenda/" target="blank" style="text-decoration:none;">
        <img alt="instagram" style="width:24px; height:24px; margin:0 4px;" src="https://i.imgur.com/cqGKCq6.png"/>
      </a>
      <a href="https://www.youtube.com/@Den%C3%ADk-v9s" target="blank" style="text-decoration:none;">
        <img alt="youtube" style="width:24px; height:24px; margin:0 4px;" src="https://i.imgur.com/S92vVcz.png"/>
      </a>
    </div>

    <div style="text-align:center; margin-top:16px;">
      <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
        <p style="color:#9CA3AF; font-size:10px; margin:0;">Derechos reservados Deník ${new Date().getFullYear()}</p>
      </a>
    </div>
  </div>
</body>
`
