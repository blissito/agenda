export default ({
  customerName,
  serviceName,
  rating,
  comment,
  orgName,
  dashboardUrl,
}: {
  customerName: string
  serviceName: string
  rating: number
  comment: string | null
  orgName: string
  dashboardUrl: string
}) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating)

  return `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px;">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div>
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px;">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">Nueva evaluación que requiere tu atención</h2>
    <p style="margin-top:14px; color:#4B5563"><strong>${customerName}</strong> calificó <strong>${serviceName}</strong> con:</p>
    <p style="font-size:24px; color:#F59E0B; margin:8px 0;">${stars} (${rating}/5)</p>
    ${comment ? `<p style="color:#4B5563; background:#F3F4F6; padding:12px; border-radius:8px; font-style:italic;">"${comment}"</p>` : ""}
    <p style="color:#6B7280; margin-top:16px; font-size:14px;">Te recomendamos dar seguimiento a este cliente para mejorar su experiencia con ${orgName}.</p>
    <a style="text-decoration:none;" href="${dashboardUrl}" target="blank">
      <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:180px; margin-top:24px; cursor:pointer;">
        Ver en dashboard
      </button>
    </a>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">
    <a href="https://www.denik.me" target="blank" style="text-decoration:none;">
      <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník© 2024</p>
    </a>
  </div>
</div>
</body>
`
}
