export default ({
  confirmLink,
  serviceName,
  dateString,
  minutes,
  customerName,
  orgName,
  address,
}: {
  confirmLink: string
  serviceName: string
  dateString: string
  minutes: number
  customerName: string
  orgName: string
  address?: string
}) => `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px;">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div>
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px;">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">${customerName}, confirma tu reserva</h2>
    <p style="margin-top:14px; color:#4B5563; font-size:16px;">Pediste agendar en <strong>${orgName}</strong> a través del asistente. Para que tu reserva quede confirmada, da clic en el botón:</p>
    <div style="margin-top:32px; border:1px #EFEFEF solid; border-radius:16px; padding:24px;">
      <h3 style="font-size:16px;">${serviceName}</h3>
      <div style="color:#4B5563; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/ElME1kr.png"/><p style="padding-top:4px;">${dateString}</p></div>
      <div style="color:#4B5563; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/sM63nU1.png"/><p style="padding-top:4px;">Sesión de ${minutes} minutos</p></div>
      ${address ? `<div style="color:#4B5563; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/yJvhZFx.png"/><p style="padding-top:4px;">${address}</p></div>` : ""}
    </div>
    <a href="${confirmLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:32px;">
      Confirmar reserva
    </a>
    <p style="font-size:14px; color:#8391A1; margin-top:24px;">Si no fuiste tú, ignora este correo. El link expira en 7 días.</p>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">
    <a href="https://www.denik.me" target="blank" style="text-decoration:none">
      <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
    </a>
  </div>
</div>
</body>
`
