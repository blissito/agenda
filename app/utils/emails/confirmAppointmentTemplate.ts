export default ({
  confirmLink,
  meetingLink,
  serviceName,
  dateString,
  minutes,
  displayName,
  address,
  orgName,
  customerName,
  hoursUntil,
  termsAndConditions,
}: {
  confirmLink: string
  meetingLink?: string
  serviceName?: string
  dateString?: string
  minutes?: string | number
  displayName?: string
  address?: string
  customerName?: string
  orgName?: string
  hoursUntil?: number
  termsAndConditions?: string
}) => `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px; ">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div >
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px; ">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">${customerName}, confirma tu cita${hoursUntil ? ` ${hoursUntil === 1 ? "en 1 hora" : `en ${hoursUntil} horas`}` : ""}</h2>
    <p style="margin-top:14px; color:#4B5563; font-size:16px;">¿Sigues asistiendo a tu cita en <strong>${orgName}</strong>? Confírmanos para apartar tu lugar.</p>
     <div style="margin-top:40px; border:1px #EFEFEF solid; border-radius:16px; padding:24px;">
       <h3 style="font-size:16px;">
       ${serviceName}
       </h3>
       <div style="color:#4B5563; heigth:20px; margin-bottom:8px; font-size:16px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/ElME1kr.png"/><p style="padding-top:4px; ">
         ${dateString}
       </p></div>
              <div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:16px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/sM63nU1.png"/><p style="padding-top:4px; ">Sesión de ${minutes} minutos</p></div>
              ${displayName ? `<div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:16px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/e1aqMlR.png"/><p style="padding-top:4px; " >Con ${displayName}</p></div>` : ""}
       ${address ? `<div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:16px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/yJvhZFx.png"/><p style="padding-top:4px; " >${address}</p></div>` : ""}

  </div>
    <a href="${confirmLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#5158F6; color:white; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:32px; margin-right:8px;">
      Confirmar cita
    </a>
    ${
      meetingLink
        ? `<a href="${meetingLink}" target="blank" style="display:inline-block; box-sizing:border-box; background:#F5F5F5; color:#11151A; font-size:16px; font-family:Arial,sans-serif; font-weight:500; text-decoration:none; text-align:center; padding:14px 32px; border-radius:24px; min-width:200px; margin-top:16px;">
      Unirme a la reunión
    </a>`
        : ""
    }
    <p style="font-size:16px; color:#4B5563; margin-top:24px;">Ve a <a href="https://www.denik.me/mi-cuenta" target="blank" style="color:#5158F6; text-decoration:underline;">tu cuenta Deník</a> para administrar tus citas.</p>

  </div>
  <div>
    <p style="font-size:12px; color:#8391A1; margin-top:64px;">Recuerda que tu compra es válida para el servicio y horario en el que reservaste. ${termsAndConditions ?? `Para cambios en tu reserva tienes hasta 3 horas antes del servicio contratado un máximo de 2 veces. Para cancelaciones tienes hasta 24 hrs antes de la reserva, si tienes problemas con la devolución ponte en contacto directo con ${orgName}. Deník solo actúa como intermediario en la gestión y procesamiento de reservas.`}</p>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">

   <a href="https://www.denik.me" target="blank" style="text-decoration:none">
     <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník.me® ${new Date().getFullYear()}</p>
    </a>


</div>
</body>
`
