export default ({
  modifyLink,
  cancelLink,
  serviceName,
  dateString,
  minutes,
  displayName,
  address,
  orgName,
  customerName,
  hoursUntil,
}: {
  modifyLink: string
  cancelLink: string
  serviceName?: string
  dateString?: string
  minutes?: string | number
  displayName?: string
  address?: string
  customerName?: string
  orgName?: string
  hoursUntil?: number
}) => `
<body style="font-family:Arial; background-color:#F8F8F8;padding:24px; ">
<div style="min-width:360px; max-width:480px; margin:0 auto;padding:24px; background-color:#ffffff; border-radius:24px;">
  <div >
    <img alt="logo" style="width:120px;" src="https://i.imgur.com/sunNMiV.png"/>
  </div>
  <div style="text-align:left; background:white; border-radius:16px; margin-top:16px; ">
    <h2 style="color:#15191E; font-size:20px; margin-top:24px">${customerName}, tu cita es ${hoursUntil === 1 ? "en 1 hora" : `en ${hoursUntil} horas`}</h2>
    <p style="margin-top:14px; color:#4B5563">Este es un recordatorio de tu cita en <strong>${orgName}</strong></p>
     <div style="margin-top:40px; border:1px #EFEFEF solid; border-radius:16px; padding:24px;">
       <h3 style="font-size:16px;">
       ${serviceName}
       </h3>
       <div style="color:#4B5563; heigth:20px; margin-bottom:8px; font-size:14px;"><img style="width:24px; height:24px; float:left; margin-right:8px;" src="https://i.imgur.com/ElME1kr.png"/><p style="padding-top:4px; ">
         ${dateString}
       </p></div>
              <div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:14px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/sM63nU1.png"/><p style="padding-top:4px; ">Sesión de ${minutes} minutos</p></div>
              <div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:14px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/e1aqMlR.png"/><p style="padding-top:4px; " >Con ${displayName}</p></div>
       <div style="color:#4B5563; heigth:20px; margin-bottom:8px;font-size:14px;"><img style="width:24px; height:24px;  float:left; margin-right:8px;" src="https://i.imgur.com/yJvhZFx.png"/><p style="padding-top:4px; " >
${address}
       </p></div>

  </div>
            <a style="text-decoration:none;" href="${modifyLink}" target="blank">
    <button style="background:#5158F6; height:40px; border-radius:20px; border:none; color:white; width:160px; margin-top:40px; cursor:pointer;">
      Modificar cita
    </button>
    </a>
    <a style="text-decoration:none;" href="${cancelLink}" target="blank">
    <button style="background:#F5F5F5; height:40px; border-radius:20px; border:none; color:#11151A; width:160px; margin-top:40px;margin-left:16px; cursor:pointer;">
      Cancelar cita
    </button>
    </a>

  </div>
  <div>
    <p style="font-size:12px; color:#8391A1; margin-top:64px;">Recuerda que tu compra es válida para el servicio y horario en el que reservaste. Para cambios en tu reserva tienes hasta 3 horas antes del servicio contratado un máximo de 2 veces. Para cancelaciones tienes hasta 24 hrs antes de la reserva, si tienes problemas con la devolución ponte en contacto directo con ${orgName}. Deník solo actúa como intermediario en la gestión y procesamiento de reservas.</p>
  </div>
  <div style="text-align:center; margin-top:32px; margin-bottom:16px">

   <a href="https://www.denik.me" target="blank" style="text-decoration:none">
     <p style="color:#5158F6;font-size:10px;cursor:pointer;">Derechos reservados Deník© 2024</p>
    </a>


</div>
</body>
`
