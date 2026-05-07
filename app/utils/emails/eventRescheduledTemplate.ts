export default ({
  recipient,
  oldDateString,
  newDateString,
  serviceName,
  minutes,
  displayName,
  address,
  orgName,
  customerName,
  meetingLink,
  confirmLink,
  manageLink,
  termsAndConditions,
}: {
  recipient: "customer" | "owner"
  oldDateString?: string
  newDateString?: string
  serviceName?: string
  minutes?: string | number
  displayName?: string
  address?: string
  customerName?: string
  orgName?: string
  meetingLink?: string
  confirmLink?: string
  manageLink: string
  termsAndConditions?: string
}) => {
  const heading =
    recipient === "owner"
      ? `${customerName ?? "Un cliente"} reagendó su cita`
      : `${customerName ?? "Hola"}, tu cita en ${orgName ?? ""} cambió de fecha`

  const intro =
    recipient === "owner"
      ? `<strong>${customerName ?? "El cliente"}</strong> reagendó su cita${serviceName ? ` de <strong>${serviceName}</strong>` : ""}${orgName ? ` en <strong>${orgName}</strong>` : ""}.`
      : `Te confirmamos que la nueva fecha de tu cita${serviceName ? ` de <strong>${serviceName}</strong>` : ""} ya está agendada.`

  return `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px; ">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div >
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px; ">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">${heading}</h2>
    <p style="margin-top:14px; color:#4B5563; font-size:16px;">${intro}</p>
    <div style="margin-top:40px; border:1px #EFEFEF solid; border-radius:16px; padding:24px;">
      <h3 style="font-size:16px; margin:0 0 16px 0;">
      ${serviceName ?? "Cita"}
      </h3>
      ${oldDateString ? `<div style="color:#9CA3AF; heigth:20px; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px; opacity:0.6;" src="https://i.imgur.com/ElME1kr.png"/><p style="padding-top:4px; text-decoration:line-through;">${oldDateString}</p></div>` : ""}
      <div style="color:#15191E; heigth:20px; margin-bottom:8px; font-size:16px; font-weight:600;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/ElME1kr.png"/><p style="padding-top:4px;">${newDateString ?? ""}</p></div>
      ${minutes ? `<div style="color:#4B5563; heigth:20px; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/sM63nU1.png"/><p style="padding-top:4px;">Sesión de ${minutes} minutos</p></div>` : ""}
      ${displayName ? `<div style="color:#4B5563; heigth:20px; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/e1aqMlR.png"/><p style="padding-top:4px;">Con ${displayName}</p></div>` : ""}
      ${address ? `<div style="color:#4B5563; heigth:20px; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/yJvhZFx.png"/><p style="padding-top:4px;">${address}</p></div>` : ""}
    </div>
    ${
      recipient === "owner"
        ? `<a href="${manageLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:32px;">
      Ver mi agenda
    </a>`
        : `${
            confirmLink
              ? `<a href="${confirmLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:32px; margin-right:8px;">
      Confirmar cita
    </a>`
              : ""
          }
    ${
      meetingLink
        ? `<a href="${meetingLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#F5F5F5; color:#11151A; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:16px;">
      Unirme a la reunión
    </a>`
        : ""
    }
    <p style="font-size:16px; color:#4B5563; margin-top:24px;">Ve a <a href="${manageLink}" target="blank" style="color:#5158F6; text-decoration:underline;">tu cuenta Deník</a> para administrar tus citas.</p>`
    }
  </div>
  <div>
    <p style="font-size:12px; color:#8391A1; margin-top:64px;">${termsAndConditions ?? `Para cambios o cancelaciones contacta directamente con ${orgName ?? "el negocio"}. Deník solo actúa como intermediario en la gestión de reservas.`}</p>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">
    <a href="https://www.denik.me" target="blank" style="text-decoration:none">
      <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
    </a>
  </div>
</div>
</body>
`
}
